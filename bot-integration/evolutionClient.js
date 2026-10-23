import axios from 'axios';
import { config } from './config.js';

/**
 * Cliente para interactuar con Evolution API (Conexión WhatsApp)
 */
export const evolutionClient = {
  /**
   * Envía un mensaje de texto por WhatsApp al cliente
   */
  sendTextMessage: async (remoteJid, text) => {
    if (!config.evolutionApiKey) {
      console.log(`[SIMULACIÓN WHATSAPP a ${remoteJid}]:\n${text}\n---------------------------`);
      return { success: true, simulated: true };
    }

    try {
      const url = `${config.evolutionUrl}/message/sendText/${config.evolutionInstance}`;
      const response = await axios.post(
        url,
        {
          number: remoteJid.replace('@s.whatsapp.net', ''),
          options: {
            delay: 1200,
            presence: 'composing',
            linkPreview: false
          },
          textMessage: {
            text: text
          }
        },
        {
          headers: {
            apikey: config.evolutionApiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      return { success: true, data: response.data };
    } catch (error) {
      console.error(`Error enviando mensaje por Evolution API a ${remoteJid}:`, error.response?.data || error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Consulta el estado de conexión de la instancia de WhatsApp
   */
  getInstanceStatus: async () => {
    if (!config.evolutionApiKey) return { state: 'unconfigured' };
    try {
      const url = `${config.evolutionUrl}/instance/connectionState/${config.evolutionInstance}`;
      const res = await axios.get(url, {
        headers: { apikey: config.evolutionApiKey }
      });
      return res.data;
    } catch (err) {
      return { state: 'error', detail: err.message };
    }
  }
};
