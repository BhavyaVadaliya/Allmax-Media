'use client';

import React, { useEffect, useState } from 'react';
import { ALLMAX_PRODUCTS } from '@/data/allmaxProducts';

interface AppIntroSplashProps {
  onComplete: () => void;
}

const PILLARS = ['RECORD', 'OVERLAY', 'EXPORT'];

export const AppIntroSplash: React.FC<AppIntroSplashProps> = ({ onComplete }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [activePillar, setActivePillar] = useState(0);

  // Pick 3 signature Allmax tubs for the 3D fan-out hero showcase
  const tubCenter = ALLMAX_PRODUCTS[0]; // ISOFLEX
  const tubLeft = ALLMAX_PRODUCTS[2] || ALLMAX_PRODUCTS[1]; // IMPACT IGNITER
  const tubRight = ALLMAX_PRODUCTS[3] || ALLMAX_PRODUCTS[1]; // AMINOCORE

  useEffect(() => {
    const pillarTimer1 = setTimeout(() => setActivePillar(1), 750);
    const pillarTimer2 = setTimeout(() => setActivePillar(2), 1500);
    const exitTimer = setTimeout(() => setIsExiting(true), 2750);
    const doneTimer = setTimeout(() => onComplete(), 3250);

    return () => {
      clearTimeout(pillarTimer1);
      clearTimeout(pillarTimer2);
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  const handleSkip = () => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(onComplete, 420);
  };

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-[100] bg-[#05070D] flex flex-col items-center justify-center overflow-hidden select-none safe-top safe-bottom cursor-pointer transition-all duration-500 ease-out ${
        isExiting ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* 1. 3D Perspective Studio Grid Floor */}
      <div
        className="absolute inset-x-0 bottom-0 h-[45vh] opacity-25 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,72,0,0.28) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,72,0,0.28) 1px, transparent 1px)',
          backgroundSize: '42px 42px',
          transform: 'perspective(480px) rotateX(62deg) scale(1.6)',
          transformOrigin: 'bottom center',
          maskImage: 'linear-gradient(to top, rgba(0,0,0,1), transparent)',
          WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1), transparent)',
        }}
      />

      {/* 2. Pulsing Persimmon Orange Radial Core Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[340px] h-[340px] sm:w-[460px] sm:h-[460px] rounded-full bg-[#FF4800]/30 blur-[105px] animate-intro-glow" />
      </div>

      {/* 3. Rising Energy Sparks */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { left: '18%', bottom: '22%', delay: '0s', size: 'w-1.5 h-1.5' },
          { left: '32%', bottom: '15%', delay: '0.4s', size: 'w-1 h-1' },
          { left: '52%', bottom: '18%', delay: '0.2s', size: 'w-1.5 h-1.5' },
          { left: '68%', bottom: '20%', delay: '0.7s', size: 'w-1 h-1' },
          { left: '82%', bottom: '14%', delay: '0.5s', size: 'w-1.5 h-1.5' },
        ].map((spark, idx) => (
          <span
            key={idx}
            style={{ left: spark.left, bottom: spark.bottom, animationDelay: spark.delay }}
            className={`absolute ${spark.size} rounded-full bg-[#FF6B00] shadow-[0_0_8px_#FF4800] animate-intro-spark`}
          />
        ))}
      </div>

      {/* 4. Camera Viewfinder HUD Corners (Signals Video Reel Studio) */}
      <div className="absolute inset-5 sm:inset-8 pointer-events-none flex flex-col justify-between">
        <div className="flex items-start justify-between">
          {/* Top-Left Bracket + REC indicator */}
          <div className="flex items-center space-x-2 border-t-2 border-l-2 border-white/25 pt-2 pl-2.5 pr-3 rounded-tl-lg">
            <span className="w-2 h-2 rounded-full bg-[#FF4800] animate-ping" />
            <span className="text-[10px] font-black tracking-widest text-white/75 uppercase">
              REC • STUDIO
            </span>
          </div>

          {/* Top-Right Bracket + Format Telemetry */}
          <div className="border-t-2 border-r-2 border-white/25 pt-2 pr-2.5 pl-3 rounded-tr-lg text-right">
            <span className="text-[10px] font-black tracking-widest text-[#FF4800] uppercase">
              9:16 REEL
            </span>
          </div>
        </div>

        <div className="flex items-end justify-between">
          {/* Bottom-Left Bracket */}
          <div className="border-b-2 border-l-2 border-white/25 pb-2 pl-2.5 pr-4 rounded-bl-lg">
            <span className="text-[9px] font-bold tracking-widest text-white/45 uppercase">
              ALLMAX NUTRITION®
            </span>
          </div>

          {/* Bottom-Right Bracket */}
          <div className="border-b-2 border-r-2 border-white/25 pb-2 pr-2.5 pl-4 rounded-br-lg">
            <span className="text-[9px] font-bold tracking-widest text-white/45 uppercase">
              TAP TO SKIP →
            </span>
          </div>
        </div>
      </div>

      {/* 5. Center Hero Stage: Orbiting Rings + 3D Fanned Product Tubs + Kinetic Typography */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        {/* Orbital Rings & 3D Product Fan Showcase */}
        <div className="relative w-56 h-48 flex items-center justify-center mb-3">
          {/* Outer Dashed Orbit Ring (CW) */}
          <div className="absolute w-48 h-48 rounded-full border border-dashed border-[#FF4800]/45 animate-intro-orbit-cw" />
          {/* Inner Accent Arc Ring (CCW) */}
          <div className="absolute w-36 h-36 rounded-full border-2 border-transparent border-t-[#FF4800] border-b-white/30 animate-intro-orbit-ccw" />

          {/* Left Product Tub (Fanned) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={tubLeft.svgGraphic}
            alt={tubLeft.name}
            className="absolute w-20 h-26 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] animate-intro-tub-left"
          />

          {/* Right Product Tub (Fanned) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={tubRight.svgGraphic}
            alt={tubRight.name}
            className="absolute w-20 h-26 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] animate-intro-tub-right"
          />

          {/* Center Hero Product Tub */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={tubCenter.svgGraphic}
            alt={tubCenter.name}
            className="relative z-10 w-28 h-36 object-contain drop-shadow-[0_0_28px_rgba(255,72,0,0.55)] animate-intro-tub-center"
          />
        </div>

        {/* Kinetic Wordmark with Light-Slash Sweep */}
        <div className="relative overflow-hidden px-4 py-1 animate-intro-slam">
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-[0.2em] uppercase leading-none">
            ALLMAX
          </h1>
          {/* Diagonal Light Slash Overlay */}
          <div className="absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-white/75 to-transparent blur-[2px] animate-intro-slash pointer-events-none" />
        </div>

        <p className="text-xs sm:text-sm font-black text-[#FF4800] tracking-[0.38em] uppercase mt-1 animate-intro-slide-up">
          CREATOR STUDIO
        </p>

        {/* Dynamic 3-Step Kinetic Pill Bar: RECORD -> OVERLAY -> EXPORT */}
        <div className="flex items-center space-x-2 mt-5 animate-intro-fade">
          {PILLARS.map((label, idx) => (
            <div
              key={label}
              className={`px-2.5 py-1 rounded-full text-[9px] font-black tracking-widest uppercase transition-all duration-300 border ${
                idx === activePillar
                  ? 'bg-[#FF4800] text-white border-[#FF4800] shadow-[0_0_16px_rgba(255,72,0,0.65)] scale-105'
                  : idx < activePillar
                  ? 'bg-white/15 text-white/90 border-white/20'
                  : 'bg-white/5 text-white/40 border-white/10'
              }`}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Sleek Energy Progress Bar */}
        <div className="w-44 h-1 bg-white/10 rounded-full overflow-hidden mt-4">
          <div className="h-full bg-gradient-to-r from-[#FF4800] via-[#FF8800] to-white rounded-full animate-intro-progress" />
        </div>
      </div>
    </div>
  );
};
