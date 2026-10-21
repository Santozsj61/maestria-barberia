import React, { useState, useEffect } from 'react';

export default function SplashScreen({ onComplete }) {
  const [phase, setPhase] = useState('entering');

  useEffect(() => {
    const timer1 = setTimeout(() => setPhase('visible'), 250);
    const timer2 = setTimeout(() => setPhase('exiting'), 1700);
    const timer3 = setTimeout(() => {
      setPhase('done');
      if (onComplete) onComplete();
    }, 2100);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  if (phase === 'done') return null;

  const handleSkip = () => {
    setPhase('done');
    if (onComplete) onComplete();
  };

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-mono-black px-6 transition-opacity duration-500 cursor-pointer ${
        phase === 'exiting' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center text-center max-w-sm">
        <img
          src="/assets/maestria-logo.png"
          alt="Maestría Barbería"
          className="h-16 sm:h-20 w-auto mb-8 animate-pulse transition-transform duration-700 mix-blend-multiply"
        />
        <h1 className="font-serif text-2xl sm:text-3xl text-mono-100 tracking-wide">
          Bienvenido a <span className="italic text-gold font-normal">Maestría Barbería</span>
        </h1>
        <div className="w-24 h-px gold-hairline my-6" />
        <p className="text-xs uppercase tracking-widest text-mono-400 font-medium">
          Barbería Premium & Exclusiva
        </p>
        <span className="text-[11px] text-mono-600 mt-8 font-light">
          (Toca para continuar)
        </span>
      </div>
    </div>
  );
}
