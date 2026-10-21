import React, { useState } from 'react';
import { Calendar, Menu, X, MessageCircle, ChevronRight } from 'lucide-react';

export default function Navbar({ onOpenBooking, business }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Inicio', href: '#inicio' },
    { label: 'Barberos', href: '#barberos' },
    { label: 'Servicios', href: '#servicios' },
    { label: 'El Espacio', href: '#galeria' },
    { label: 'Ubicación', href: '#ubicacion' },
  ];

  return (
    <header className="sticky top-0 z-30 w-full border-b border-neutral-300 bg-white/90 backdrop-blur-xl transition-all shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        {/* Enlace del Logo en la Barra de Navegación */}
        <a href="#inicio" className="logo-nav">
          <img
            src="/assets/logo.png"
            alt={business?.nombre || 'Maestria Barber'}
            style={{
              height: '40px',
              width: 'auto',
              objectFit: 'contain',
              background: 'transparent',
              border: 'none',
              boxShadow: 'none',
            }}
          />
        </a>

        {/* Desktop Navigation Links - Dark and legible */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-bold text-[#1c1c1e] hover:text-black transition-colors tracking-wide"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden sm:flex items-center gap-3">
          <a
            href={`https://wa.me/57${business?.telefono || '3161277718'}?text=${encodeURIComponent(
              '¡Hola! Quiero agendar una cita o pedir información sobre Maestría Barbería.'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-full border border-neutral-300 bg-white text-[#1c1c1e] hover:text-black hover:border-[#1c1c1e] shadow-sm transition-all"
            title="Escribir por WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
          </a>
          <button
            onClick={onOpenBooking}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#c8c8cc] hover:bg-[#b8b8bd] text-[#1c1c1e] font-black text-xs uppercase tracking-wider shadow-md transition-all hover:scale-105 active:scale-95 border border-[#8e8e93]"
          >
            <ChevronRight className="w-4 h-4 stroke-[3.5] text-[#1c1c1e]" />
            <span>Agendar Cita</span>
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={onOpenBooking}
            className="px-4 py-2 rounded-full bg-[#c8c8cc] hover:bg-[#b8b8bd] text-[#1c1c1e] font-black text-xs uppercase tracking-wider shadow-sm flex items-center gap-1 border border-[#8e8e93]"
          >
            <ChevronRight className="w-3.5 h-3.5 stroke-[3.5] text-[#1c1c1e]" />
            <span>Agendar</span>
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl border border-neutral-300 bg-white text-[#1c1c1e] hover:text-black"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-neutral-300 bg-white/98 backdrop-blur-2xl px-6 py-6 shadow-2xl animate-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-bold text-[#1c1c1e] hover:text-black transition-colors py-1"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-4 border-t border-neutral-200 flex flex-col gap-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenBooking();
                }}
                className="w-full py-3 rounded-full bg-[#c8c8cc] text-[#1c1c1e] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md border border-[#8e8e93]"
              >
                <ChevronRight className="w-4 h-4 stroke-[3.5] text-[#1c1c1e]" />
                <span>Reservar Cita Ahora</span>
              </button>
              <a
                href={`https://wa.me/57${business?.telefono || '3161277718'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-full border border-neutral-300 bg-neutral-100 text-[#1c1c1e] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp ({business?.telefono || '3161277718'})</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
