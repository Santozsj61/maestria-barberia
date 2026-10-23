# 🤖 API & Webhook de Integración: Bot de WhatsApp — Maestría Barbería

Esta documentación especifica cómo conectar cualquier Bot de WhatsApp (desarrollado en **n8n**, **Node.js**, **Python**, **ManyChat**, **Evolution API** o **Meta Cloud API**) a la base de datos central de **Maestría Barbería** y a **Google Calendar**.

---

## 📌 1. Arquitectura de Datos

- **Base de Datos:** PostgreSQL en Supabase.
- **Barberos Oficiales:**
  - `jhoan`: Jhoan (Barber Stylist)
  - `kevin`: Kevin (Barber Stylist)
- **Horarios Oficiales:**
  - **Lunes a Jueves:** 9:00 AM – 8:30 PM (09:00 a 20:30)
  - **Viernes y Sábados:** 8:00 AM – 9:00 PM (08:00 a 21:00)
  - **Domingos:** 9:00 AM – 1:00 PM (09:00 a 13:00)

---

## ⚡ 2. Endpoints para el Bot de WhatsApp

### A. Consultar Horarios Disponibles (Sin Choques de Turnos)
Antes de que el bot le ofrezca un horario al cliente, debe consultar los turnos libres para no agendar citas dobles:

- **Método:** `POST` o `RPC Supabase`
- **Función en Supabase:** `obtener_disponibilidad`
- **Parámetros:**
  ```json
  {
    "p_barbero_id": "jhoan",
    "p_fecha": "2026-10-24",
    "p_duracion_minutos": 45
  }
  ```
- **Respuesta:**
  ```json
  {
    "barbero_id": "jhoan",
    "fecha": "2026-10-24",
    "duracion_minutos": 45,
    "horario_tienda": {
      "apertura": "08:00",
      "cierre": "21:00"
    },
    "disponibles": [
      "08:00",
      "08:45",
      "09:30",
      "10:15",
      "11:00",
      "14:00",
      "14:45",
      "15:30"
    ]
  }
  ```

---

### B. Registrar Cita Confirmada desde el Bot
Una vez el cliente elige barbero, fecha, hora y servicio:

- **Tabla:** `citas` en Supabase
- **Operación:** `INSERT`
- **Payload:**
  ```json
  {
    "codigo_reserva": "MAEST-94821",
    "barbero_id": "jhoan",
    "cliente_nombre": "Carlos Ramírez",
    "cliente_telefono": "3123456789",
    "fecha": "2026-10-24",
    "hora_inicio": "14:00:00",
    "hora_fin": "14:45:00",
    "servicios_ids": ["corte-barba"],
    "servicios_detalle": "Corte + Barba",
    "precio_total": 22000,
    "duracion_total_minutos": 45,
    "notas": "Cliente con barba larga, pidió navaja tradicional",
    "estado": "CONFIRMADA",
    "origen": "BOT_WHATSAPP"
  }
  ```

---

## 📅 3. Sincronización con Google Calendar

Cuando entra la cita en Supabase, el disparador (`trigger` o servicio backend) inserta el evento en el calendario de Google del barbero:

- **Calendario Jhoan:** `jhoan@maestriabarberia.com` (o su cuenta Gmail vinculada)
- **Calendario Kevin:** `kevin@maestriabarberia.com` (o su cuenta Gmail vinculada)
- **Título del Evento:** `💈 [Corte + Barba] - Carlos Ramírez con Jhoan`
- **Descripción:**
  ```text
  Reserva: MAEST-94821
  Cliente: Carlos Ramírez
  Teléfono: +57 312 345 6789 (https://wa.me/573123456789)
  Servicios: Corte + Barba
  Total a Cobrar: $22.000 COP
  Notas: Cliente con barba larga, pidió navaja tradicional
  Origen: Bot de WhatsApp
  ```
- **Alerta Móvil:** Notificación sonora 15 minutos antes en el celular del barbero.

---

## 💬 4. Ejemplo de Conversación con el Bot de WhatsApp

```text
Cliente: Hola, quiero una cita para mañana sábado
Bot: ¡Hola! 💈 Bienvenido a Maestría Barbería.
     ¿Con qué barbero te gustaría atenderte?
     1. Jhoan
     2. Kevin
     3. Cualquiera disponible

Cliente: Con Kevin

Bot: Perfecto. ¿Qué servicio deseas realizarte?
     1. Corte Sencillo ($18.000 - 30 min)
     2. Corte + Barba ($22.000 - 45 min)
     3. Perfilado de Barba ($8.000 - 20 min)
     4. Perfilado de Cejas ($5.000 - 15 min)
     5. Marcada ($7.000 - 20 min)
     6. Servicio a Domicilio ($30.000 - 60 min)

Cliente: 2

Bot: Excelente, Corte + Barba con Kevin para mañana Sábado 24 de Octubre.
     Horarios disponibles:
     👉 09:00 AM | 10:30 AM | 02:00 PM | 03:30 PM | 05:00 PM
     ¿A qué hora te queda mejor?

Cliente: A las 2:00 PM

Bot: Por favor indícame tu nombre completo para registrar la reserva.

Cliente: Santiago Marín

Bot: ¡Listo, Santiago! 🎉 Tu cita ha sido confirmada con éxito:
     Código: MAEST-58291
     Barbero: Kevin
     Fecha: Sábado 24 de Octubre a las 02:00 PM
     Servicio: Corte + Barba ($22.000 COP)
     Ubicación: Calle 30 # 18 - 29 B/ La Colombina

     Ya está agendado en el calendario de Kevin. ¡Te esperamos!
```
