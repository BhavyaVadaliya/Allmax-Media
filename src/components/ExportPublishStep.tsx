'use client';

import React, { useState, useRef } from 'react';
import {
  RenderResult,
  AllmaxProduct,
  SearchIntentHook,
} from '@/types';
import {
  Download,
  Check,
  ExternalLink,
  Instagram,
  Smartphone,
  Home,
  Play,
  X,
  Volume2,
  VolumeX,
  Share2,
} from 'lucide-react';

interface ExportPublishStepProps {
  renderResult: RenderResult;
  product: AllmaxProduct;
  selectedHook?: SearchIntentHook | null;
  promoCode?: string;
  creatorHandle?: string;
  onGoToStep1: () => void;
  onTweakPosition: () => void;
  onNewMockup: () => void;
}

export const ExportPublishStep: React.FC<ExportPublishStepProps> = ({
  renderResult,
  product,
  selectedHook,
  promoCode = 'ALEX15 • 20% OFF',
  creatorHandle = '@alex_lifts_allmax',
  onGoToStep1,
  onTweakPosition,
  onNewMockup,
}) => {
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [showReelPreview, setShowReelPreview] = useState<boolean>(false);
  const [actionModal, setActionModal] = useState<'download' | 'share' | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [sharedBoth, setSharedBoth] = useState<boolean>(false);
  const [previewCurrentTime, setPreviewCurrentTime] = useState<number>(0);
  const [previewDuration, setPreviewDuration] = useState<number>(0);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);

  const formatTime = (sec: number) => {
    if (!Number.isFinite(sec) || sec < 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const hookTitle = selectedHook?.title || 'POST-WORKOUT RECOVERY HACK!';
  const promoShort = promoCode.split('•')[0].trim() || 'ALEX15';

  const igSeoCaption = `The cleanest ${product.category.toLowerCase()} I've found for fast recovery. 🏆\n\n${
    selectedHook?.script ||
    `Switching to Allmax ${product.shortName} (${product.tagline}) changes everything. Use code ${promoShort} at checkout!`
  }\n\nAlt Text: Fitness athlete ${creatorHandle} featuring Allmax ${product.shortName} with code ${promoShort}\n#AllmaxNutrition #${product.shortName.replace(/\s+/g, '')} #GymTok #FitnessReels`;

  const tiktokSearchCaption = `${hookTitle} 🔥 ${product.shortName} (${product.tagline}) — Use code ${promoShort} for 20% OFF! #Allmax #GymTok #WorkoutFuel`;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2600);
  };

  const triggerFileDownload = () => {
    const href =
      renderResult.blob ? URL.createObjectURL(renderResult.blob) : renderResult.url;
    const link = document.createElement('a');
    link.href = href;
    link.download = renderResult.filename || 'allmax-reel-720x1280.mp4';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (renderResult.blob) {
      setTimeout(() => URL.revokeObjectURL(href), 4000);
    }
  };

  const handleDownload = () => {
    triggerFileDownload();
    setActionModal('download');
  };

  const handleInstagramPost = async () => {
    try {
      await navigator.clipboard.writeText(igSeoCaption);
    } catch {
      // Ignore clipboard error
    }

    if (navigator.share && renderResult.blob) {
      try {
        const file = new File([renderResult.blob], renderResult.filename, {
          type: renderResult.blob.type,
        });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Allmax ${product.shortName} Reel`,
            text: igSeoCaption,
            files: [file],
          });
          return;
        }
      } catch {
        // Fallback below
      }
    }

    showToast('Instagram SEO Caption & Alt Text copied!');
    window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
  };

  const handleTikTokPost = async () => {
    try {
      await navigator.clipboard.writeText(tiktokSearchCaption);
    } catch {
      // Ignore
    }

    if (navigator.share && renderResult.blob) {
      try {
        const file = new File([renderResult.blob], renderResult.filename, {
          type: renderResult.blob.type,
        });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Allmax ${product.shortName} TikTok`,
            text: tiktokSearchCaption,
            files: [file],
          });
          return;
        }
      } catch {
        // Fallback below
      }
    }

    showToast('TikTok Search Caption copied!');
    window.open('https://www.tiktok.com/upload', '_blank', 'noopener,noreferrer');
  };

  const handleShareBoth = async () => {
    try {
      await navigator.clipboard.writeText(`${igSeoCaption}\n\n${tiktokSearchCaption}`);
    } catch {
      // Ignore
    }
    setSharedBoth(true);
    setActionModal('share');
  };

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC] overflow-hidden select-none">
      {/* Top 3-Step Pill Bar */}
      <div className="shrink-0 bg-white border-b border-slate-200 px-3 py-2">
        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={onGoToStep1}
            className="py-1.5 px-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-black text-center hover:bg-emerald-100 active:scale-95 transition-all"
          >
            ✓ Step 1: Create
          </button>
          <button
            onClick={onTweakPosition}
            className="py-1.5 px-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-black text-center hover:bg-emerald-100 active:scale-95 transition-all"
          >
            ✓ Step 2: Package
          </button>
          <div className="py-1.5 px-2 rounded-xl bg-[#FF4800] text-white text-[11px] font-black text-center shadow-sm shadow-orange-500/20">
            Step 3: Post
          </div>
        </div>
      </div>

      {/* Scrollable Main Content */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none p-3.5 space-y-3 safe-bottom">
        {/* 1. Packaged & Ready Summary Card */}
        <div className="rounded-3xl bg-white border border-slate-200 p-3.5 shadow-sm flex items-center space-x-3.5">
          <div className="w-16 h-20 rounded-2xl bg-[#F8FAFC] border border-slate-200 flex items-center justify-center shrink-0 p-1.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.svgGraphic}
              alt={product.name}
              className="h-full w-auto object-contain drop-shadow-sm"
            />
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-[9px] font-black text-emerald-700 uppercase">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
                <span>PACKAGED &amp; READY</span>
              </span>
              <span className="text-[10px] font-black text-[#FF4800] uppercase">
                {promoShort}
              </span>
            </div>

            <h2 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-tight truncate">
              {hookTitle}
            </h2>

            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] text-slate-500 font-medium truncate">
                {product.shortName} • 720×1280 {renderResult.mediaType === 'video' ? 'MP4' : 'PNG'} + SEO Copy
              </p>

              <button
                onClick={() => setShowReelPreview(true)}
                className="shrink-0 inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-[10px] font-black text-[#FF4800] hover:bg-orange-100 active:scale-95"
              >
                <Play className="w-2.5 h-2.5 fill-[#FF4800]" />
                <span>Preview</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. 1. Download Branded MP4 */}
        <button
          onClick={handleDownload}
          className="w-full rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 p-3.5 shadow-sm flex items-center justify-between active:scale-[0.99] transition-all"
        >
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center">
              <Download className="w-4 h-4 text-[#FF4800] stroke-[2.5]" />
            </div>
            <span className="text-xs sm:text-sm font-black text-slate-900">
              1. Download Branded {renderResult.mediaType === 'video' ? 'MP4 (720×1280)' : 'PNG'}
            </span>
          </div>

          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-black text-slate-500 uppercase">
            {renderResult.mediaType === 'video' ? 'MP4' : 'PNG'}
          </span>
        </button>

        {/* 3. 2. Instagram Reels */}
        <div className="rounded-3xl bg-white border border-slate-200 p-3.5 shadow-sm space-y-2.5">
          <div className="flex items-center space-x-2">
            <Instagram className="w-4 h-4 text-pink-600" />
            <h3 className="text-xs sm:text-sm font-black text-slate-900">
              2. Instagram Reels
            </h3>
          </div>

          <button
            onClick={handleInstagramPost}
            className="w-full rounded-2xl bg-[#F8FAFC] hover:bg-slate-100 border border-slate-200 px-3.5 py-3 flex items-center justify-between text-xs font-bold text-slate-800 active:scale-[0.99] transition-all"
          >
            <span>Copy SEO Caption &amp; Alt Text • Open Instagram</span>
            <ExternalLink className="w-3.5 h-3.5 text-pink-600 shrink-0" />
          </button>
        </div>

        {/* 4. 3. TikTok Search */}
        <div className="rounded-3xl bg-white border border-slate-200 p-3.5 shadow-sm space-y-2.5">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-4 h-4 text-sky-600" />
            <h3 className="text-xs sm:text-sm font-black text-slate-900">
              3. TikTok Search
            </h3>
          </div>

          <button
            onClick={handleTikTokPost}
            className="w-full rounded-2xl bg-[#F8FAFC] hover:bg-slate-100 border border-slate-200 px-3.5 py-3 flex items-center justify-between text-xs font-bold text-slate-800 active:scale-[0.99] transition-all"
          >
            <span>Copy Search Caption • Open TikTok</span>
            <ExternalLink className="w-3.5 h-3.5 text-sky-600 shrink-0" />
          </button>
        </div>

        {/* 4. Share with Both Instagram & TikTok */}
        <div className="rounded-3xl bg-orange-50/60 border-2 border-[#FF4800]/45 p-4 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-[#FF4800]" />
                <span>4. Share to Both (IG &amp; TikTok)</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                1-Tap multi-platform launch ({creatorHandle})
              </p>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-white border border-orange-200 text-[9px] font-black text-[#FF4800] uppercase">
              MULTI-PLATFORM
            </span>
          </div>

          <button
            onClick={handleShareBoth}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#FF4800] hover:bg-[#E63E00] text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-orange-500/25 transition-all active:scale-95 flex items-center justify-center space-x-2"
          >
            {sharedBoth ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Ready on Instagram &amp; TikTok!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>Share with Both TikTok &amp; Instagram</span>
              </>
            )}
          </button>
        </div>

        {/* 5. Back to Dashboard Button */}
        <button
          onClick={onNewMockup}
          className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-black text-xs uppercase tracking-wider shadow-sm active:scale-95 transition-all flex items-center justify-center space-x-2"
        >
          <Home className="w-4 h-4 text-[#FF4800]" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-xl border border-white/10">
          {toastMsg}
        </div>
      )}

      {/* Download / Dummy Upload Confirmation Popup Modal */}
      {actionModal && (
        <div
          onClick={() => setActionModal(null)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-xs w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-center text-slate-900"
          >
            <div className="w-14 h-14 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mx-auto">
              <Check className="w-7 h-7 text-emerald-600 stroke-[3]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900">
                {actionModal === 'download'
                  ? 'Reel Downloaded!'
                  : 'Reel Uploaded Successfully!'}
              </h3>
              <p className="text-xs text-slate-500">
                {actionModal === 'download'
                  ? 'Your branded 720×1280 MP4 reel has been saved.'
                  : `Your Allmax ${product.shortName} reel is now live on Instagram & TikTok.`}
              </p>
            </div>

            {actionModal === 'download' ? (
              <div className="rounded-2xl bg-[#F8FAFC] border border-slate-200 p-3 text-xs space-y-1 text-left">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-500">File</span>
                  <span className="font-mono font-bold text-slate-800 truncate max-w-[165px]">
                    {renderResult.filename}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-500">Size</span>
                  <span className="font-mono font-bold text-slate-800">
                    {(renderResult.sizeBytes / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-left">
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 flex items-center justify-between text-xs">
                  <span className="font-black text-slate-800 flex items-center gap-1.5">
                    <Instagram className="w-3.5 h-3.5 text-pink-600" />
                    <span>Instagram Reels</span>
                  </span>
                  <span className="text-[10px] font-black text-emerald-700 uppercase">
                    ✓ Uploaded
                  </span>
                </div>

                <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 flex items-center justify-between text-xs">
                  <span className="font-black text-slate-800 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-sky-600" />
                    <span>TikTok</span>
                  </span>
                  <span className="text-[10px] font-black text-emerald-700 uppercase">
                    ✓ Uploaded
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={() => setActionModal(null)}
              className="w-full py-3 px-4 rounded-2xl bg-[#FF4800] hover:bg-[#E63E00] text-white font-black text-xs uppercase tracking-wider shadow-md shadow-orange-500/25 active:scale-95 transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Fullscreen Reel Preview Modal */}
      {showReelPreview && (
        <div
          onClick={() => setShowReelPreview(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="group relative w-full max-w-sm aspect-[9/16] max-h-[82vh] bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/20"
          >
            {renderResult.mediaType === 'video' ? (
              <video
                ref={previewVideoRef}
                src={renderResult.url}
                autoPlay
                loop
                muted={isMuted}
                playsInline
                onLoadedMetadata={(e) => {
                  setPreviewDuration(e.currentTarget.duration || 0);
                  setPreviewCurrentTime(0);
                }}
                onTimeUpdate={(e) => {
                  setPreviewCurrentTime(e.currentTarget.currentTime);
                  if (e.currentTarget.duration && previewDuration !== e.currentTarget.duration) {
                    setPreviewDuration(e.currentTarget.duration);
                  }
                }}
                className="w-full h-full object-cover"
              />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={renderResult.url}
                alt="Final Mockup"
                className="w-full h-full object-cover"
              />
            )}

            {/* Hover Progress Bar + Reel Time */}
            {renderResult.mediaType === 'video' && (
              <div className="absolute inset-x-0 bottom-0 z-20 px-3.5 pb-3 pt-8 bg-gradient-to-t from-black/85 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="flex items-center justify-between text-[11px] font-mono font-bold text-white/90 mb-1.5">
                  <span>{formatTime(previewCurrentTime)}</span>
                  <span>{formatTime(previewDuration)}</span>
                </div>
                <div
                  onClick={(e) => {
                    const video = previewVideoRef.current;
                    if (!video || !previewDuration) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                    video.currentTime = pct * previewDuration;
                    setPreviewCurrentTime(video.currentTime);
                  }}
                  className="w-full h-1.5 bg-white/25 rounded-full overflow-hidden cursor-pointer"
                >
                  <div
                    className="h-full bg-[#FF4800] rounded-full transition-[width] duration-75"
                    style={{
                      width: `${
                        previewDuration > 0
                          ? Math.min(100, (previewCurrentTime / previewDuration) * 100)
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            )}

            <div className="absolute top-3 right-3 flex items-center space-x-2">
              {renderResult.mediaType === 'video' && (
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="w-8 h-8 rounded-full bg-black/65 text-white flex items-center justify-center border border-white/20"
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4 text-slate-300" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                  )}
                </button>
              )}
              <button
                onClick={() => setShowReelPreview(false)}
                className="w-8 h-8 rounded-full bg-black/65 text-white flex items-center justify-center border border-white/20"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
