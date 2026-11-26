'use client';

import React, { useState } from 'react';
import {
  Flame,
  Lock,
  History,
  ArrowRight,
  ChevronRight,
  Settings,
  X,
  Check,
  Copy,
  Smartphone,
  RotateCcw,
  Video,
  Sparkles,
  Share2,
} from 'lucide-react';
import { CreatorProfile, PostHistoryItem } from '@/types';

interface HomeScreenProps {
  profile: CreatorProfile;
  onUpdateProfile: (profile: CreatorProfile) => void;
  postHistory: PostHistoryItem[];
  onCreatePost: () => void;
  onOpenHistory: () => void;
  onOpenMobileModal: () => void;
  onReplayIntro: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  profile,
  onUpdateProfile,
  postHistory,
  onCreatePost,
  onOpenHistory,
  onOpenMobileModal,
  onReplayIntro,
}) => {
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Local state for Settings form
  const [draftName, setDraftName] = useState(profile.studioName);
  const [draftHandle, setDraftHandle] = useState(profile.handle);
  const [draftCode, setDraftCode] = useState(profile.promoCode);

  const totalSaves = postHistory.reduce((acc, item) => acc + item.saves, 0);
  const totalCodeUses = postHistory.reduce((acc, item) => acc + item.codeUses, 0);
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

  const handleCopyCode = () => {
    navigator.clipboard.writeText(profile.promoCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleOpenSettings = () => {
    setDraftName(profile.studioName);
    setDraftHandle(profile.handle);
    setDraftCode(profile.promoCode);
    setShowSettingsModal(true);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      studioName: draftName.trim() || "Alex's Studio",
      handle: draftHandle.trim() || '@alex_lifts_allmax',
      promoCode: draftCode.trim() || 'ALEX15 • 20% OFF',
    });
    setShowSettingsModal(false);
  };

  return (
    <div className="relative h-full w-full bg-gradient-to-b from-[#080B12] via-[#0E1422] to-[#06080D] text-white flex flex-col overflow-hidden select-none safe-bottom">
      {/* Dark Athletic Carbon Grid + Radial Spotlight Background */}
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

      {/* Top Dark Glass Header */}
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
            onClick={handleOpenSettings}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold text-white active:scale-95 transition-all"
            title="Studio Settings"
          >
            <Settings className="w-3.5 h-3.5 text-[#FF4800]" />
            <span>Settings</span>
          </button>
        </div>
      </header>

      {/* Main Scrollable Unified Home + Content Engine */}
      <main className="relative z-10 flex-1 min-h-0 overflow-y-auto scrollbar-none px-4 py-4 max-w-lg w-full mx-auto space-y-4">
        {/* 1. Private Creator Workspace Card */}
        <section className="rounded-3xl bg-white/[0.06] backdrop-blur-md border border-white/12 p-4 space-y-3.5 shadow-lg">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <span className="text-[10px] font-black tracking-[0.14em] text-slate-400 uppercase block">
                PRIVATE CREATOR WORKSPACE
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5 truncate">
                {profile.studioName}
              </h1>
              <p className="text-xs font-mono text-slate-400 mt-0.5 truncate">{profile.handle}</p>
            </div>

            {/* Active Promo Code Pill */}
            <button
              onClick={handleCopyCode}
              className="shrink-0 text-right px-3 py-1.5 rounded-2xl bg-[#FF4800]/15 border border-[#FF4800]/45 hover:bg-[#FF4800]/25 active:scale-95 transition-all"
              title="Tap to copy promo code"
            >
              <span className="text-[9px] font-black tracking-wider text-[#FF6A2B] uppercase block">
                {copiedCode ? '✓ COPIED' : 'ACTIVE CODE'}
              </span>
              <span className="text-xs font-black text-white tracking-wide flex items-center justify-end gap-1 mt-0.5">
                <span>{profile.promoCode}</span>
                {copiedCode ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-2.5 h-2.5 text-slate-300" />
                )}
              </span>
            </button>
          </div>

          {/* 3 Metric Stat Cards */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-black/30 border border-white/10 py-2.5 px-2 text-center">
              <span className="text-lg sm:text-xl font-black text-white block leading-none">
                {postHistory.length}
              </span>
              <span className="text-[10px] font-bold text-slate-400 mt-1 block">
                Posts Created
              </span>
            </div>

            <div className="rounded-2xl bg-black/30 border border-white/10 py-2.5 px-2 text-center">
              <span className="text-lg sm:text-xl font-black text-emerald-400 block leading-none">
                {totalSaves.toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-slate-400 mt-1 block">Total Saves</span>
            </div>

            <div className="rounded-2xl bg-black/30 border border-white/10 py-2.5 px-2 text-center">
              <span className="text-lg sm:text-xl font-black text-[#FF6A2B] block leading-none">
                {totalCodeUses.toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-slate-400 mt-1 block">Code Uses</span>
            </div>
          </div>
        </section>

        {/* 2. Guided 3-Step Workflow: Allmax Content Engine */}
        <section className="space-y-3">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#FF4800]/15 border border-[#FF4800]/40">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF4800] animate-pulse" />
              <span className="text-[10px] font-black tracking-[0.14em] text-[#FF6A2B] uppercase">
                GUIDED 3-STEP WORKFLOW
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
              Allmax Content Engine
            </h2>
            <p className="text-xs text-slate-300/85 leading-relaxed">
              Three fast steps turn raw gym footage into search-indexed Instagram Reels &amp; TikTok
              videos.
            </p>
          </div>

          <div className="space-y-2.5">
            {steps.map((step) => {
              const StepIcon = step.icon;
              const cardClass = `group w-full text-left rounded-2xl p-3.5 transition-all duration-150 hover:-translate-y-0.5 flex items-center gap-3 ${
                step.active
                  ? 'cursor-pointer active:scale-[0.98] bg-gradient-to-r from-[#FF4800]/22 via-[#171E30]/95 to-[#121826]/95 border-2 border-[#FF4800] shadow-[0_10px_28px_-8px_rgba(255,72,0,0.45)]'
                  : 'cursor-default bg-gradient-to-r from-white/[0.08] to-white/[0.03] hover:from-[#FF4800]/15 hover:to-white/[0.07] border border-white/15 hover:border-[#FF4800]/60 shadow-[0_8px_22px_-8px_rgba(0,0,0,0.65)]'
              }`;

              const cardContent = (
                <>
                  <div
                    className={`w-10 h-10 rounded-xl font-black text-sm flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                      step.active
                        ? 'bg-[#FF4800] text-white shadow-lg shadow-[#FF4800]/40'
                        : 'bg-white/10 border border-white/15 text-white group-hover:bg-[#FF4800] group-hover:border-[#FF4800]'
                    }`}
                  >
                    {step.num}
                  </div>

                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm sm:text-base font-black text-white tracking-tight">
                        {step.title}
                      </h3>
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
                    <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all ${
                      step.active
                        ? 'bg-[#FF4800] text-white shadow-md shadow-[#FF4800]/30 group-hover:translate-x-0.5'
                        : 'bg-white/10 text-slate-300 group-hover:bg-[#FF4800] group-hover:text-white group-hover:translate-x-0.5'
                    }`}
                  >
                    <ChevronRight className="w-4 h-4 stroke-[3]" />
                  </div>
                </>
              );

              return step.active ? (
                <button key={step.num} type="button" onClick={onCreatePost} className={cardClass}>
                  {cardContent}
                </button>
              ) : (
                <div key={step.num} className={cardClass}>
                  {cardContent}
                </div>
              );
            })}
          </div>
        </section>

        {/* 3. Quick Navigation: Post History & Studio Settings */}
        <section className="grid grid-cols-2 gap-2.5 pb-1">
          <button
            onClick={onOpenHistory}
            className="text-left rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/12 p-3 flex items-center justify-between gap-2 active:scale-[0.98] transition-all"
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-400/25 flex items-center justify-center shrink-0">
                <History className="w-4 h-4 text-sky-400" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-black text-white truncate">Post History</h3>
                <p className="text-[10px] text-slate-400 truncate">Saves &amp; codes</p>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          <button
            onClick={handleOpenSettings}
            className="text-left rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/12 p-3 flex items-center justify-between gap-2 active:scale-[0.98] transition-all"
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#FF4800]/15 border border-[#FF4800]/30 flex items-center justify-center shrink-0">
                <Settings className="w-4 h-4 text-[#FF4800]" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-black text-white truncate">Studio Settings</h3>
                <p className="text-[10px] text-slate-400 truncate">Code &amp; app</p>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>
        </section>
      </main>

      {/* Bottom Sticky Continue CTA */}
      <div className="relative z-10 shrink-0 bg-[#0A0E18]/90 backdrop-blur-md border-t border-white/10 p-3.5 sm:p-4">
        <div className="max-w-lg w-full mx-auto">
          <button
            onClick={onCreatePost}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#FF4800] to-[#FF6200] hover:from-[#E63E00] hover:to-[#FF4800] text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-xl shadow-[#FF4800]/30 transition-all active:scale-95 flex items-center justify-center space-x-2"
          >
            <span>Continue to Step 1: Create</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </div>

      {/* Studio Settings Modal */}
      {showSettingsModal && (
        <div
          onClick={() => setShowSettingsModal(false)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0F1523] rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-white/15 text-white"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4 text-[#FF4800]" />
                <h3 className="text-base font-black text-white">Studio Settings</h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-3">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                  Workspace Name
                </label>
                <input
                  type="text"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-black/35 border border-white/15 text-sm font-bold text-white focus:outline-none focus:border-[#FF4800]"
                  placeholder="Alex's Studio"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                  Creator Handle
                </label>
                <input
                  type="text"
                  value={draftHandle}
                  onChange={(e) => setDraftHandle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-black/35 border border-white/15 text-sm font-mono font-bold text-white focus:outline-none focus:border-[#FF4800]"
                  placeholder="@alex_lifts_allmax"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                  Active Promo Code
                </label>
                <input
                  type="text"
                  value={draftCode}
                  onChange={(e) => setDraftCode(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-black/35 border border-white/15 text-sm font-black text-white focus:outline-none focus:border-[#FF4800]"
                  placeholder="ALEX15 • 20% OFF"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#FF4800] hover:bg-[#E63E00] text-white font-black text-xs uppercase tracking-wider shadow-md shadow-orange-500/25 active:scale-95 transition-all"
              >
                Save Workspace Settings
              </button>
            </form>

            <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowSettingsModal(false);
                  onOpenMobileModal();
                }}
                className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-[11px] font-bold text-white flex items-center justify-center space-x-1.5"
              >
                <Smartphone className="w-3.5 h-3.5 text-[#FF4800]" />
                <span>Android APK</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowSettingsModal(false);
                  onReplayIntro();
                }}
                className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-[11px] font-bold text-white flex items-center justify-center space-x-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-300" />
                <span>Replay Intro</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
