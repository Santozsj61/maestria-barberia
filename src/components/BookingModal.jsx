import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  FileText,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  MessageCircle,
} from 'lucide-react';

export default function BookingModal({
  isOpen,
  onClose,
  preselectedServiceId,
  preselectedBarberId,
  services = [],
  barbers = [],
  business = {},
}) {
  if (!isOpen) return null;

  // Wizard Steps: 1: Barber -> 2: Date & Time -> 3: Services -> 4: Customer Info -> 5: Success Ticket
  const [step, setStep] = useState(preselectedBarberId ? 2 : 1);
  const [selectedBarber, setSelectedBarber] = useState(
    preselectedBarberId || 'jhoan'
  );
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedTime, setSelectedTime] = useState('10:00');
  const [selectedServices, setSelectedServices] = useState(() => {
    return preselectedServiceId ? [preselectedServiceId] : ['corte-sencillo'];
  });
  const [clientData, setClientData] = useState({
    nombre: '',
    telefono: '',
    notas: '',
  });
  const [reservationCode, setReservationCode] = useState('');

  // Horarios oficiales de Maestría Barbería:
  // Lunes a Jueves: 9:00 AM - 8:30 PM
  // Viernes y Sábado: 8:00 AM - 9:00 PM
  // Domingos: 9:00 AM - 1:00 PM
  const getDaySchedule = (dateStr) => {
    if (!dateStr) return { label: 'Lunes a Jueves', hours: '9:00 AM - 8:30 PM', startH: 9, startM: 0, endH: 20, endM: 30 };
    const parts = dateStr.split('-').map(Number);
    if (parts.length !== 3) return { label: 'Lunes a Jueves', hours: '9:00 AM - 8:30 PM', startH: 9, startM: 0, endH: 20, endM: 30 };
    const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
    const dayOfWeek = dateObj.getDay();

    if (dayOfWeek === 0) {
      return {
        label: 'Domingo',
        hours: '9:00 AM - 1:00 PM',
        startH: 9,
        startM: 0,
        endH: 13,
        endM: 0,
      };
    } else if (dayOfWeek === 5 || dayOfWeek === 6) {
      return {
        label: dayOfWeek === 5 ? 'Viernes' : 'Sábado',
        hours: '8:00 AM - 9:00 PM',
        startH: 8,
        startM: 0,
        endH: 21,
        endM: 0,
      };
    } else {
      const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      return {
        label: dayNames[dayOfWeek] || 'Lunes a Jueves',
        hours: '9:00 AM - 8:30 PM',
        startH: 9,
        startM: 0,
        endH: 20,
        endM: 30,
      };
    }
  };

  const currentSchedule = getDaySchedule(selectedDate);

  const timeSlots = useMemo(() => {
    const sched = currentSchedule;
    const slots = [];
    let currentMinutes = sched.startH * 60 + sched.startM;
    const endMinutes = sched.endH * 60 + sched.endM;
    while (currentMinutes <= endMinutes) {
      const h = Math.floor(currentMinutes / 60);
      const m = currentMinutes % 60;
      slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
      currentMinutes += 30;
    }
    return slots;
  }, [selectedDate]);

  useEffect(() => {
    if (timeSlots.length > 0 && !timeSlots.includes(selectedTime)) {
      setSelectedTime(timeSlots[0]);
    }
  }, [timeSlots, selectedTime]);

  const toggleService = (serviceId) => {
    if (selectedServices.includes(serviceId)) {
      if (selectedServices.length > 1) {
        setSelectedServices(selectedServices.filter((s) => s !== serviceId));
      }
    } else {
      setSelectedServices([...selectedServices, serviceId]);
    }
  };

  // Calcular totales
  const activeServicesList = services.filter((s) =>
    selectedServices.includes(s.id)
  );
  const totalPrice = activeServicesList.reduce(
    (acc, curr) => acc + (curr.precio || 0),
    0
  );
  const totalDuration = activeServicesList.reduce(
    (acc, curr) => acc + (curr.duracionMinutos || 30),
    0
  );

  const formatCOP = (val) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleFinishBooking = (e) => {
    e.preventDefault();
    const code = `MAEST-${Math.floor(10000 + Math.random() * 90000)}`;
    setReservationCode(code);
    setStep(5);
  };

  const barberObj = barbers.find((b) => b.id === selectedBarber) || {
    nombre: selectedBarber === 'kevin' ? 'Kevin' : 'Jhoan',
  };

  const serviceNames = activeServicesList.map((s) => s.nombre).join(', ');

  const whatsappMessage = `*RESERVA — MAESTRÍA BARBERÍA*
Código: *${reservationCode}*
Cliente: *${clientData.nombre}*
Celular: *${clientData.telefono}*
Barbero: *${barberObj.nombre}*
Fecha: *${selectedDate}* a las *${selectedTime}*
Servicios: *${serviceNames}*
Total estimado: *${formatCOP(totalPrice)}*
${clientData.notas ? `Notas: ${clientData.notas}` : ''}

_¡Hola! Acabo de registrar mi cita en la web y deseo confirmarla._`;

  const stepsList = [
    { num: 1, label: 'Barbero' },
    { num: 2, label: 'Fecha & Hora' },
    { num: 3, label: 'Servicios' },
    { num: 4, label: 'Tus Datos' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-xl rounded-3xl bg-white border border-neutral-300 shadow-2xl p-5 sm:p-7 my-auto text-[#1c1c1e]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-neutral-100 border border-neutral-300 text-[#1c1c1e]">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-black text-[#1c1c1e]">
                Agendar Cita
              </h3>
              <p className="text-xs text-[#48484a] font-bold">Maestría Barbería Premium</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-100 text-[#48484a] hover:text-black transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-6 px-2">
          {stepsList.map((s, idx) => {
            const isCurrent = step === s.num;
            const isDone = step > s.num;
            return (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                      isDone
                        ? 'bg-[#1c1c1e] text-white shadow-xs'
                        : isCurrent
                        ? 'border-2 border-[#1c1c1e] text-[#1c1c1e] bg-neutral-200 font-black'
                        : 'border border-neutral-300 text-[#71717a] bg-neutral-100'
                    }`}
                  >
                    {isDone ? '✓' : s.num}
                  </div>
                  <span
                    className={`text-[10px] hidden sm:block uppercase tracking-wider font-bold ${
                      isCurrent ? 'text-[#1c1c1e]' : 'text-[#71717a]'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < stepsList.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 transition-colors ${
                      step > s.num ? 'bg-[#1c1c1e]' : 'bg-neutral-200'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* STEP 1: Elegir Barbero */}
        {step === 1 && (
          <div className="space-y-4">
            <h4 className="text-sm font-black text-[#1c1c1e]">
              Paso 1: Selecciona a tu barbero de confianza
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Jhoan */}
              <div
                onClick={() => setSelectedBarber('jhoan')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-4 ${
                  selectedBarber === 'jhoan'
                    ? 'border-2 border-[#1c1c1e] bg-neutral-100 shadow-md'
                    : 'border-neutral-300 hover:border-[#1c1c1e] bg-neutral-50/70'
                }`}
              >
                <img
                  src="/assets/barber-sample-1.jpg"
                  alt="Jhoan"
                  className="w-16 h-16 rounded-xl object-cover object-top mono-img border border-neutral-300 shrink-0"
                />
                <div>
                  <h5 className="font-serif font-black text-base text-[#1c1c1e]">
                    Jhoan
                  </h5>
                  <p className="text-[11px] text-[#1c1c1e] font-bold">Barber Stylist</p>
                  <p className="text-[11px] text-[#48484a] mt-0.5 font-medium">@jhoan_o204</p>
                </div>
              </div>

              {/* Kevin */}
              <div
                onClick={() => setSelectedBarber('kevin')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-4 ${
                  selectedBarber === 'kevin'
                    ? 'border-2 border-[#1c1c1e] bg-neutral-100 shadow-md'
                    : 'border-neutral-300 hover:border-[#1c1c1e] bg-neutral-50/70'
                }`}
              >
                <img
                  src="/assets/barber-sample-2.jpg"
                  alt="Kevin"
                  className="w-16 h-16 rounded-xl object-cover object-top mono-img border border-neutral-300 shrink-0"
                />
                <div>
                  <h5 className="font-serif font-black text-base text-[#1c1c1e]">
                    Kevin
                  </h5>
                  <p className="text-[11px] text-[#1c1c1e] font-bold">Barber Stylist</p>
                  <p className="text-[11px] text-[#48484a] mt-0.5 font-medium">@__050723</p>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="px-7 py-3 rounded-full bg-[#c8c8cc] hover:bg-[#b8b8bd] text-[#1c1c1e] font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-transform active:scale-95 border border-[#8e8e93]"
              >
                <span>Continuar</span>
                <ChevronRight className="w-4 h-4 stroke-[3.5] text-[#1c1c1e]" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Fecha y Hora */}
        {step === 2 && (
          <div className="space-y-4">
            <h4 className="text-sm font-black text-[#1c1c1e]">
              Paso 2: Elige fecha y hora para tu atención
            </h4>

            <div>
              <label className="block text-xs font-bold text-[#48484a] mb-1">
                Fecha del turno:
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-neutral-100 border border-neutral-300 rounded-xl px-4 py-2.5 text-sm text-[#1c1c1e] font-bold focus:outline-none focus:border-[#1c1c1e]"
              />
            </div>

            {/* Banner de Horario del Día Seleccionado */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 border border-neutral-300 text-xs shadow-2xs">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#1c1c1e]" />
                <span className="font-extrabold text-[#1c1c1e]">{currentSchedule.label}:</span>
              </div>
              <span className="bg-[#8e8e93] text-white text-[11px] font-black px-3 py-1 rounded-full shadow-2xs">
                {currentSchedule.hours}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#48484a] mb-2">
                Horas disponibles:
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1">
                {timeSlots.map((time) => {
                  const isSel = selectedTime === time;
                  return (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={`py-2 px-1 text-center rounded-lg text-xs font-bold transition-all ${
                        isSel
                          ? 'bg-[#1c1c1e] text-white shadow-md font-black'
                          : 'bg-neutral-100 border border-neutral-300 text-[#1c1c1e] hover:border-[#1c1c1e]'
                      }`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-neutral-200">
              <button
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-full border border-neutral-300 bg-neutral-100 text-xs font-bold text-[#1c1c1e] hover:text-black flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Atrás</span>
              </button>
              <button
                onClick={() => setStep(3)}
                className="px-7 py-3 rounded-full bg-[#c8c8cc] hover:bg-[#b8b8bd] text-[#1c1c1e] font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-transform active:scale-95 border border-[#8e8e93]"
              >
                <span>Continuar</span>
                <ChevronRight className="w-4 h-4 stroke-[3.5] text-[#1c1c1e]" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Selección de Servicios */}
        {step === 3 && (
          <div className="space-y-4">
            <h4 className="text-sm font-black text-[#1c1c1e]">
              Paso 3: Selecciona tus servicios (puedes marcar varios)
            </h4>

            <div className="space-y-2.5 max-h-60 overflow-y-auto p-1">
              {services.map((svc) => {
                const isChecked = selectedServices.includes(svc.id);

                return (
                  <div
                    key={svc.id}
                    onClick={() => toggleService(svc.id)}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      isChecked
                        ? 'border-2 border-[#1c1c1e] bg-neutral-100 shadow-sm'
                        : 'border-neutral-300 bg-white hover:border-[#1c1c1e]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border text-xs transition-colors ${
                          isChecked
                            ? 'bg-[#1c1c1e] border-[#1c1c1e] text-white font-bold'
                            : 'border-neutral-300 bg-neutral-100'
                        }`}
                      >
                        {isChecked && '✓'}
                      </div>
                      <div>
                        <h5 className="text-sm font-black text-[#1c1c1e]">{svc.nombre}</h5>
                        <p className="text-[11px] text-[#48484a] font-medium">
                          {svc.duracionMinutos} min
                        </p>
                      </div>
                    </div>
                    <span className="font-serif text-sm font-black text-[#1c1c1e]">
                      {formatCOP(svc.precio)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Resumen de totales */}
            <div className="p-3.5 rounded-2xl bg-neutral-100 border border-neutral-300 flex items-center justify-between text-xs">
              <span className="text-[#48484a] font-bold">
                Total estimado ({totalDuration} min):
              </span>
              <span className="font-serif text-lg font-black text-[#1c1c1e]">
                {formatCOP(totalPrice)}
              </span>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-neutral-200">
              <button
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-full border border-neutral-300 bg-neutral-100 text-xs font-bold text-[#1c1c1e] hover:text-black flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Atrás</span>
              </button>
              <button
                onClick={() => setStep(4)}
                className="px-7 py-3 rounded-full bg-[#c8c8cc] hover:bg-[#b8b8bd] text-[#1c1c1e] font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-transform active:scale-95 border border-[#8e8e93]"
              >
                <span>Continuar</span>
                <ChevronRight className="w-4 h-4 stroke-[3.5] text-[#1c1c1e]" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Datos del Cliente */}
        {step === 4 && (
          <form onSubmit={handleFinishBooking} className="space-y-4">
            <h4 className="text-sm font-black text-[#1c1c1e]">
              Paso 4: Ingresa tus datos para registrar la reserva
            </h4>

            <div>
              <label className="block text-xs font-bold text-[#48484a] mb-1">
                Nombre Completo *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#71717a] absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Ej: Carlos Ramírez"
                  value={clientData.nombre}
                  onChange={(e) => setClientData({ ...clientData, nombre: e.target.value })}
                  className="w-full bg-neutral-100 border border-neutral-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#1c1c1e] font-bold focus:outline-none focus:border-[#1c1c1e] placeholder:text-[#8e8e93]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#48484a] mb-1">
                Número de Celular / WhatsApp *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#71717a] absolute left-3.5 top-3" />
                <input
                  type="tel"
                  required
                  placeholder="Ej: 316 127 7718"
                  value={clientData.telefono}
                  onChange={(e) => setClientData({ ...clientData, telefono: e.target.value })}
                  className="w-full bg-neutral-100 border border-neutral-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#1c1c1e] font-bold focus:outline-none focus:border-[#1c1c1e] placeholder:text-[#8e8e93]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#48484a] mb-1">
                Notas especiales o peticiones (opcional):
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-[#71717a] absolute left-3.5 top-3" />
                <textarea
                  rows="2"
                  placeholder="Ej: Tengo barba larga, corte estilo taper fade..."
                  value={clientData.notas}
                  onChange={(e) => setClientData({ ...clientData, notas: e.target.value })}
                  className="w-full bg-neutral-100 border border-neutral-300 rounded-xl pl-10 pr-4 py-2 text-sm text-[#1c1c1e] font-bold focus:outline-none focus:border-[#1c1c1e] placeholder:text-[#8e8e93] resize-none"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-neutral-200">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-5 py-2.5 rounded-full border border-neutral-300 bg-neutral-100 text-xs font-bold text-[#1c1c1e] hover:text-black flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Atrás</span>
              </button>
              <button
                type="submit"
                className="px-7 py-3 rounded-full bg-[#c8c8cc] hover:bg-[#b8b8bd] text-[#1c1c1e] font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-transform active:scale-95 border border-[#8e8e93]"
              >
                <span>Confirmar Reserva</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 5: Confirmado / Listo */}
        {step === 5 && (
          <div className="text-center py-3 space-y-5 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-neutral-100 border border-neutral-300 text-[#1c1c1e] mx-auto flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="px-3.5 py-1 rounded-full bg-neutral-100 border border-neutral-300 text-[#1c1c1e] text-xs font-mono font-bold tracking-wider">
                Código: {reservationCode}
              </span>
              <h4 className="font-serif text-2xl font-black text-[#1c1c1e] mt-2">
                ¡Tu Cita Ha Sido Agendada!
              </h4>
              <p className="text-xs text-[#48484a] mt-1 max-w-sm mx-auto font-medium">
                Gracias, <strong className="text-[#1c1c1e] font-black">{clientData.nombre}</strong>. Hemos reservado tu turno con éxito.
              </p>
            </div>

            {/* Ticket Card */}
            <div className="p-4 rounded-2xl bg-neutral-100 border border-neutral-300 text-left text-xs space-y-2 max-w-md mx-auto shadow-xs">
              <div className="flex justify-between border-b border-neutral-200 pb-2">
                <span className="text-[#48484a] font-medium">Barbero:</span>
                <span className="font-black text-[#1c1c1e]">{barberObj.nombre}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-200 pb-2">
                <span className="text-[#48484a] font-medium">Fecha & Hora:</span>
                <span className="font-black text-[#1c1c1e]">
                  {selectedDate} a las {selectedTime}
                </span>
              </div>
              <div className="flex justify-between border-b border-neutral-200 pb-2">
                <span className="text-[#48484a] font-medium">Servicios:</span>
                <span className="font-black text-[#1c1c1e]">{serviceNames}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-[#48484a] font-medium">Total a Pagar en Local:</span>
                <span className="font-serif text-base font-black text-[#1c1c1e]">
                  {formatCOP(totalPrice)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={`https://wa.me/57${business?.telefono || '3161277718'}?text=${encodeURIComponent(
                  whatsappMessage
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-7 py-3.5 rounded-full bg-[#1c1c1e] hover:bg-black text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>Enviar Confirmación a WhatsApp</span>
              </a>
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-full border border-neutral-300 bg-neutral-100 text-xs font-bold text-[#1c1c1e] hover:bg-neutral-200"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
