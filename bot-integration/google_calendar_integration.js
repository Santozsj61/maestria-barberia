/**
 * ==============================================================================
 * MAESTRÍA BARBERÍA - SERVICIO DE GOOGLE CALENDAR
 * Sincroniza citas en los calendarios móviles de Jhoan y Kevin
 * Zona horaria: America/Bogota (UTC-5)
 * ==============================================================================
 */

import { google } from 'googleapis';

// Credenciales de Service Account de Google Cloud
// Se configuran como variables de entorno
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

// IDs de los calendarios de los barberos (su correo de Gmail o ID de calendario secundario)
const BARBER_CALENDARS = {
  jhoan: process.env.GOOGLE_CALENDAR_JHOAN || 'jhoan@maestriabarberia.com',
  kevin: process.env.GOOGLE_CALENDAR_KEVIN || 'kevin@maestriabarberia.com'
};

/**
 * Inicializa cliente autenticado de Google Calendar
 */
function getCalendarClient() {
  if (!GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY) {
    console.warn('⚠️ Google Calendar: Faltan variables GOOGLE_CLIENT_EMAIL o GOOGLE_PRIVATE_KEY');
    return null;
  }

  const auth = new google.auth.JWT(
    GOOGLE_CLIENT_EMAIL,
    null,
    GOOGLE_PRIVATE_KEY,
    ['https://www.googleapis.com/auth/calendar']
  );

  return google.calendar({ version: 'v3', auth });
}

/**
 * Inserta un evento de cita en el calendario del barbero
 */
export async function syncAppointmentToGoogleCalendar(booking) {
  const calendar = getCalendarClient();
  if (!calendar) {
    return { success: false, reason: 'Google Calendar no configurado' };
  }

  const targetCalendarId = BARBER_CALENDARS[booking.barbero_id] || BARBER_CALENDARS.jhoan;

  // Fechas en formato ISO con zona horaria de Colombia
  const startDateTime = `${booking.fecha}T${booking.hora_inicio.slice(0, 5)}:00-05:00`;
  const endDateTime = `${booking.fecha}T${booking.hora_fin.slice(0, 5)}:00-05:00`;

  const barberoNombre = booking.barbero_id === 'kevin' ? 'Kevin' : 'Jhoan';

  const eventPayload = {
    summary: `💈 ${booking.servicios_detalle} — ${booking.cliente_nombre}`,
    location: 'Calle 30 # 18 - 29 B/ La Colombina, Maestría Barbería',
    description: [
      `Código de Reserva: ${booking.codigo_reserva}`,
      `Cliente: ${booking.cliente_nombre}`,
      `Teléfono: +57 ${booking.cliente_telefono} (https://wa.me/57${booking.cliente_telefono})`,
      `Barbero: ${barberoNombre}`,
      `Servicios: ${booking.servicios_detalle}`,
      `Total: $${Number(booking.precio_total).toLocaleString('es-CO')} COP`,
      `Duración: ${booking.duracion_total_minutos} min`,
      booking.notas ? `Notas: ${booking.notas}` : '',
      `Origen: ${booking.origen === 'BOT_WHATSAPP' ? '🤖 Bot de WhatsApp' : '🌐 App Web'}`
    ].filter(Boolean).join('\n'),
    start: {
      dateTime: startDateTime,
      timeZone: 'America/Bogota'
    },
    end: {
      dateTime: endDateTime,
      timeZone: 'America/Bogota'
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 15 },
        { method: 'popup', minutes: 60 }
      ]
    },
    colorId: booking.barbero_id === 'kevin' ? '5' : '9' // Colores diferenciados por barbero
  };

  try {
    const response = await calendar.events.insert({
      calendarId: targetCalendarId,
      requestBody: eventPayload
    });

    console.log(`✓ Cita sincronizada con Google Calendar (${barberoNombre}): ${response.data.id}`);
    return {
      success: true,
      eventId: response.data.id,
      htmlLink: response.data.htmlLink
    };
  } catch (error) {
    console.error('Error insertando evento en Google Calendar:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Elimina un evento de Google Calendar cuando se cancela una cita
 */
export async function removeAppointmentFromGoogleCalendar(barberId, eventId) {
  const calendar = getCalendarClient();
  if (!calendar || !eventId) return { success: false };

  const targetCalendarId = BARBER_CALENDARS[barberId] || BARBER_CALENDARS.jhoan;

  try {
    await calendar.events.delete({
      calendarId: targetCalendarId,
      eventId: eventId
    });
    console.log(`✓ Evento cancelado en Google Calendar: ${eventId}`);
    return { success: true };
  } catch (error) {
    console.error('Error eliminando evento de Google Calendar:', error.message);
    return { success: false, error: error.message };
  }
}
