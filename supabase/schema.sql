-- ==============================================================================
-- MAESTRÍA BARBERÍA - ESQUEMA CENTRAL DE BASE DE DATOS (SUPABASE / POSTGRESQL)
-- Sincronización: Bot WhatsApp + App Web + Google Calendar
-- ==============================================================================

-- 1. Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA: BARBEROS
CREATE TABLE IF NOT EXISTS public.barberos (
    id TEXT PRIMARY KEY,                       -- 'jhoan', 'kevin'
    nombre TEXT NOT NULL,                      -- 'Jhoan', 'Kevin'
    role TEXT DEFAULT 'Barber Stylist',
    telefono TEXT,                             -- WhatsApp directo del barbero para alertas
    google_calendar_id TEXT,                   -- ID o correo de Google Calendar (ej: jhoan@gmail.com)
    instagram TEXT,
    foto_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA: SERVICIOS
CREATE TABLE IF NOT EXISTS public.servicios (
    id TEXT PRIMARY KEY,                       -- 'corte-sencillo', 'corte-barba', etc.
    nombre TEXT NOT NULL,
    descripcion TEXT,
    precio NUMERIC NOT NULL DEFAULT 0,
    duracion_minutos INTEGER NOT NULL DEFAULT 30,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA: CITAS / RESERVAS
CREATE TABLE IF NOT EXISTS public.citas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    codigo_reserva TEXT UNIQUE NOT NULL,       -- Ej: 'MAEST-48291'
    barbero_id TEXT NOT NULL REFERENCES public.barberos(id) ON DELETE RESTRICT,
    cliente_nombre TEXT NOT NULL,
    cliente_telefono TEXT NOT NULL,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    servicios_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    servicios_detalle TEXT NOT NULL,           -- Resumen legible: 'Corte + Barba'
    precio_total NUMERIC NOT NULL DEFAULT 0,
    duracion_total_minutos INTEGER NOT NULL DEFAULT 45,
    notas TEXT,
    estado TEXT NOT NULL DEFAULT 'CONFIRMADA' CHECK (estado IN ('CONFIRMADA', 'PENDIENTE', 'CANCELADA', 'COMPLETADA', 'NO_ASISTIO')),
    origen TEXT NOT NULL DEFAULT 'BOT_WHATSAPP' CHECK (origen IN ('BOT_WHATSAPP', 'WEB_APP', 'MANUAL')),
    google_calendar_event_id TEXT,             -- ID del evento en Google Calendar para sincronizar/cancelar
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLA: BLOQUEOS DE HORARIO (Almuerzo, citas médicas, descansos personales)
CREATE TABLE IF NOT EXISTS public.bloqueos_horario (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    barbero_id TEXT NOT NULL REFERENCES public.barberos(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    motivo TEXT DEFAULT 'Descanso / Almuerzo',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ÍNDICES DE ALTO RENDIMIENTO (Para búsquedas en milisegundos del Bot)
CREATE INDEX IF NOT EXISTS idx_citas_barbero_fecha_estado 
    ON public.citas(barbero_id, fecha, estado);

CREATE INDEX IF NOT EXISTS idx_citas_codigo 
    ON public.citas(codigo_reserva);

CREATE INDEX IF NOT EXISTS idx_citas_telefono 
    ON public.citas(cliente_telefono);

CREATE INDEX IF NOT EXISTS idx_bloqueos_barbero_fecha 
    ON public.bloqueos_horario(barbero_id, fecha);

-- 7. TRIGGER: Actualización automática de updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_citas_updated_at ON public.citas;
CREATE TRIGGER trigger_citas_updated_at
    BEFORE UPDATE ON public.citas
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 8. FUNCIÓN RPC: CONSULTAR HORARIOS LIBRES EN TIEMPO REAL
-- Devuelve los bloques de tiempo libres en formato JSON según la jornada oficial de Maestría Barbería
CREATE OR REPLACE FUNCTION public.obtener_disponibilidad(
    p_barbero_id TEXT,
    p_fecha DATE,
    p_duracion_minutos INTEGER DEFAULT 30
)
RETURNS JSONB AS $$
DECLARE
    v_dow INTEGER;               -- 0: Domingo, 1: Lunes, ..., 6: Sábado
    v_hora_inicio TIME;
    v_hora_fin TIME;
    v_slot_actual TIME;
    v_slot_fin TIME;
    v_horas_disponibles JSONB := '[]'::jsonb;
    v_esta_ocupado BOOLEAN;
BEGIN
    -- Determinar día de la semana
    v_dow := EXTRACT(DOW FROM p_fecha);

    -- Horarios Oficiales Maestría Barbería:
    -- Domingo: 9:00 AM a 1:00 PM
    -- Viernes y Sábado: 8:00 AM a 9:00 PM
    -- Lunes a Jueves: 9:00 AM a 8:30 PM
    IF v_dow = 0 THEN
        v_hora_inicio := '09:00:00'::time;
        v_hora_fin := '13:00:00'::time;
    ELSIF v_dow IN (5, 6) THEN
        v_hora_inicio := '08:00:00'::time;
        v_hora_fin := '21:00:00'::time;
    ELSE
        v_hora_inicio := '09:00:00'::time;
        v_hora_fin := '20:30:00'::time;
    END IF;

    -- Iterar en intervalos de 30 minutos
    v_slot_actual := v_hora_inicio;
    WHILE (v_slot_actual + (p_duracion_minutos || ' minutes')::interval) <= v_hora_fin LOOP
        v_slot_fin := (v_slot_actual + (p_duracion_minutos || ' minutes')::interval)::time;

        -- Verificar si existe solapamiento con citas confirmadas o bloqueos
        SELECT EXISTS (
            SELECT 1 FROM public.citas c
            WHERE c.barbero_id = p_barbero_id
              AND c.fecha = p_fecha
              AND c.estado IN ('CONFIRMADA', 'PENDIENTE')
              AND (
                  (c.hora_inicio < v_slot_fin AND c.hora_fin > v_slot_actual)
              )
            UNION ALL
            SELECT 1 FROM public.bloqueos_horario b
            WHERE b.barbero_id = p_barbero_id
              AND b.fecha = p_fecha
              AND (
                  (b.hora_inicio < v_slot_fin AND b.hora_fin > v_slot_actual)
              )
        ) INTO v_esta_ocupado;

        IF NOT v_esta_ocupado THEN
            v_horas_disponibles := v_horas_disponibles || to_jsonb(to_char(v_slot_actual, 'HH24:MI'));
        END IF;

        -- Avanzar al siguiente intervalo de 30 minutos
        v_slot_actual := (v_slot_actual + '30 minutes'::interval)::time;
    END LOOP;

    RETURN jsonb_build_object(
        'barbero_id', p_barbero_id,
        'fecha', p_fecha,
        'duracion_minutos', p_duracion_minutos,
        'horario_tienda', jsonb_build_object(
            'apertura', to_char(v_hora_inicio, 'HH24:MI'),
            'cierre', to_char(v_hora_fin, 'HH24:MI')
        ),
        'disponibles', v_horas_disponibles
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. DATOS INICIALES (SEED DATA): BARBEROS OFICIALES
INSERT INTO public.barberos (id, nombre, role, telefono, google_calendar_id, instagram, foto_url)
VALUES 
    ('jhoan', 'Jhoan', 'Barber Stylist', '3161277718', 'jhoan@maestriabarberia.com', '@jhoan_o204', '/assets/barber-sample-1.jpg'),
    ('kevin', 'Kevin', 'Barber Stylist', '3161277718', 'kevin@maestriabarberia.com', '@__050723', '/assets/barber-sample-2.jpg')
ON CONFLICT (id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    telefono = EXCLUDED.telefono;

-- 10. DATOS INICIALES (SEED DATA): SERVICIOS OFICIALES
INSERT INTO public.servicios (id, nombre, descripcion, precio, duracion_minutos)
VALUES
    ('corte-sencillo', 'Corte Sencillo', 'Incluye cejas o mascarilla de puntos negros', 18000, 30),
    ('corte-barba', 'Corte + Barba', 'Incluye cejas o mascarilla de puntos negros', 22000, 45),
    ('perfilado-barba', 'Perfilado de Barba', 'Definición y perfilado impecable con navaja y toalla caliente', 8000, 20),
    ('perfilado-cejas', 'Perfilado de Cejas', 'Diseño y limpieza milimétrica adaptada a tus facciones', 5000, 15),
    ('marcada', 'Marcada', 'Marcada y delineado nítido de contornos', 7000, 20),
    ('domicilio', 'Servicio a Domicilio', 'Atención personalizada en la comodidad de tu hogar (disponible con Jhoan y Kevin)', 30000, 60)
ON CONFLICT (id) DO UPDATE SET
    precio = EXCLUDED.precio,
    duracion_minutos = EXCLUDED.duracion_minutos,
    descripcion = EXCLUDED.descripcion;

-- 11. POLÍTICAS DE SEGURIDAD (ROW LEVEL SECURITY - RLS)
ALTER TABLE public.barberos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bloqueos_horario ENABLE ROW LEVEL SECURITY;

-- Lectura pública para la web y para el bot
CREATE POLICY "Permitir lectura publica de barberos" ON public.barberos FOR SELECT USING (true);
CREATE POLICY "Permitir lectura publica de servicios" ON public.servicios FOR SELECT USING (true);
CREATE POLICY "Permitir lectura de citas activas" ON public.citas FOR SELECT USING (true);
CREATE POLICY "Permitir lectura de bloqueos" ON public.bloqueos_horario FOR SELECT USING (true);

-- Inserción de citas permitida desde la web y el bot
CREATE POLICY "Permitir insertar citas publicamente" ON public.citas FOR INSERT WITH CHECK (true);

-- Actualización y cancelación permitida con código de reserva
CREATE POLICY "Permitir actualizar citas" ON public.citas FOR UPDATE USING (true);
