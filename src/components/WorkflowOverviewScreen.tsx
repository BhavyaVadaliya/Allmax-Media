'use client';

import React from 'react';
import { Flame, Lock, Home, ArrowRight } from 'lucide-react';
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

  return (
    <div className="relative h-full w-full bg-gradient-to-b from-[#FFF6F1] via-[#F8FAFC] to-[#EEF2F6] text-slate-900 flex flex-col overflow-hidden select-none safe-bottom">
      {/* Subtle Ambient Background Texture & Brand Glows */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />
      <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#FF4800]/12 blur-[85px]" />
      <div className="pointer-events-none absolute bottom-16 -left-24 w-72 h-72 rounded-full bg-amber-400/12 blur-[90px]" />

      {/* Top Header (Matches Home & Studio Light Theme) */}
      <header className="relative z-10 shrink-0 bg-white/90 backdrop-blur-md border-b border-slate-200/80 safe-top">
        <div className="px-4 py-3 flex items-center justify-between max-w-lg w-full mx-auto">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-full bg-[#FF4800] flex items-center justify-center shadow-md shadow-orange-500/25">
              <Flame className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1 text-sm font-black tracking-wide uppercase">
                <span className="text-slate-900">ALLMAX</span>
                <span className="text-[#FF4800]">STUDIO</span>
              </div>
              <div className="flex items-center space-x-1 text-[11px] font-mono text-slate-500">
                <Lock className="w-3 h-3 text-emerald-600" />
                <span className="truncate max-w-[160px]">{profile.handle}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onGoHome}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-800 active:scale-95 transition-all"
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
          <span className="text-[11px] font-black tracking-[0.14em] text-[#FF4800] uppercase block">
            GUIDED 3-STEP WORKFLOW
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
            Allmax Content Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Three fast steps turn raw gym footage into search-indexed Instagram Reels &amp; TikTok videos.
          </p>
        </div>

        {/* 3 Step Summary Cards */}
        <div className="space-y-3 pt-1">
          {/* Step 1 Card */}
          <div className="rounded-3xl bg-white border-2 border-[#FF4800]/60 p-4 shadow-sm flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#FF4800] text-white font-black text-base flex items-center justify-center shrink-0 shadow-md shadow-orange-500/25">
              1
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-black text-slate-900">1. Create</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pick your <strong className="text-slate-900">Allmax SKU</strong>, choose a{' '}
                <strong className="text-slate-900">Search-Intent Hook</strong>, and record or upload a clip using the{' '}
                <span className="italic">eye-level teleprompter</span>.
              </p>
            </div>
          </div>

          {/* Step 2 Card */}
          <div className="rounded-3xl bg-white border border-slate-200 p-4 shadow-sm flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 font-black text-base flex items-center justify-center shrink-0">
              2
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-black text-slate-900">2. Package</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Composite the studio tub, top badge, kinetic overlays,{' '}
                <strong className="text-slate-900">CODE: {promoShort}</strong>, animated QR end-card, and IG/TikTok SEO copy.
              </p>
            </div>
          </div>

          {/* Step 3 Card */}
          <div className="rounded-3xl bg-white border border-slate-200 p-4 shadow-sm flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 font-black text-base flex items-center justify-center shrink-0">
              3
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-black text-slate-900">3. Post</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Preview the full 9:16 reel with its animated Allmax outro, edit your caption, and share directly to{' '}
                <strong className="text-slate-900">Instagram Reels &amp; TikTok</strong>.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Continue CTA */}
      <div className="relative z-10 shrink-0 bg-white/90 backdrop-blur-md border-t border-slate-200/80 p-3.5 sm:p-4">
        <div className="max-w-lg w-full mx-auto">
          <button
            onClick={onContinue}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#FF4800] hover:bg-[#E63E00] text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-orange-500/25 transition-all active:scale-95 flex items-center justify-center space-x-2"
          >
            <span>Continue to Step 1: Create</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
};
