/**
 * ==============================================================================
 * MAESTRÍA-BOT — SERVIDOR EN LA NUBE (NODE.JS + EXPRESS + EVOLUTION API)
 * Sincronización completa: WhatsApp -> Supabase -> Google Calendar
 * ==============================================================================
 */

import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { processIncomingMessage } from './botEngine.js';
import { syncAppointmentToGoogleCalendar } from './google_calendar_integration.js';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(cors());
app.use(express.json());

const supabase = (config.supabaseUrl && config.supabaseKey)
  ? createClient(config.supabaseUrl, config.supabaseKey)
  : null;

// 1. Estado y Monitoreo del Servidor
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    bot: 'maestria-bot',
    business: config.business.name,
    supabase: supabase ? 'conectado' : 'modo_offline',
    googleCalendar: Boolean(config.googleClientEmail && config.googlePrivateKey),
    timestamp: new Date().toISOString()
  });
});

// 2. Webhook Receptor de Mensajes de Evolution API (WhatsApp)
app.post(['/webhook/evolution', '/webhook/whatsapp'], async (req, res) => {
  // Responder de inmediato 200 OK a Evolution API para evitar reintentos
  res.status(200).send('EVENT_RECEIVED');

  try {
    const payload = req.body;
    
    // Validar tipo de evento de Evolution API
    // Evento: messages.upsert
    if (payload.event !== 'messages.upsert' && !payload.data) {
      return;
    }

    const messageData = payload.data;
    const isFromMe = messageData?.key?.fromMe;
    const remoteJid = messageData?.key?.remoteJid;

    // Ignorar mensajes enviados por el propio bot o mensajes de grupos (@g.us)
    if (isFromMe || !remoteJid || remoteJid.includes('@g.us')) {
      return;
    }

    // Extraer texto del mensaje entrante
    const messageContent = messageData.message;
    const incomingText = 
      messageContent?.conversation || 
      messageContent?.extendedTextMessage?.text || 
      messageContent?.buttonsResponseMessage?.selectedDisplayText || 
      messageContent?.listResponseMessage?.singleSelectReply?.selectedRowId ||
      '';

    if (!incomingText) return;

    console.log(`[WhatsApp entrante de ${remoteJid}]: ${incomingText}`);

    // Procesar con el motor conversacional de maestria-bot
    await processIncomingMessage(remoteJid, incomingText);

  } catch (error) {
    console.error('Error procesando webhook de WhatsApp:', error);
  }
});

// 3. Endpoint de Prueba Directo (Para probar maestria-bot sin WhatsApp)
app.post('/api/test-chat', async (req, res) => {
  const { phone = '573123456789@s.whatsapp.net', message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Debes enviar el campo "message"' });
  }

  try {
    const result = await processIncomingMessage(phone, message);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. API de Disponibilidad para la Web
app.get('/api/availability', async (req, res) => {
  const { barber = 'jhoan', date, duration = 30 } = req.query;
  if (!date) {
    return res.status(400).json({ error: 'Parámetro date es obligatorio (YYYY-MM-DD)' });
  }

  if (supabase) {
    try {
      const { data, error } = await supabase.rpc('obtener_disponibilidad', {
        p_barbero_id: barber,
        p_fecha: date,
        p_duracion_minutos: Number(duration)
      });
      if (!error && data) return res.json(data);
    } catch (e) {}
  }

  res.json({
    barbero_id: barber,
    fecha: date,
    duracion_minutos: Number(duration),
    disponibles: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00']
  });
});

// 5. API de Creación de Cita (Desde la Web o aplicaciones externas)
app.post('/api/bookings', async (req, res) => {
  const {
    barberId,
    clientName,
    clientPhone,
    date,
    time,
    serviceIds,
    serviceNames,
    totalPrice,
    durationMinutes = 45,
    notes,
    source = 'WEB_APP'
  } = req.body;

  if (!clientName || !clientPhone || !date || !time) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const reservationCode = `MAEST-${Math.floor(10000 + Math.random() * 90000)}`;
  const [startH, startM] = time.split(':').map(Number);
  const totalM = startH * 60 + startM + Number(durationMinutes);
  const endH = Math.floor(totalM / 60);
  const endM = totalM % 60;
  const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}:00`;

  const newBooking = {
    codigo_reserva: reservationCode,
    barbero_id: barberId,
    cliente_nombre: clientName.trim(),
    cliente_telefono: clientPhone.trim(),
    fecha: date,
    hora_inicio: `${time}:00`,
    hora_fin: endTime,
    servicios_ids: serviceIds || [],
    servicios_detalle: serviceNames || 'Corte',
    precio_total: Number(totalPrice) || 0,
    duracion_total_minutos: Number(durationMinutes),
    notas: notes?.trim() || null,
    estado: 'CONFIRMADA',
    origen: source
  };

  if (supabase) {
    try {
      const { data, error } = await supabase.from('citas').insert([newBooking]).select().single();
      if (error) throw error;

      // Sincronizar en Google Calendar del barbero
      const calRes = await syncAppointmentToGoogleCalendar(data);
      if (calRes?.eventId) {
        await supabase.from('citas').update({ google_calendar_event_id: calRes.eventId }).eq('id', data.id);
      }

      return res.status(201).json({ success: true, booking: data, googleCalendar: calRes });
    } catch (err) {
      return res.status(500).json({ error: 'Error guardando en Supabase', detail: err.message });
    }
  }

  res.status(201).json({ success: true, booking: newBooking, mode: 'local' });
});

app.listen(config.port, () => {
  console.log(`💈 maestria-bot activo y escuchando en el puerto ${config.port}`);
  console.log(`👉 Webhook Evolution API: http://localhost:${config.port}/webhook/evolution`);
});
