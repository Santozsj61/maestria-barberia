import React, { useState } from 'react';
import initialContent from './data/content.json';
import AnnouncementModal from './components/AnnouncementModal';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import BarbersSection from './components/BarbersSection';
import ServicesSection from './components/ServicesSection';
import GallerySection from './components/GallerySection';
import BookingModal from './components/BookingModal';
import Footer from './components/Footer';
import { MessageCircle, Calendar } from 'lucide-react';

export default function App() {
  const [content, setContent] = useState(initialContent);

  // Modals state
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);
  // Preselections for booking
  const [selectedBarberId, setSelectedBarberId] = useState(null);
  const [selectedServiceId, setSelectedServiceId] = useState(null);

  const handleOpenBooking = (barberId = null, serviceId = null) => {
    setSelectedBarberId(barberId);
    setSelectedServiceId(serviceId);
    setIsBookingOpen(true);
  };

  const handleSelectBarber = (barberId) => {
    handleOpenBooking(barberId, null);
  };

  const handleSelectService = (serviceId) => {
    handleOpenBooking(null, serviceId);
  };

  return (
    <div className="min-h-screen bg-neutral-100 text-[#1c1c1e] flex flex-col select-none relative">

      {/* 2. Instagram Promo Modal */}
      <AnnouncementModal
        isOpen={isAnnouncementOpen}
        onClose={() => setIsAnnouncementOpen(false)}
        business={content.business}
      />

      {/* 3. Top Sticky Navigation */}
      <Navbar
        onOpenBooking={() => handleOpenBooking()}
        business={content.business}
      />

      {/* 4. Main Landing Content */}
      <main className="flex-1">
        <Hero
          onOpenBooking={handleOpenBooking}
          business={content.business}
        />

        <BarbersSection onSelectBarber={handleSelectBarber} />

        <ServicesSection
          onSelectService={handleSelectService}
          services={content.services}
          business={content.business}
        />

        <GallerySection business={content.business} />
      </main>

      {/* 5. Footer */}
      <Footer
        business={content.business}
        onOpenBooking={() => handleOpenBooking()}
      />

      {/* 6. Booking Modal (5 Steps) */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        preselectedBarberId={selectedBarberId}
        preselectedServiceId={selectedServiceId}
        barbers={content.barbers}
        services={content.services}
        hours={content.hours}
        business={content.business}
      />

      {/* 7. Floating Action Buttons (Mobile / Quick access) */}
      <div className="fixed bottom-6 right-6 z-30 flex flex-col gap-3">
        {/* Floating Booking */}
        <button
          onClick={() => handleOpenBooking()}
          className="p-3.5 rounded-full bg-[#c8c8cc] text-[#1c1c1e] shadow-2xl hover:scale-110 active:scale-95 transition-transform flex items-center justify-center border border-[#8e8e93] sm:hidden"
          title="Agendar Cita"
        >
          <Calendar className="w-5 h-5 font-bold" />
        </button>

        {/* Floating WhatsApp */}
        <a
          href={`https://wa.me/57${content.business?.telefono || '3161277718'}?text=${encodeURIComponent(
            '¡Hola Maestría Barbería! Quisiera consultar sobre un servicio o agendar una cita.'
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3.5 rounded-full bg-emerald-500 text-white shadow-2xl hover:bg-emerald-400 hover:scale-110 active:scale-95 transition-all flex items-center justify-center border border-white/20"
          title="Escribir al WhatsApp Oficial"
        >
          <MessageCircle className="w-5 h-5" />
        </a>
      </div>
    </div>
  );
}
