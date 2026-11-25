'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, Zap } from 'lucide-react';

interface AppIntroSplashProps {
  onComplete: () => void;
}

export const AppIntroSplash: React.FC<AppIntroSplashProps> = ({ onComplete }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 2200);

    const doneTimer = setTimeout(() => {
      onComplete();
    }, 2700);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  const handleSkip = () => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(onComplete, 400);
  };

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-[100] bg-[#06090F] flex flex-col items-center justify-center overflow-hidden select-none safe-top safe-bottom transition-all duration-500 ease-out cursor-pointer ${
        isExiting ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Animated Radial Persimmon Orange Energy Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[340px] h-[340px] sm:w-[440px] sm:h-[440px] rounded-full bg-[#FF4800]/25 blur-[95px] animate-intro-glow" />
      </div>

      {/* Subtle Diagonal Light Streaks */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(-35deg, transparent, transparent 70px, rgba(255, 72, 0, 0.14) 70px, rgba(255, 72, 0, 0.14) 72px)',
        }}
      />

      {/* Center Brand Choreography */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        {/* 1. Animated Logo Mark with Shockwave Ring */}
        <div className="relative flex items-center justify-center mb-6 animate-intro-pop">
          {/* Expanding pulse ring */}
          <span className="absolute w-24 h-24 rounded-3xl border-2 border-[#FF4800]/60 animate-intro-ring" />
          <span
            className="absolute w-24 h-24 rounded-3xl border border-[#FF4800]/40 animate-intro-ring"
            style={{ animationDelay: '0.45s' }}
          />

          {/* Core AM Badge */}
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-[#FF5E1A] to-[#FF3B00] flex items-center justify-center shadow-[0_0_45px_rgba(255,72,0,0.65)] border border-white/20">
            <span className="font-black text-3xl text-white tracking-tighter">AM</span>
            <Zap className="w-4 h-4 text-white/90 fill-white absolute -top-1.5 -right-1.5 bg-[#06090F] rounded-full p-0.5 border border-[#FF4800]" />
          </div>
        </div>

        {/* 2. Wordmark Slide-Up */}
        <div className="space-y-1 animate-intro-slide-up">
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-[0.22em] uppercase">
            ALLMAX
          </h1>
          <p className="text-xs sm:text-sm font-extrabold text-[#FF4800] tracking-[0.35em] uppercase">
            MEDIA STUDIO
          </p>
        </div>

        {/* 3. Expanding Orange Accent Line */}
        <div className="w-36 h-1 bg-white/10 rounded-full overflow-hidden mt-5 mb-4">
          <div className="h-full bg-gradient-to-r from-[#FF4800] via-[#FF7A00] to-[#FF4800] rounded-full animate-intro-progress" />
        </div>

        {/* 4. Creator Tagline Badge */}
        <div className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md animate-intro-fade">
          <Sparkles className="w-3.5 h-3.5 text-[#FF4800]" />
          <span className="text-[10px] sm:text-xs font-bold text-slate-300 tracking-wider uppercase">
            Fuel Your Greatness • Reel Creator
          </span>
        </div>
      </div>

      {/* Subtle Tap-to-Skip Hint at Bottom */}
      <div className="absolute bottom-8 text-[10px] font-bold text-slate-500 uppercase tracking-widest animate-pulse">
        Tap anywhere to skip
      </div>
    </div>
  );
};
