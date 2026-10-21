import React from 'react';
import { Award, Star, ChevronRight, Instagram } from 'lucide-react';

export default function BarbersSection({ onSelectBarber }) {
  const barbers = [
    {
      id: 'jhoan',
      name: 'Jhoan',
      role: '(Inserte cargo / título profesional)',
      image: '/assets/barber-sample-1.jpg',
      badge: '(Inserte estilo o enfoque de corte)',
      instagram: '@jhoan_o204',
      instagramUrl: 'https://www.instagram.com/jhoan_o204',
      description: '(Inserte texto - Breve descripción o reseña profesional del barbero: técnicas, experiencia y servicios).',
      rating: '5.0',
      experience: 'Especialista Barber'
    },
    {
      id: 'kevin',
      name: 'Kevin',
      role: '(Inserte cargo / título profesional)',
      image: '/assets/barber-sample-2.jpg',
      badge: '(Inserte estilo o enfoque de corte)',
      instagram: '@__050723',
      instagramUrl: 'https://www.instagram.com/__050723',
      description: '(Inserte texto - Breve descripción o reseña profesional del barbero: técnicas, experiencia y servicios).',
      rating: '5.0',
      experience: 'Especialista Barber'
    }
  ];

  return (
    <section id="barberos" className="py-16 md:py-24 border-t border-neutral-300 relative bg-neutral-100/90">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-neutral-300 text-[#1c1c1e] text-xs font-black uppercase tracking-wider mb-3 shadow-sm">
            <Award className="w-3.5 h-3.5 text-[#555555]" />
            <span>Equipo Profesional</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-black text-[#1c1c1e] mb-4">
            Nuestros <span className="italic text-[#48484a] font-normal">Barberos</span>
          </h2>
          <p className="text-sm sm:text-base text-[#48484a] font-medium">
            Profesionales apasionados por el arte de la barbería clásica y moderna.
            Escoge con quién prefieres atenderte.
          </p>
        </div>

        {/* Barbers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {barbers.map((barber) => (
            <div
              key={barber.id}
              className="group rounded-3xl bg-white border border-neutral-300 overflow-hidden shadow-md flex flex-col hover:-translate-y-1 transition-all duration-300"
            >
              {/* Photo Area with generic sample photos */}
              <div className="relative h-80 sm:h-96 w-full overflow-hidden bg-neutral-200">
                <img
                  src={barber.image}
                  alt={barber.name}
                  className="w-full h-full object-cover object-top mono-img group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-95" />
                
                {/* Floating badge */}
                <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-neutral-300 text-[#1c1c1e] text-xs font-bold shadow-md">
                  <Star className="w-3.5 h-3.5 text-[#1c1c1e] fill-[#1c1c1e]" />
                  <span className="text-[#1c1c1e] font-black">{barber.rating}</span>
                  <span className="text-[#48484a] text-[11px]">· {barber.badge}</span>
                </div>
              </div>

              {/* Info Area */}
              <div className="p-6 sm:p-8 flex flex-col flex-1 justify-between bg-white -mt-6 relative z-10">
                <div>
                  <div className="flex items-baseline justify-between mb-1">
                    <h3 className="font-serif text-2xl font-black text-[#1c1c1e]">
                      {barber.name}
                    </h3>
                    <span className="text-xs text-[#48484a] font-bold">{barber.experience}</span>
                  </div>
                  
                  {/* Role & Instagram handle */}
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs uppercase tracking-wider text-[#1c1c1e] font-extrabold">
                      {barber.role}
                    </p>
                    <a
                      href={barber.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#1c1c1e] hover:text-black hover:underline"
                    >
                      <Instagram className="w-3.5 h-3.5 text-pink-600" />
                      <span>{barber.instagram}</span>
                    </a>
                  </div>

                  <p className="text-sm text-[#2c2c2e] leading-relaxed mb-6 font-medium">
                    {barber.description}
                  </p>
                </div>

                <button
                  onClick={() => onSelectBarber(barber.id)}
                  className="w-full py-3.5 px-6 rounded-full bg-[#c8c8cc] hover:bg-[#b8b8bd] text-[#1c1c1e] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] border border-[#8e8e93]"
                >
                  <ChevronRight className="w-4 h-4 stroke-[3.5] text-[#1c1c1e]" />
                  <span>Agendar con {barber.name}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
