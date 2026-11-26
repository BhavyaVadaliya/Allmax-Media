'use client';

import React from 'react';
import {
  Flame,
  Lock,
  Home,
  ArrowRight,
  ChevronRight,
  Video,
  Sparkles,
  Share2,
} from 'lucide-react';
import { CreatorProfile } from '@/types';

interface WorkflowOverviewScreenProps {
  profile: CreatorProfile;
  onContinue: () => void;
  onGoHome: () => void;
}

export const WorkflowOverviewScreen: React.FC<WorkflowOverviewScreenProps> = ({
  profile,
  onContinue,
  onGoHome,
}) => {
  const promoShort = profile.promoCode.split('•')[0].trim() || 'ALEX15';

  const steps = [
    {
      num: 1,
      title: '1. Create',
      badge: 'START HERE',
      icon: Video,
      active: true,
      description: (
        <>
          Pick your <strong className="text-white">Allmax SKU</strong>, choose a{' '}
          <strong className="text-white">Search-Intent Hook</strong>, and record or upload a clip
          using the <span className="italic text-orange-200">eye-level teleprompter</span>.
        </>
      ),
    },
    {
      num: 2,
      title: '2. Package',
      badge: 'AI STUDIO',
      icon: Sparkles,
      active: false,
      description: (
        <>
          Composite the studio tub, top badge, kinetic overlays,{' '}
          <strong className="text-white">CODE: {promoShort}</strong>, animated QR end-card, and
          IG/TikTok SEO copy.
        </>
      ),
    },
    {
      num: 3,
      title: '3. Post',
      badge: 'EXPORT & SHARE',
      icon: Share2,
      active: false,
      description: (
        <>
          Preview the full 9:16 reel with its animated Allmax outro, edit your caption, and share
          directly to <strong className="text-white">Instagram Reels &amp; TikTok</strong>.
        </>
      ),
    },
  ];

  return (
    <div className="relative h-full w-full bg-gradient-to-b from-[#080B12] via-[#0E1422] to-[#06080D] text-white flex flex-col overflow-hidden select-none safe-bottom">
      {/* Athletic Carbon Grid + Radial Spotlight Background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'repeating-linear-gradient(-45deg, transparent, transparent 18px, rgba(255,72,0,0.04) 18px, rgba(255,72,0,0.04) 19px)',
        }}
      />
      <div className="pointer-events-none absolute -top-28 -right-20 w-80 h-80 rounded-full bg-[#FF4800]/25 blur-[95px]" />
      <div className="pointer-events-none absolute bottom-12 -left-24 w-72 h-72 rounded-full bg-amber-500/15 blur-[95px]" />

      {/* Top Header */}
      <header className="relative z-10 shrink-0 bg-[#0A0E18]/85 backdrop-blur-md border-b border-white/10 safe-top">
        <div className="px-4 py-3 flex items-center justify-between max-w-lg w-full mx-auto">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-full bg-[#FF4800] flex items-center justify-center shadow-lg shadow-[#FF4800]/35">
              <Flame className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1 text-sm font-black tracking-wide uppercase">
                <span className="text-white">ALLMAX</span>
                <span className="text-[#FF4800]">STUDIO</span>
              </div>
              <div className="flex items-center space-x-1 text-[11px] font-mono text-slate-400">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span className="truncate max-w-[160px]">{profile.handle}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onGoHome}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold text-white active:scale-95 transition-all"
            title="Back to Home"
          >
            <Home className="w-3.5 h-3.5 text-[#FF4800]" />
            <span>Home</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 min-h-0 overflow-y-auto scrollbar-none px-4 py-5 max-w-lg w-full mx-auto space-y-4">
        {/* Heading Block */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#FF4800]/15 border border-[#FF4800]/40">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF4800] animate-pulse" />
            <span className="text-[10px] font-black tracking-[0.14em] text-[#FF6A2B] uppercase">
              GUIDED 3-STEP WORKFLOW
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
            Allmax Content Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-300/85 leading-relaxed">
            Three fast steps turn raw gym footage into search-indexed Instagram Reels &amp; TikTok
            videos.
          </p>
        </div>

        {/* 3 Step Interactive Button Cards */}
        <div className="space-y-3 pt-1">
          {steps.map((step) => {
            const StepIcon = step.icon;
            return (
              <button
                key={step.num}
                type="button"
                onClick={onContinue}
                className={`group w-full text-left rounded-2xl p-4 transition-all duration-150 active:scale-[0.98] hover:-translate-y-0.5 flex items-center gap-3.5 cursor-pointer ${
                  step.active
                    ? 'bg-gradient-to-r from-[#FF4800]/22 via-[#171E30]/95 to-[#121826]/95 border-2 border-[#FF4800] shadow-[0_10px_28px_-8px_rgba(255,72,0,0.45)]'
                    : 'bg-gradient-to-r from-white/[0.08] to-white/[0.03] hover:from-[#FF4800]/15 hover:to-white/[0.07] border border-white/15 hover:border-[#FF4800]/60 shadow-[0_8px_22px_-8px_rgba(0,0,0,0.65)]'
                }`}
              >
                {/* Left Step Number Pill */}
                <div
                  className={`w-11 h-11 rounded-xl font-black text-base flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                    step.active
                      ? 'bg-[#FF4800] text-white shadow-lg shadow-[#FF4800]/40'
                      : 'bg-white/10 border border-white/15 text-white group-hover:bg-[#FF4800] group-hover:border-[#FF4800]'
                  }`}
                >
                  {step.num}
                </div>

                {/* Middle Copy */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center space-x-2">
                    <h2 className="text-base font-black text-white tracking-tight">
                      {step.title}
                    </h2>
                    <span
                      className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[9px] font-black tracking-wider uppercase ${
                        step.active
                          ? 'bg-[#FF4800] text-white'
                          : 'bg-white/10 text-slate-300 group-hover:bg-[#FF4800]/25 group-hover:text-orange-200'
                      }`}
                    >
                      <StepIcon className="w-2.5 h-2.5" />
                      <span>{step.badge}</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{step.description}</p>
                </div>

                {/* Right Button Chevron */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    step.active
                      ? 'bg-[#FF4800] text-white shadow-md shadow-[#FF4800]/30 group-hover:translate-x-0.5'
                      : 'bg-white/10 text-slate-300 group-hover:bg-[#FF4800] group-hover:text-white group-hover:translate-x-0.5'
                  }`}
                >
                  <ChevronRight className="w-4 h-4 stroke-[3]" />
                </div>
              </button>
            );
          })}
        </div>
      </main>

      {/* Bottom Continue CTA */}
      <div className="relative z-10 shrink-0 bg-[#0A0E18]/90 backdrop-blur-md border-t border-white/10 p-3.5 sm:p-4">
        <div className="max-w-lg w-full mx-auto">
          <button
            onClick={onContinue}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#FF4800] to-[#FF6200] hover:from-[#E63E00] hover:to-[#FF4800] text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-xl shadow-[#FF4800]/30 transition-all active:scale-95 flex items-center justify-center space-x-2"
          >
            <span>Continue to Step 1: Create</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
};
