import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  
  // Supabase
  supabaseUrl: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '',

  // Evolution API (WhatsApp)
  evolutionUrl: (process.env.EVOLUTION_API_URL || 'http://localhost:8080').replace(/\/$/, ''),
  evolutionApiKey: process.env.EVOLUTION_API_KEY || '',
  evolutionInstance: process.env.EVOLUTION_INSTANCE_NAME || 'maestria-instance',

  // Google Calendar
  googleClientEmail: process.env.GOOGLE_CLIENT_EMAIL || '',
  googlePrivateKey: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
  calendarJhoan: process.env.GOOGLE_CALENDAR_JHOAN || 'jhoan@maestriabarberia.com',
  calendarKevin: process.env.GOOGLE_CALENDAR_KEVIN || 'kevin@maestriabarberia.com',

  // Datos de Maestría Barbería
  business: {
    name: 'Maestría Barbería',
    address: 'Calle 30 # 18 - 29 B/ La Colombina',
    phone: '316 127 7718'
  },

  barbers: [
    { id: 'jhoan', name: 'Jhoan', role: 'Barber Stylist' },
    { id: 'kevin', name: 'Kevin', role: 'Barber Stylist' }
  ],

  services: [
    { id: 'corte-sencillo', name: 'Corte Sencillo', price: 18000, duration: 30, desc: 'Incluye cejas o mascarilla' },
    { id: 'corte-barba', name: 'Corte + Barba', price: 22000, duration: 45, desc: 'Incluye cejas o mascarilla' },
    { id: 'perfilado-barba', name: 'Perfilado de Barba', price: 8000, duration: 20, desc: 'Navaja y toalla caliente' },
    { id: 'perfilado-cejas', name: 'Perfilado de Cejas', price: 5000, duration: 15, desc: 'Diseño y limpieza' },
    { id: 'marcada', name: 'Marcada', price: 7000, duration: 20, desc: 'Contornos nítidos' },
    { id: 'domicilio', name: 'Servicio a Domicilio', price: 30000, duration: 60, desc: 'Mínimo 1 día de anticipación' }
  ]
};
