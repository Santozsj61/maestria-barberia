import { createClient } from '@supabase/supabase-js';
import { config } from './config.js';
import { evolutionClient } from './evolutionClient.js';
import { syncAppointmentToGoogleCalendar } from './google_calendar_integration.js';

const supabase = (config.supabaseUrl && config.supabaseKey)
  ? createClient(config.supabaseUrl, config.supabaseKey)
  : null;

// Gestor de sesiones activas en memoria: { [phone]: sessionState }
const sessions = new Map();

/**
 * Procesa un mensaje entrante de WhatsApp y ejecuta la lógica conversacional de maestria-bot
 */
export async function processIncomingMessage(fromPhone, messageText) {
  const text = (messageText || '').trim();
  const lower = text.toLowerCase();

  // Obtener o inicializar sesión del cliente
  let session = sessions.get(fromPhone);
  if (!session || lower === 'reiniciar' || lower === 'inicio' || lower === 'hola' && (!session || session.step === 'COMPLETED')) {
    session = {
      phone: fromPhone.replace(/\D/g, ''),
      step: 'START',
      barber: null,
      service: null,
      date: null,
      time: null,
      clientName: null,
      availableSlots: [],
      updatedAt: Date.now()
    };
    sessions.set(fromPhone, session);
  }

  session.updatedAt = Date.now();

  // Comando global de reinicio
  if (lower === 'cancelar' || lower === 'salir') {
    sessions.delete(fromPhone);
    return evolutionClient.sendTextMessage(
      fromPhone,
      '💈 Proceso cancelado. Cuando quieras agendar una nueva cita en *Maestría Barbería*, solo escribe *Hola*.'
    );
  }

  // Máquina de estados conversacional de maestria-bot
  switch (session.step) {
    case 'START': {
      session.step = 'AWAITING_BARBER';
      const menu = 
`¡Hola! 💈 Soy *maestria-bot*, tu asistente de reservas de *Maestría Barbería*.

Estoy listo para agendar tu turno en segundos.
¿Con quién te gustaría motilarte?

1️⃣ *Jhoan* (Especialista en degradados y diseño)
2️⃣ *Kevin* (Especialista en barba y cortes clásicos)
3️⃣ *Cualquiera disponible*

_Responde con el número de tu opción (1, 2 o 3)_`;

      return evolutionClient.sendTextMessage(fromPhone, menu);
    }

    case 'AWAITING_BARBER': {
      if (text === '1' || lower.includes('jhoan')) {
        session.barber = 'jhoan';
      } else if (text === '2' || lower.includes('kevin')) {
        session.barber = 'kevin';
      } else if (text === '3' || lower.includes('cualquiera')) {
        session.barber = Math.random() > 0.5 ? 'jhoan' : 'kevin';
      } else {
        return evolutionClient.sendTextMessage(
          fromPhone,
          '⚠️ Por favor elige una opción válida:\n1️⃣ Jhoan\n2️⃣ Kevin\n3️⃣ Cualquiera disponible'
        );
      }

      const barberName = session.barber === 'kevin' ? 'Kevin' : 'Jhoan';
      session.step = 'AWAITING_SERVICE';

      let servicesList = `Excelente elección con *${barberName}* ✂️\n¿Qué servicio deseas realizarte?\n\n`;
      config.services.forEach((s, idx) => {
        servicesList += `${idx + 1}️⃣ *${s.name}* — $${s.price.toLocaleString('es-CO')} (${s.duration} min)\n`;
      });
      servicesList += `\n_Responde con el número del servicio (ejemplo: 2)_`;

      return evolutionClient.sendTextMessage(fromPhone, servicesList);
    }

    case 'AWAITING_SERVICE': {
      const serviceIdx = parseInt(text, 10) - 1;
      const selectedService = config.services[serviceIdx];

      if (!selectedService) {
        return evolutionClient.sendTextMessage(
          fromPhone,
          '⚠️ Por favor escribe el número de uno de los servicios del menú (del 1 al 6).'
        );
      }

      session.service = selectedService;
      session.step = 'AWAITING_DATE';

      const promptDate = 
`Has seleccionado: *${selectedService.name}* ($${selectedService.price.toLocaleString('es-CO')} COP).

¿Para qué día deseas tu cita?
1️⃣ *Hoy*
2️⃣ *Mañana*
3️⃣ Escribe la fecha en formato día/mes (ej: *25/10*)`;

      return evolutionClient.sendTextMessage(fromPhone, promptDate);
    }

    case 'AWAITING_DATE': {
      const today = new Date();
      let targetDateStr = '';

      if (text === '1' || lower.includes('hoy')) {
        targetDateStr = today.toISOString().split('T')[0];
      } else if (text === '2' || lower.includes('mañana')) {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        targetDateStr = tomorrow.toISOString().split('T')[0];
      } else if (text.includes('/')) {
        const parts = text.split('/');
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = today.getFullYear();
        targetDateStr = `${year}-${month}-${day}`;
      } else {
        return evolutionClient.sendTextMessage(
          fromPhone,
          '⚠️ Formato de fecha no reconocido. Responde *1* para Hoy, *2* para Mañana, o escribe la fecha como *24/10*.'
        );
      }

      session.date = targetDateStr;

      // Consultar disponibilidad en tiempo real (Supabase RPC o local)
      const slots = await getAvailableSlots(session.barber, session.date, session.service.duration);
      session.availableSlots = slots;

      if (!slots || slots.length === 0) {
        return evolutionClient.sendTextMessage(
          fromPhone,
          `⚠️ Lo sentimos, para la fecha *${session.date}* ya no quedan turnos disponibles con este barbero.\n\nEscribe *1* para probar otra fecha o escribe *Cancelar*.`
        );
      }

      session.step = 'AWAITING_TIME';

      let msgSlots = `⏰ Horarios disponibles para el *${session.date}*:\n\n`;
      slots.slice(0, 8).forEach((slot, idx) => {
        msgSlots += `${idx + 1}️⃣ *${slot}*\n`;
      });
      msgSlots += `\n_Responde con el número de la hora que prefieras (ejemplo: 1 o escribe 04:00)_`;

      return evolutionClient.sendTextMessage(fromPhone, msgSlots);
    }

    case 'AWAITING_TIME': {
      let chosenTime = '';
      const slotNum = parseInt(text, 10);

      if (!isNaN(slotNum) && slotNum >= 1 && slotNum <= session.availableSlots.length) {
        chosenTime = session.availableSlots[slotNum - 1];
      } else if (session.availableSlots.includes(text)) {
        chosenTime = text;
      } else {
        return evolutionClient.sendTextMessage(
          fromPhone,
          '⚠️ Horario no válido o ya ocupado. Por favor responde con el número de una de las opciones mostradas.'
        );
      }

      session.time = chosenTime;
      session.step = 'AWAITING_NAME';

      return evolutionClient.sendTextMessage(
        fromPhone,
        `Perfecto a las *${session.time}* 👍\n\nPara finalizar el registro, por favor escribe tu *Nombre Completo*:`
      );
    }

    case 'AWAITING_NAME': {
      if (text.length < 3) {
        return evolutionClient.sendTextMessage(
          fromPhone,
          '⚠️ Por favor escribe tu nombre y apellido completo.'
        );
      }

      session.clientName = text;
      session.step = 'AWAITING_CONFIRMATION';

      const barberName = session.barber === 'kevin' ? 'Kevin' : 'Jhoan';

      const summary = 
`📋 *RESUMEN DE TU CITA — MAESTRÍA BARBERÍA*

👤 *Cliente:* ${session.clientName}
📱 *Celular:* ${session.phone}
💈 *Barbero:* ${barberName}
✂️ *Servicio:* ${session.service.name}
💰 *Total:* $${session.service.price.toLocaleString('es-CO')} COP
📅 *Fecha:* ${session.date}
⏰ *Hora:* ${session.time}
📍 *Lugar:* Calle 30 # 18 - 29 B/ La Colombina

¿Confirmas tu reserva?
👉 Responde *SÍ* para confirmar o *NO* para cancelar.`;

      return evolutionClient.sendTextMessage(fromPhone, summary);
    }

    case 'AWAITING_CONFIRMATION': {
      if (lower === 'si' || lower === 'sí' || lower === 'confirmar' || lower === 'confirmo' || lower === '1') {
        const code = `MAEST-${Math.floor(10000 + Math.random() * 90000)}`;

        // Calcular hora de fin
        const [h, m] = session.time.split(':').map(Number);
        const endTotal = h * 60 + m + session.service.duration;
        const endH = Math.floor(endTotal / 60);
        const endM = endTotal % 60;
        const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}:00`;

        const bookingPayload = {
          codigo_reserva: code,
          barbero_id: session.barber,
          cliente_nombre: session.clientName,
          cliente_telefono: session.phone,
          fecha: session.date,
          hora_inicio: `${session.time}:00`,
          hora_fin: endTime,
          servicios_ids: [session.service.id],
          servicios_detalle: session.service.name,
          precio_total: session.service.price,
          duracion_total_minutos: session.service.duration,
          estado: 'CONFIRMADA',
          origen: 'BOT_WHATSAPP'
        };

        // Guardar en Supabase
        if (supabase) {
          try {
            await supabase.from('citas').insert([bookingPayload]);
          } catch (e) {
            console.error('Error insertando cita en Supabase desde el bot:', e);
          }
        }

        // Sincronizar en Google Calendar del barbero
        try {
          await syncAppointmentToGoogleCalendar(bookingPayload);
        } catch (e) {
          console.warn('Advertencia en Google Calendar:', e);
        }

        session.step = 'COMPLETED';
        sessions.delete(fromPhone);

        const confirmationMsg = 
`🎉 *¡TU CITA HA SIDO AGENDADA CON ÉXITO!*

Código Oficial: *${code}*
💈 *Barbero:* ${session.barber === 'kevin' ? 'Kevin' : 'Jhoan'}
📅 *Fecha:* ${session.date} a las *${session.time}*
✂️ *Servicio:* ${session.service.name} ($${session.service.price.toLocaleString('es-CO')})
📍 *Dirección:* Calle 30 # 18 - 29 B/ La Colombina

Ya está agendado en el calendario de ${session.barber === 'kevin' ? 'Kevin' : 'Jhoan'}.
_Por favor llega 5 minutos antes. ¡Te esperamos en Maestría Barbería! 💈_`;

        return evolutionClient.sendTextMessage(fromPhone, confirmationMsg);
      } else {
        sessions.delete(fromPhone);
        return evolutionClient.sendTextMessage(
          fromPhone,
          '❌ Reserva cancelada. Cuando desees volver a agendar escribe *Hola* 💈.'
        );
      }
    }

    default:
      session.step = 'START';
      return evolutionClient.sendTextMessage(
        fromPhone,
        '💈 Escribe *Hola* para agendar una cita en *Maestría Barbería*.'
      );
  }
}

/**
 * Consulta de horarios disponibles (Supabase RPC o cálculo local)
 */
async function getAvailableSlots(barberId, dateStr, durationMinutes = 30) {
  if (supabase) {
    try {
      const { data, error } = await supabase.rpc('obtener_disponibilidad', {
        p_barbero_id: barberId,
        p_fecha: dateStr,
        p_duracion_minutos: durationMinutes
      });
      if (!error && data && Array.isArray(data.disponibles)) {
        return data.disponibles;
      }
    } catch (e) {}
  }

  // Fallback por día de semana
  const dateObj = new Date(dateStr + 'T12:00:00Z');
  const dow = dateObj.getUTCDay();
  let startH = 9, endH = 20;
  if (dow === 0) { startH = 9; endH = 13; }
  else if (dow === 5 || dow === 6) { startH = 8; endH = 21; }

  const slots = [];
  for (let h = startH; h < endH; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
    slots.push(`${String(h).padStart(2, '0')}:30`);
  }
  return slots;
}
