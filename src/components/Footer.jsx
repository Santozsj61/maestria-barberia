import React from 'react';
import { MapPin, Phone, Clock, ArrowUp, ChevronRight } from 'lucide-react';

export default function Footer({ business, onOpenBooking }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="ubicacion" className="border-t border-neutral-300 bg-white pt-14 pb-10 relative shadow-inner">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Main Content: Organized, balanced 2-column card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-neutral-50/90 border border-neutral-200 rounded-3xl p-6 sm:p-8 mb-10 shadow-xs">
          {/* Block 1: Ubicación & Horario */}
          <div className="space-y-4 md:border-r md:border-neutral-200 md:pr-8">
            <h4 className="font-serif text-base font-black text-[#1c1c1e] tracking-wide uppercase flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#1c1c1e]" />
              <span>Ubicación & Horario</span>
            </h4>
            
            <div className="space-y-3 text-xs sm:text-sm text-[#2c2c2e]">
              <div className="flex items-start gap-2">
                <span className="font-extrabold text-[#1c1c1e]">Dirección:</span>
                <span className="font-semibold text-[#48484a]">
                  {business?.direccion || 'Calle 30 # 18 - 29 B/ la colombina'}
                </span>
              </div>
              
              <div className="pt-2">
                <p className="font-black text-[#1c1c1e] text-xs uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#1c1c1e]" />
                  <span>Horarios de Atención:</span>
                </p>
                
                <div className="space-y-2">
                  {/* Lunes / Jueves */}
                  <div className="flex items-center justify-between rounded-full overflow-hidden border border-neutral-300 shadow-2xs text-[11px] sm:text-xs font-black bg-white p-1">
                    <span className="text-[#1c1c1e] px-3 py-1 tracking-wider uppercase font-extrabold">
                      LUNES / JUEVES
                    </span>
                    <span className="bg-[#8e8e93] text-white px-3 py-1 font-bold tracking-wide rounded-full text-right shadow-xs">
                      9:00AM - 8:30PM
                    </span>
                  </div>

                  {/* Viernes / Sábado */}
                  <div className="flex items-center justify-between rounded-full overflow-hidden border border-neutral-300 shadow-2xs text-[11px] sm:text-xs font-black bg-white p-1">
                    <span className="text-[#1c1c1e] px-3 py-1 tracking-wider uppercase font-extrabold">
                      VIERNES / SÁBADO
                    </span>
                    <span className="bg-[#8e8e93] text-white px-3 py-1 font-bold tracking-wide rounded-full text-right shadow-xs">
                      8:00AM - 9:00PM
                    </span>
                  </div>

                  {/* Domingos */}
                  <div className="flex items-center justify-between rounded-full overflow-hidden border border-neutral-300 shadow-2xs text-[11px] sm:text-xs font-black bg-white p-1">
                    <span className="text-[#1c1c1e] px-3 py-1 tracking-wider uppercase font-extrabold">
                      DOMINGOS
                    </span>
                    <span className="bg-[#8e8e93] text-white px-3 py-1 font-bold tracking-wide rounded-full text-right shadow-xs">
                      9:00AM - 1:00PM
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Block 2: Contacto Directo & Agendar */}
          <div className="space-y-4 md:pl-4 flex flex-col justify-between">
            <div>
              <h4 className="font-serif text-base font-black text-[#1c1c1e] tracking-wide uppercase flex items-center gap-2 mb-2">
                <Phone className="w-4 h-4 text-[#1c1c1e]" />
                <span>Contacto Directo</span>
              </h4>
              
              <a
                href={`https://wa.me/57${business?.telefono || '3161277718'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm sm:text-base font-black text-[#1c1c1e] hover:text-black transition-colors"
              >
                <span>+57 {business?.telefono || '316 127 7718'}</span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                  WhatsApp Oficial
                </span>
              </a>
            </div>

            <div className="pt-2">
              <button
                onClick={onOpenBooking}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#c8c8cc] hover:bg-[#b8b8bd] text-[#1c1c1e] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95 border border-[#8e8e93]"
              >
                <ChevronRight className="w-4 h-4 stroke-[3.5] text-[#1c1c1e]" />
                <span>Agendar Cita</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-neutral-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-[#71717a]">
          <p>© {new Date().getFullYear()} Maestría Barbería. Todos los derechos reservados.</p>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 font-bold text-[#1c1c1e] hover:text-black transition-colors"
          >
            <span>Volver arriba</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
