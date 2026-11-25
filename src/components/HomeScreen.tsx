'use client';

import React, { useState } from 'react';
import {
  Flame,
  Lock,
  Plus,
  History,
  ArrowRight,
  Settings,
  X,
  Check,
  Copy,
  Smartphone,
  RotateCcw,
  Film,
  Image as ImageIcon,
} from 'lucide-react';
import { CreatorProfile, PostHistoryItem } from '@/types';

interface HomeScreenProps {
  profile: CreatorProfile;
  onUpdateProfile: (profile: CreatorProfile) => void;
  postHistory: PostHistoryItem[];
  onCreatePost: () => void;
  onOpenMobileModal: () => void;
  onReplayIntro: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  profile,
  onUpdateProfile,
  postHistory,
  onCreatePost,
  onOpenMobileModal,
  onReplayIntro,
}) => {
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Local state for Settings form
  const [draftName, setDraftName] = useState(profile.studioName);
  const [draftHandle, setDraftHandle] = useState(profile.handle);
  const [draftCode, setDraftCode] = useState(profile.promoCode);

  const totalSaves = postHistory.reduce((acc, item) => acc + item.saves, 0);
  const totalCodeUses = postHistory.reduce((acc, item) => acc + item.codeUses, 0);

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
    <div className="h-full w-full bg-[#F8FAFC] text-slate-900 flex flex-col overflow-hidden select-none safe-bottom">
      {/* Top Header (Matches App Light Theme) */}
      <header className="shrink-0 bg-white border-b border-slate-200 safe-top">
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
            onClick={handleOpenSettings}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-800 active:scale-95 transition-all"
            title="Studio Settings"
          >
            <Settings className="w-3.5 h-3.5 text-[#FF4800]" />
            <span>Settings</span>
          </button>
        </div>
      </header>

      {/* Main Scrollable Home Content */}
      <main className="flex-1 min-h-0 overflow-y-auto scrollbar-none px-4 py-4 max-w-lg w-full mx-auto space-y-3.5">
        {/* 1. Private Creator Workspace Card */}
        <section className="rounded-3xl bg-white border border-slate-200 p-4 sm:p-5 space-y-4 shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <span className="text-[10px] font-black tracking-[0.14em] text-slate-400 uppercase block">
                PRIVATE CREATOR WORKSPACE
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5 truncate">
                {profile.studioName}
              </h1>
              <p className="text-xs font-mono text-slate-500 mt-0.5 truncate">
                {profile.handle}
              </p>
            </div>

            {/* Active Promo Code Pill */}
            <button
              onClick={handleCopyCode}
              className="shrink-0 text-right px-3 py-1.5 rounded-2xl bg-orange-50 border border-[#FF4800]/35 hover:bg-orange-100/70 active:scale-95 transition-all"
              title="Tap to copy promo code"
            >
              <span className="text-[9px] font-black tracking-wider text-[#FF4800] uppercase block">
                {copiedCode ? '✓ COPIED' : 'ACTIVE CODE'}
              </span>
              <span className="text-xs font-black text-slate-900 tracking-wide flex items-center justify-end gap-1 mt-0.5">
                <span>{profile.promoCode}</span>
                {copiedCode ? (
                  <Check className="w-3 h-3 text-emerald-600" />
                ) : (
                  <Copy className="w-2.5 h-2.5 text-slate-400" />
                )}
              </span>
            </button>
          </div>

          {/* 3 Metric Stat Cards */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="rounded-2xl bg-[#F8FAFC] border border-slate-200/80 py-3 px-2 text-center">
              <span className="text-xl sm:text-2xl font-black text-slate-900 block leading-none">
                {postHistory.length}
              </span>
              <span className="text-[10px] font-bold text-slate-500 mt-1.5 block">
                Posts Created
              </span>
            </div>

            <div className="rounded-2xl bg-[#F8FAFC] border border-slate-200/80 py-3 px-2 text-center">
              <span className="text-xl sm:text-2xl font-black text-emerald-600 block leading-none">
                {totalSaves.toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-slate-500 mt-1.5 block">
                Total Saves
              </span>
            </div>

            <div className="rounded-2xl bg-[#F8FAFC] border border-slate-200/80 py-3 px-2 text-center">
              <span className="text-xl sm:text-2xl font-black text-[#FF4800] block leading-none">
                {totalCodeUses.toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-slate-500 mt-1.5 block">
                Code Uses
              </span>
            </div>
          </div>
        </section>

        {/* 2. Hero Action Card: Create Post (3-Step Content Engine) */}
        <button
          onClick={onCreatePost}
          className="w-full text-left rounded-3xl bg-gradient-to-br from-[#FF4800] via-[#FF530D] to-[#E63900] p-5 shadow-lg shadow-orange-500/25 hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-between gap-3 group"
        >
          <div className="space-y-2">
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-black/20 text-[10px] font-black tracking-wider text-white uppercase">
              <span>⚡ 3-STEP CONTENT ENGINE</span>
            </span>

            <div>
              <h2 className="text-2xl font-black text-white tracking-tight leading-tight">
                Create Post
              </h2>
              <p className="text-xs font-semibold text-white/95 mt-1">
                1. Create • 2. Package • 3. Post to IG &amp; TikTok
              </p>
            </div>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Plus className="w-6 h-6 text-white stroke-[2.5]" />
          </div>
        </button>

        {/* 3. Post History Card */}
        <button
          onClick={() => setShowHistoryModal(true)}
          className="w-full text-left rounded-3xl bg-white hover:bg-slate-50 border border-slate-200 p-4 flex items-center justify-between gap-3 shadow-sm active:scale-[0.99] transition-all"
        >
          <div className="flex items-center space-x-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0">
              <History className="w-5 h-5 text-sky-600" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-black text-slate-900">Post History</h3>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                View published Allmax posts, saves &amp; code uses
              </p>
            </div>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
        </button>

        {/* 4. Studio Settings Card */}
        <button
          onClick={handleOpenSettings}
          className="w-full text-left rounded-3xl bg-white hover:bg-slate-50 border border-slate-200 p-4 flex items-center justify-between gap-3 shadow-sm active:scale-[0.99] transition-all"
        >
          <div className="flex items-center space-x-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
              <Settings className="w-5 h-5 text-[#FF4800]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-black text-slate-900">Studio Settings</h3>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                Edit creator name, promo code, mobile app &amp; intro
              </p>
            </div>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
        </button>
      </main>

      {/* Post History Modal */}
      {showHistoryModal && (
        <div
          onClick={() => setShowHistoryModal(false)}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-slate-200 rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden shadow-2xl safe-bottom"
          >
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <History className="w-4 h-4 text-sky-600" />
                <h3 className="font-black text-slate-900 text-sm">
                  Published Post History ({postHistory.length})
                </h3>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-2.5 bg-[#F8FAFC]">
              {postHistory.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl bg-white border border-slate-200/90 p-3.5 flex items-center justify-between gap-3 shadow-sm"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                      {item.mediaType === 'video' ? (
                        <Film className="w-4 h-4 text-[#FF4800]" />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-[#FF4800]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-900 truncate">
                        {item.productName} {item.mediaType === 'video' ? 'Reel' : 'Post'}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{item.createdAt}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0 text-right">
                    <div>
                      <span className="text-xs font-black text-emerald-600 block">
                        {item.saves}
                      </span>
                      <span className="text-[9px] text-slate-400 uppercase font-bold">Saves</span>
                    </div>
                    <div>
                      <span className="text-xs font-black text-[#FF4800] block">
                        {item.codeUses}
                      </span>
                      <span className="text-[9px] text-slate-400 uppercase font-bold">Uses</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Studio Settings Modal */}
      {showSettingsModal && (
        <div
          onClick={() => setShowSettingsModal(false)}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-slate-200 rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden shadow-2xl safe-bottom"
          >
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4 text-[#FF4800]" />
                <h3 className="font-black text-slate-900 text-sm">Studio Settings</h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="p-4 overflow-y-auto space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Studio Name
                  </label>
                  <input
                    type="text"
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    className="w-full rounded-xl bg-[#F8FAFC] border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-[#FF4800]"
                    placeholder="Alex's Studio"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Creator Handle
                  </label>
                  <input
                    type="text"
                    value={draftHandle}
                    onChange={(e) => setDraftHandle(e.target.value)}
                    className="w-full rounded-xl bg-[#F8FAFC] border border-slate-200 px-3.5 py-2.5 text-sm font-mono text-slate-900 focus:outline-none focus:border-[#FF4800]"
                    placeholder="@alex_lifts_allmax"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Active Promo Code
                  </label>
                  <input
                    type="text"
                    value={draftCode}
                    onChange={(e) => setDraftCode(e.target.value)}
                    className="w-full rounded-xl bg-[#F8FAFC] border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-[#FF4800]"
                    placeholder="ALEX15 • 20% OFF"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#FF4800] hover:bg-[#E63E00] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-500/25 active:scale-95 transition-all"
              >
                Save Workspace Settings
              </button>

              <div className="border-t border-slate-100 pt-3 grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowSettingsModal(false);
                    onOpenMobileModal();
                  }}
                  className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-800 active:scale-95"
                >
                  <Smartphone className="w-3.5 h-3.5 text-[#FF4800]" />
                  <span>iOS / Android App</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowSettingsModal(false);
                    onReplayIntro();
                  }}
                  className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-800 active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-sky-600" />
                  <span>Replay Intro</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
