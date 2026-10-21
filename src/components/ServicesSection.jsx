import React from 'react';
import { Scissors, Sparkles, Clock, ChevronRight, Phone, MapPin } from 'lucide-react';

export default function ServicesSection({ onSelectService, services, business }) {
  const defaultServices = [
    {
      id: 'corte-sencillo',
      nombre: 'Corte Sencillo',
      precio: 18000,
      duracionMinutos: 30,
      descripcion: 'Incluye cejas o mascarilla de puntos negros'
    },
    {
      id: 'corte-barba',
      nombre: 'Corte + Barba',
      precio: 22000,
      duracionMinutos: 45,
      descripcion: 'Incluye cejas o mascarilla de puntos negros'
    },
    {
      id: 'perfilado-barba',
      nombre: 'Perfilado de Barba',
      precio: 8000,
      duracionMinutos: 20,
      descripcion: null
    },
    {
      id: 'perfilado-cejas',
      nombre: 'Perfilado de Cejas',
      precio: 5000,
      duracionMinutos: 15,
      descripcion: null
    },
    {
      id: 'marcada',
      nombre: 'Marcada',
      precio: 7000,
      duracionMinutos: 20,
      descripcion: null
    },
    {
      id: 'domicilio',
      nombre: 'Servicio a Domicilio',
      precio: 30000,
      duracionMinutos: 60,
      descripcion: 'Atención personalizada en la comodidad de tu hogar (disponible con Jhoan y Kevin)'
    }
  ];

  const items = services && services.length > 0 ? services.map(s => {
    const found = defaultServices.find(d => d.id === s.id);
    return {
      ...s,
      descripcion: s.descripcion !== undefined ? s.descripcion : (found ? found.descripcion : null)
    };
  }) : defaultServices;

  const formatCOP = (val) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <section id="servicios" className="py-16 md:py-24 border-t border-neutral-300 relative bg-neutral-100/95 overflow-hidden">
      {/* Background with interior photo (Maestría Barbería Estaciones) */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <img
          src="/assets/maestria-interior-2.png"
          alt="Maestría Barbería Estaciones"
          className="w-full h-full object-cover filter grayscale contrast-110 blur-[1px]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-100/90 via-neutral-100/60 to-neutral-100/95" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="text-xs sm:text-sm font-extrabold tracking-[0.25em] uppercase text-[#48484a] mb-2">
            Maestría Barbería
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-black text-[#1c1c1e] tracking-wide uppercase leading-tight mb-3">
            Nuestros <br className="sm:hidden" />
            <span className="font-sans font-black text-[#3a3a3c]">Servicios</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#48484a] font-medium">
            Haz clic en cualquier servicio para agendar tu cita al instante
          </p>
        </div>

        {/* The Exact Flyer Card Container */}
        <div className="w-full max-w-xl mx-auto rounded-3xl border border-neutral-300 bg-white/85 backdrop-blur-xl p-5 sm:p-8 shadow-xl relative">
          {/* "Lista de precios" Badge */}
          <div className="mb-6 flex justify-start">
            <div className="inline-block px-5 py-1.5 rounded-full bg-neutral-200 border border-neutral-300 text-[#1c1c1e] font-serif text-sm italic tracking-wide shadow-sm font-bold">
              Lista <span className="font-sans font-black not-italic text-[#1c1c1e]">de precios</span>
            </div>
          </div>

          {/* Button Capsule List with Dark Typography */}
          <div className="space-y-4">
            {items.map((svc) => (
              <div key={svc.id} className="w-full flex flex-col items-center group">
                {/* Main Pill Button */}
                <button
                  onClick={() => onSelectService(svc.id)}
                  className="w-full py-3.5 px-5 sm:px-6 rounded-full bg-[#c8c8cc] hover:bg-[#b8b8bd] active:scale-[0.98] transition-all flex items-center justify-between shadow-md relative overflow-hidden text-[#1c1c1e] border border-[#8e8e93] z-10"
                >
                  {/* Chevron Right on Left Side */}
                  <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center shrink-0 mr-3">
                    <ChevronRight className="w-5 h-5 stroke-[3.5] text-[#1c1c1e] group-hover:translate-x-0.5 transition-transform" />
                  </div>

                  {/* Service Title and Price (Centered Dark Typography) */}
                  <div className="flex-1 text-center pr-8 sm:pr-10">
                    <div className="font-black text-xs sm:text-sm md:text-base tracking-wider uppercase text-[#1c1c1e] leading-tight">
                      {svc.nombre}
                    </div>
                    <div className="font-black text-xs sm:text-sm md:text-base tracking-wider text-[#1c1c1e] leading-tight mt-0.5">
                      {formatCOP(svc.precio)}
                    </div>
                  </div>
                </button>

                {/* Subtitle / Description Box with Dark Legible Text */}
                {svc.descripcion && (
                  <div className="w-[92%] -mt-2 pt-3.5 pb-2.5 px-4 rounded-b-2xl bg-neutral-200/90 border border-neutral-300 text-[#1c1c1e] text-[11px] sm:text-xs text-center font-semibold leading-relaxed shadow-xs">
                    {svc.descripcion}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Flyer Card Footer (Contact Details) */}
          <div className="mt-8 pt-5 border-t border-neutral-300 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-[#1c1c1e]">
            <a
              href={`https://wa.me/57${business?.telefono || '3161277718'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-black transition-colors"
            >
              <Phone className="w-4 h-4 text-[#555555]" />
              <span>{business?.telefono || '3161277718'}</span>
            </a>
            <div className="flex items-center gap-2 text-center sm:text-right">
              <MapPin className="w-4 h-4 text-[#555555] shrink-0" />
              <span>{business?.direccion || 'Calle 30 # 18 - 29 B/ la colombina'}</span>
            </div>
          </div>
        </div>

        {/* Combos callout */}
        <div className="max-w-xl mx-auto mt-8 p-5 rounded-2xl border border-neutral-300 bg-white/90 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-md backdrop-blur-md">
          <div>
            <h4 className="font-serif text-sm sm:text-base font-black text-[#1c1c1e] flex items-center justify-center sm:justify-start gap-2">
              <Sparkles className="w-4 h-4 text-[#555555]" />
              <span>¿Quieres combinar varios servicios?</span>
            </h4>
            <p className="text-xs text-[#48484a] mt-0.5 font-medium">
              En el paso de agendamiento puedes sumar Corte + Barba + Cejas con un solo clic.
            </p>
          </div>
          <button
            onClick={() => onSelectService('corte-sencillo')}
            className="shrink-0 px-6 py-2.5 rounded-full bg-[#c8c8cc] hover:bg-[#b8b8bd] text-[#1c1c1e] font-black text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 flex items-center gap-1.5 border border-[#8e8e93]"
          >
            <ChevronRight className="w-4 h-4 stroke-[3.5] text-[#1c1c1e]" />
            <span>Armar Combo</span>
          </button>
        </div>
      </div>
    </section>
  );
}
