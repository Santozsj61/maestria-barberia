import React from 'react';
import { Calendar, Scissors, Clock, MapPin, ChevronRight } from 'lucide-react';

export default function Hero({ onOpenBooking, business }) {
  return (
    <section id="inicio" className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden bg-neutral-100/90">
      {/* Background Interior Atmosphere (Official Maestría Barbería Interior) */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
        <img
          src="/assets/maestria-interior-1.png"
          alt="Maestría Barbería Interior"
          className="w-full h-full object-cover filter grayscale contrast-110 blur-[1px]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-100/90 via-neutral-100/60 to-neutral-100/95" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          {/* Main Title - High contrast dark typography */}
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-[#1c1c1e] mb-4 leading-[1.1] drop-shadow-xs">
            Tu mejor versión <span className="italic text-[#48484a] font-normal">empieza aquí.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-2xl text-[#3a3a3c] font-semibold tracking-wide mb-8 max-w-xl mx-auto">
            Elige tu experiencia
          </p>

          {/* Featured Flyer Style Primary Action Button - Dark High Contrast */}
          <div className="flex justify-center mb-12">
            <button
              onClick={() => onOpenBooking()}
              className="py-4 px-8 sm:px-10 rounded-full bg-[#c8c8cc] hover:bg-[#b8b8bd] active:scale-95 transition-all text-[#1c1c1e] font-black text-sm sm:text-base uppercase tracking-wider flex items-center gap-3 shadow-lg group border border-[#8e8e93]"
            >
              <ChevronRight className="w-6 h-6 stroke-[3.5] text-[#1c1c1e] group-hover:translate-x-1.5 transition-transform" />
              <span>Reservar Cita Ahora</span>
            </button>
          </div>

          {/* Main CTA Action Cards - 100% Barbería */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-xl mx-auto mb-14">
            {/* CTA 1: Agendar en Local */}
            <div
              onClick={() => onOpenBooking()}
              className="cursor-pointer group relative p-6 rounded-2xl bg-white/80 border border-neutral-300 hover:border-[#1c1c1e] text-left overflow-hidden shadow-md backdrop-blur-md transition-all hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-neutral-100 border border-neutral-300 flex items-center justify-center text-[#1c1c1e] group-hover:scale-110 transition-transform">
                  <Calendar className="w-6 h-6" />
                </div>
                <div className="flex items-center text-xs font-black text-[#1c1c1e] gap-1 uppercase tracking-wider group-hover:text-black transition-colors">
                  <span>Agendar</span>
                  <ChevronRight className="w-4 h-4 stroke-[3] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
              <h3 className="font-serif text-xl font-black text-[#1c1c1e] mb-1">
                Cita en el Local
              </h3>
              <p className="text-xs text-[#48484a] font-medium leading-relaxed">
                Elige tu barbero (Jhoan o Kevin), fecha y servicios en sencillos pasos.
              </p>
            </div>

            {/* CTA 2: Servicio a Domicilio */}
            <div
              onClick={() => onOpenBooking(null, 'domicilio')}
              className="cursor-pointer group relative p-6 rounded-2xl bg-white/80 border border-neutral-300 hover:border-[#1c1c1e] text-left overflow-hidden shadow-md backdrop-blur-md transition-all hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-neutral-100 border border-neutral-300 flex items-center justify-center text-[#1c1c1e] group-hover:scale-110 transition-all">
                  <Scissors className="w-6 h-6" />
                </div>
                <div className="flex items-center text-xs font-black text-[#1c1c1e] gap-1 uppercase tracking-wider group-hover:text-black transition-colors">
                  <span>$30.000 COP</span>
                  <ChevronRight className="w-4 h-4 stroke-[3] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
              <h3 className="font-serif text-xl font-black text-[#1c1c1e] mb-1">
                Servicio a Domicilio
              </h3>
              <p className="text-xs text-[#48484a] font-medium leading-relaxed">
                Atención personalizada en tu hogar u oficina disponible con ambos barberos.
              </p>
            </div>
          </div>

          {/* Quick Info Bar in high contrast dark text */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-bold text-[#1c1c1e] border border-neutral-300 py-4 px-6 max-w-2xl mx-auto bg-white/85 rounded-full shadow-md backdrop-blur-md">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#555555]" />
              <span className="hidden sm:inline">Lun - Jue: 9:00am - 8:30pm | Vie - Sáb: 8:00am - 9:00pm | Dom: 9:00am - 1:00pm</span>
              <span className="sm:hidden">Lun - Dom (Horarios especiales)</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#555555]" />
              <span>{business?.direccion || 'Calle 30 # 18 - 29 B/ la colombina'}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
