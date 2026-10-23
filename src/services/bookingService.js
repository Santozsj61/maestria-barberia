import { supabase, isSupabaseConfigured } from './supabaseClient.js';

/**
 * Servicio Central de Reservas - Maestría Barbería
 * Conecta la Web y el Bot de WhatsApp a Supabase y Google Calendar
 */
export const bookingService = {
  /**
   * Obtiene los horarios disponibles en tiempo real para un barbero y fecha
   */
  getAvailableSlots: async (barberId, dateStr, durationMinutes = 30) => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.rpc('obtener_disponibilidad', {
          p_barbero_id: barberId,
          p_fecha: dateStr,
          p_duracion_minutos: durationMinutes
        });

        if (!error && data && Array.isArray(data.disponibles)) {
          return data.disponibles;
        }
      } catch (err) {
        console.warn('Fallo al consultar disponibilidad en Supabase, usando cálculo local:', err);
      }
    }

    // Fallback local: Cálculo por jornada oficial de Maestría Barbería
    return calculateLocalSlots(dateStr, durationMinutes);
  },

  /**
   * Crea una nueva reserva desde la Web o el Bot
   */
  createBooking: async ({
    barberId,
    clientName,
    clientPhone,
    date,
    time,
    serviceIds = [],
    serviceNames = '',
    totalPrice = 0,
    durationMinutes = 45,
    notes = '',
    source = 'WEB_APP'
  }) => {
    const reservationCode = `MAEST-${Math.floor(10000 + Math.random() * 90000)}`;

    // Calcular hora de fin estimada
    const [startH, startM] = time.split(':').map(Number);
    const totalM = startH * 60 + startM + durationMinutes;
    const endH = Math.floor(totalM / 60);
    const endM = totalM % 60;
    const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}:00`;
    const startTimeFormatted = `${time}:00`;

    const bookingRecord = {
      codigo_reserva: reservationCode,
      barbero_id: barberId,
      cliente_nombre: clientName.trim(),
      cliente_telefono: clientPhone.trim(),
      fecha: date,
      hora_inicio: startTimeFormatted,
      hora_fin: endTime,
      servicios_ids: serviceIds,
      servicios_detalle: serviceNames,
      precio_total: totalPrice,
      duracion_total_minutos: durationMinutes,
      notas: notes?.trim() || null,
      estado: 'CONFIRMADA',
      origen: source
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('citas')
          .insert([bookingRecord])
          .select()
          .single();

        if (error) throw error;
        
        saveLocalHistory(data || bookingRecord);
        return { success: true, code: reservationCode, booking: data || bookingRecord };
      } catch (err) {
        console.warn('Error al guardar en Supabase, guardando en respaldo local:', err);
      }
    }

    // Respaldo local si Supabase no está enlazado todavía
    saveLocalHistory(bookingRecord);
    return { success: true, code: reservationCode, booking: bookingRecord };
  },

  /**
   * Cancela una reserva existente
   */
  cancelBooking: async (reservationCode) => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('citas')
          .update({ estado: 'CANCELADA' })
          .eq('codigo_reserva', reservationCode);

        if (error) throw error;
      } catch (err) {
        console.warn('Error al cancelar en Supabase:', err);
      }
    }
    return { success: true };
  }
};

/**
 * Cálculo de horarios oficiales de Maestría Barbería
 */
function calculateLocalSlots(dateStr, durationMinutes = 30) {
  if (!dateStr) return [];
  const parts = dateStr.split('-').map(Number);
  const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
  const dayOfWeek = dateObj.getDay();

  let startH = 9, startM = 0, endH = 20, endM = 30;

  if (dayOfWeek === 0) {
    // Domingo
    startH = 9; startM = 0; endH = 13; endM = 0;
  } else if (dayOfWeek === 5 || dayOfWeek === 6) {
    // Viernes y Sábado
    startH = 8; startM = 0; endH = 21; endM = 0;
  } else {
    // Lunes a Jueves
    startH = 9; startM = 0; endH = 20; endM = 30;
  }

  const slots = [];
  let current = startH * 60 + startM;
  const end = endH * 60 + endM;

  while (current + durationMinutes <= end) {
    const h = Math.floor(current / 60);
    const m = current % 60;
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    current += 30; // Bloques de selección cada 30 minutos
  }

  return slots;
}

function saveLocalHistory(booking) {
  try {
    const key = 'maestria_mis_reservas';
    const history = JSON.parse(localStorage.getItem(key) || '[]');
    history.unshift(booking);
    localStorage.setItem(key, JSON.stringify(history.slice(0, 10)));
  } catch (e) {}
}
