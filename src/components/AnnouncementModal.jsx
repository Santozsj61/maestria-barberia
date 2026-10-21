import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Instagram } from 'lucide-react';

export default function AnnouncementModal({ isOpen, onClose, business }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-void/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl glass-card border border-gold/30 shadow-2xl p-5 animate-in fade-in zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-ink-2/80 text-ivory-dim hover:text-gold hover:bg-ink-3 transition-colors"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center pt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-medium mb-3">
            <Instagram className="w-3.5 h-3.5" />
            <span>Comunidad Oficial</span>
          </div>

          <div className="overflow-hidden rounded-xl border border-white/10 mb-4 bg-ink-3">
            <img
              src="/assets/instagram-promo.webp"
              alt="Promoción Instagram"
              className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>

          <h3 className="font-serif text-lg text-ivory mb-1">
            Síguenos en Instagram
          </h3>
          <p className="text-xs text-ivory-dim mb-4">
            Descubre los últimos estilos, promociones exclusivas y el día a día en nuestra barbería.
          </p>

          <div className="flex gap-2">
            <a
              href={business?.instagramUrl || 'https://www.instagram.com/maestria__barberia'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl gold-gradient-bg text-ink font-semibold text-xs tracking-wide uppercase hover:opacity-95 transition-opacity"
            >
              <span>Seguir en IG</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-white/10 text-ivory-dim hover:text-ivory text-xs font-medium hover:bg-white/5 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
