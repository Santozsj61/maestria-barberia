import React from 'react';
import { Camera, ShieldCheck, Sparkles } from 'lucide-react';

export default function GallerySection({ business }) {
  const highlights = [
    { icon: Sparkles, title: 'Higiene & Esterilización', desc: 'Protocolos de desinfección grado médico para cada cliente' },
    { icon: ShieldCheck, title: 'Ambiente Climatizado', desc: 'Música seleccionada y confort total en tu visita' }
  ];

  return (
    <section id="galeria" className="py-16 md:py-24 border-t border-neutral-300 relative bg-neutral-100/90">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-neutral-300 text-[#1c1c1e] text-xs font-black uppercase tracking-wider mb-3 shadow-sm">
            <Camera className="w-3.5 h-3.5 text-[#555555]" />
            <span>{business?.galleryKicker || 'El Espacio'}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-black text-[#1c1c1e] mb-4">
            {business?.galleryTitulo || 'El lugar de tu próxima experiencia'}
          </h2>
          <p className="text-sm sm:text-base text-[#48484a] font-medium">
            Diseñado para que desconectes de la rutina y disfrutes de un trato personalizado.
          </p>
        </div>

        {/* Tarjeta Unificada de Instalaciones */}
        <div className="rounded-3xl overflow-hidden bg-white border border-neutral-300 shadow-md max-w-4xl mx-auto mb-12">
          {/* Dos fotos del local unificadas */}
          <div className="grid grid-cols-1 md:grid-cols-2 h-72 sm:h-96 overflow-hidden">
            <div className="relative h-full overflow-hidden border-b md:border-b-0 md:border-r border-neutral-200">
              <img
                src="/assets/maestria-interior-1.png"
                alt="Maestría Barbería - Vista Principal"
                className="w-full h-full object-cover mono-img hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="relative h-full overflow-hidden">
              <img
                src="/assets/maestria-interior-2.png"
                alt="Maestría Barbería - Estaciones de Corte"
                className="w-full h-full object-cover mono-img hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>

          {/* Texto Unificado del Espacio */}
          <div className="p-6 sm:p-8 bg-white text-center border-t border-neutral-200">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#71717a]">
              Instalaciones Maestría
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-black text-[#1c1c1e] mt-1 mb-2">
              Confort, Estilo & Precisión
            </h3>
            <p className="text-xs sm:text-sm text-[#48484a] max-w-2xl mx-auto font-medium leading-relaxed">
              Sillones ergonómicos reclinables, estaciones individuales con espejos circulares retroiluminados, techo con iluminación LED hexagonal y ambiente climatizado para brindarte la mejor atención.
            </p>
          </div>
        </div>

        {/* Feature Badges (Higiene y Climatización - Bebida de cortesía eliminada) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {highlights.map((h, i) => {
            const Icon = h.icon;
            return (
              <div
                key={i}
                className="p-5 rounded-2xl bg-white border border-neutral-300 flex items-start gap-4 shadow-sm"
              >
                <div className="p-2.5 rounded-xl bg-neutral-100 border border-neutral-300 text-[#1c1c1e] shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-[#1c1c1e] mb-1">{h.title}</h4>
                  <p className="text-xs text-[#48484a] leading-relaxed font-medium">{h.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
