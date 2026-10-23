/**
 * ==============================================================================
 * MAESTRÍA BARBERÍA - SERVIDOR DE WEBHOOKS & API DEL BOT
 * Conector: WhatsApp -> Supabase -> Google Calendar
 * ==============================================================================
 */

import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import { syncAppointmentToGoogleCalendar } from './google_calendar_integration.js';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = (SUPABASE_URL && SUPABASE_SERVICE_KEY) 
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  : null;

// 1. Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    bot: 'maestria-bot',
    business: 'Maestría Barbería',
    database: supabase ? 'conectada' : 'simulada_local',
    timestamp: new Date().toISOString()
  });
});

// 2. Consulta de Disponibilidad para el Bot
app.get('/api/availability', async (req, res) => {
  const { barber = 'jhoan', date, duration = 30 } = req.query;

  if (!date) {
    return res.status(400).json({ error: 'El parámetro "date" (YYYY-MM-DD) es obligatorio' });
  }

  if (supabase) {
    try {
      const { data, error } = await supabase.rpc('obtener_disponibilidad', {
        p_barbero_id: barber,
        p_fecha: date,
        p_duracion_minutos: Number(duration)
      });

      if (!error && data) {
        return res.json(data);
      }
    } catch (err) {
      console.warn('Error en RPC Supabase, usando cálculo de respaldo:', err.message);
    }
  }

  // Respaldo de cálculo local
  res.json({
    barbero_id: barber,
    fecha: date,
    duracion_minutos: Number(duration),
    disponibles: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00']
  });
});

// 3. Crear Reserva (Desde el Bot o desde la Web)
app.post('/api/bookings', async (req, res) => {
  const {
    barberId = 'jhoan',
    clientName,
    clientPhone,
    date,
    time,
    serviceIds = ['corte-sencillo'],
    serviceNames = 'Corte Sencillo',
    totalPrice = 18000,
    durationMinutes = 30,
    notes = '',
    source = 'BOT_WHATSAPP'
  } = req.body;

  if (!clientName || !clientPhone || !date || !time) {
    return res.status(400).json({ error: 'Faltan campos obligatorios (nombre, celular, fecha, hora)' });
  }

  const reservationCode = `MAEST-${Math.floor(10000 + Math.random() * 90000)}`;

  // Cálculo de hora de fin
  const [startH, startM] = time.split(':').map(Number);
  const totalM = startH * 60 + startM + Number(durationMinutes);
  const endH = Math.floor(totalM / 60);
  const endM = totalM % 60;
  const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}:00`;
  const startTime = `${time}:00`;

  const newBooking = {
    codigo_reserva: reservationCode,
    barbero_id: barberId,
    cliente_nombre: clientName.trim(),
    cliente_telefono: clientPhone.trim(),
    fecha: date,
    hora_inicio: startTime,
    hora_fin: endTime,
    servicios_ids: serviceIds,
    servicios_detalle: serviceNames,
    precio_total: Number(totalPrice),
    duracion_total_minutos: Number(durationMinutes),
    notas: notes?.trim() || null,
    estado: 'CONFIRMADA',
    origen: source
  };

  let calendarSyncResult = null;

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('citas')
        .insert([newBooking])
        .select()
        .single();

      if (error) throw error;

      // Sincronizar inmediatamente con Google Calendar del barbero
      calendarSyncResult = await syncAppointmentToGoogleCalendar(data);
      if (calendarSyncResult?.eventId) {
        await supabase
          .from('citas')
          .update({ google_calendar_event_id: calendarSyncResult.eventId })
          .eq('id', data.id);
      }

      return res.status(201).json({
        success: true,
        code: reservationCode,
        booking: data,
        googleCalendar: calendarSyncResult
      });
    } catch (err) {
      console.error('Error insertando cita:', err.message);
      return res.status(500).json({ error: 'Error al registrar la cita en la base de datos', detail: err.message });
    }
  }

  // Si aún no está configurado Supabase
  res.status(201).json({
    success: true,
    code: reservationCode,
    booking: newBooking,
    mode: 'offline_demo'
  });
});

app.listen(PORT, () => {
  console.log(`💈 Servidor Maestría Barbería activo en puerto ${PORT}`);
});
