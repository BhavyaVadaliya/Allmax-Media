'use client';

import React, { useState } from 'react';
import { Flame, Lock, Home, PlusCircle, CheckCircle2, Copy, Check } from 'lucide-react';
import { CreatorProfile, PostHistoryItem } from '@/types';

interface PostHistoryScreenProps {
  profile: CreatorProfile;
  postHistory: PostHistoryItem[];
  onNewPost: () => void;
  onGoHome: () => void;
}

export const PostHistoryScreen: React.FC<PostHistoryScreenProps> = ({
  profile,
  postHistory,
  onNewPost,
  onGoHome,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const promoShort = profile.promoCode.split('•')[0].trim() || 'ALEX15';

  const handleCopyCaption = async (item: PostHistoryItem) => {
    const fallbackCaption = `${item.hookTitle || 'ALLMAX WORKOUT FUEL'} 🔥\n\nFueling my session with Allmax ${item.productName}. Use my code ${promoShort} at checkout for 20% off!\n\n#AllmaxNutrition #GymTok #FitnessReels`;
    const textToCopy = item.caption || fallbackCaption;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2200);
    } catch {
      // Ignore clipboard failure
    }
  };

  return (
    <div className="h-full w-full bg-[#F8FAFC] text-slate-900 flex flex-col overflow-hidden select-none">
      {/* Unified Top Header */}
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
            onClick={onGoHome}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-800 active:scale-95 transition-all"
            title="Back to Home"
          >
            <Home className="w-3.5 h-3.5 text-[#FF4800]" />
            <span>Home</span>
          </button>
        </div>
      </header>

      {/* Main Full-Screen Post History List */}
      <main className="flex-1 min-h-0 overflow-y-auto scrollbar-none px-4 py-4 max-w-lg w-full mx-auto space-y-3.5">
        {/* Title Row + New Post CTA */}
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Post History
            </h1>
            <p className="text-xs text-slate-500 truncate mt-0.5">
              Past packaged posts for {profile.handle}
            </p>
          </div>

          <button
            onClick={onNewPost}
            className="shrink-0 flex items-center space-x-1.5 px-3.5 py-2 rounded-full bg-[#FF4800] hover:bg-[#E63E00] text-white text-xs font-black shadow-md shadow-orange-500/25 active:scale-95 transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Post</span>
          </button>
        </div>

        {/* Post History Cards */}
        <div className="space-y-3 pb-4">
          {postHistory.map((item) => {
            const isCopied = copiedId === item.id;
            const platforms = item.platforms || ['Instagram Reels', 'TikTok'];
            return (
              <div
                key={item.id}
                className="rounded-3xl bg-white border border-slate-200 p-4 shadow-sm space-y-3"
              >
                {/* Top Row: Product SKU Pill + Published Badge */}
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg bg-orange-50 border border-[#FF4800]/35 text-[10px] font-black text-[#FF4800] uppercase tracking-wider">
                    {item.productName}
                  </span>

                  <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-600">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Published</span>
                  </span>
                </div>

                {/* Bold Quoted Hook Headline */}
                <h2 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-tight leading-snug">
                  &ldquo;{item.hookTitle || `${item.productName} WORKOUT REEL`}&rdquo;
                </h2>

                {/* Platform Pills */}
                <div className="flex flex-wrap gap-1.5">
                  {platforms.map((platform) => (
                    <span
                      key={platform}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200/80 text-[10px] font-bold text-slate-700"
                    >
                      {platform}
                    </span>
                  ))}
                </div>

                {/* Date + Metrics Row */}
                <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 pt-0.5">
                  <span>{item.createdAt}</span>
                  <span className="font-mono font-bold text-slate-700">
                    {item.saves.toLocaleString()} Saves • {item.codeUses.toLocaleString()} Code Uses
                  </span>
                </div>

                {/* Full-Width Copy Caption Button */}
                <button
                  onClick={() => handleCopyCaption(item)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#F8FAFC] hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 active:scale-[0.99] transition-all flex items-center justify-center space-x-1.5"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                      <span className="text-emerald-700">Caption Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy Caption</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </main>

      {/* Sticky Bottom Back to Home Bar */}
      <div className="shrink-0 bg-white border-t border-slate-200 p-3 safe-bottom max-w-lg w-full mx-auto">
        <button
          onClick={onGoHome}
          className="w-full py-3.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-black text-xs uppercase tracking-wider shadow-sm active:scale-95 transition-all flex items-center justify-center space-x-2"
        >
          <Home className="w-4 h-4 text-[#FF4800]" />
          <span>Back to Home</span>
        </button>
      </div>
    </div>
  );
};
