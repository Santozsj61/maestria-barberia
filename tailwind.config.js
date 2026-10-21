/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta en escala de grises oscuros (sin fondos blancos):
        palette: {
          base: '#17171a',        // Fondo general carbón oscuro
          surface: '#1f1f23',     // Fondo de secciones alternas
          card: '#29292e',        // Fondo de tarjetas y modales
          cardSubtle: '#34343a',  // Subcajas de descripción / contenedores internos
          border: '#3f3f46',      // Bordes refinados
          borderLight: '#55555e', // Bordes claros
          button: '#7c7c82',      // Color cápsula del flyer
          buttonHover: '#8f8f96', // Hover de cápsula
          textWhite: '#ffffff',   // Encabezados y títulos
          textLight: '#d4d4d8',   // Párrafos y descripciones legibles
          textMuted: '#a1a1aa',   // Metadatos y etiquetas
          // Mapeo retrocompatible de clases existentes
          1: '#17171a',
          2: '#27272b',
          3: '#3f3f46',
          4: '#71717a',
          5: '#d4d4d8',
          6: '#ffffff',
          dark: '#0e0e10',
          pure: '#08080a'
        },
        // Mapeo retrocompatible
        gold: {
          DEFAULT: '#7c7c82',
          light: '#8f8f96',
          dark: '#17171a',
          hover: '#8f8f96',
          subtle: '#27272b',
          border: '#3f3f46'
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Manrope"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'subtle-card': '0 4px 20px -2px rgba(85, 85, 85, 0.08), 0 0 1px 1px rgba(198, 198, 198, 0.6)',
        'subtle-hover': '0 10px 25px -4px rgba(85, 85, 85, 0.16), 0 0 0 1px rgba(85, 85, 85, 0.4)'
      }
    },
  },
  plugins: [],
}
