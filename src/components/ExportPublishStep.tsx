'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  RenderResult,
  AllmaxProduct,
  CaptionTemplate,
  CaptionTone,
} from '@/types';
import { getCaptionTemplates } from '@/data/captionTemplates';
import {
  Download,
  Share2,
  Copy,
  Check,
  RotateCcw,
  Sliders,
  Volume2,
  VolumeX,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

interface ExportPublishStepProps {
  renderResult: RenderResult;
  product: AllmaxProduct;
  onTweakPosition: () => void;
  onNewMockup: () => void;
}

export const ExportPublishStep: React.FC<ExportPublishStepProps> = ({
  renderResult,
  product,
  onTweakPosition,
  onNewMockup,
}) => {
  const [captionTemplates, setCaptionTemplates] = useState<CaptionTemplate[]>([]);
  const [selectedTone, setSelectedTone] = useState<CaptionTone>('gymtok');
  const [captionText, setCaptionText] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [socialModal, setSocialModal] = useState<'tiktok' | 'instagram' | null>(null);

  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const templates = getCaptionTemplates(product);
    setCaptionTemplates(templates);
    const active = templates.find((t) => t.tone === selectedTone) || templates[0];
    if (active) {
      setCaptionText(
        `${active.caption}\n\n${active.hashtags.join(' ')}`
      );
    }
  }, [product, selectedTone]);

  const activeTemplate =
    captionTemplates.find((t) => t.tone === selectedTone) || captionTemplates[0];

  const handleSelectTone = (tone: CaptionTone) => {
    setSelectedTone(tone);
    const tpl = captionTemplates.find((t) => t.tone === tone);
    if (tpl) {
      setCaptionText(`${tpl.caption}\n\n${tpl.hashtags.join(' ')}`);
    }
  };

  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(captionText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch (e) {
      console.error('Clipboard copy failed:', e);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = renderResult.url;
    link.download = renderResult.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShareToPlatform = async (platform: 'instagram' | 'tiktok') => {
    if (navigator.share && renderResult.blob) {
      try {
        const file = new File([renderResult.blob], renderResult.filename, {
          type: renderResult.blob.type,
        });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Allmax ${product.name} Workout Reel`,
            text: captionText,
            files: [file],
          });
          return;
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('Native share failed, showing fallback modal:', err);
        }
      }
    }

    await handleCopyCaption();
    setSocialModal(platform);
  };

  const toggleVideoPlayback = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="h-full flex flex-col justify-between overflow-hidden select-none">
      {/* 1. Top Video Preview Player (Matches Phone 5 in reference image) */}
      <div className="relative w-full h-[32vh] max-h-[260px] bg-black shrink-0 overflow-hidden flex items-center justify-center">
        {renderResult.mediaType === 'video' ? (
          <video
            ref={videoRef}
            key={renderResult.url}
            src={renderResult.url}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            className="w-full h-full object-cover cursor-pointer"
            onClick={toggleVideoPlayback}
          />
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={renderResult.url}
            alt="Rendered Mockup"
            className="w-full h-full object-cover"
          />
        )}

        {/* Video Sound Toggle Button */}
        {renderResult.mediaType === 'video' && (
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="absolute bottom-2.5 right-2.5 p-1.5 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 shadow-md"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* 2. Middle & Bottom Composer Sheet (Matches Phone 5 layout) */}
      <div className="flex-1 min-h-0 bg-white p-3 flex flex-col justify-between overflow-y-auto scrollbar-none safe-bottom space-y-2.5">
        {/* Caption Card with char counter & style pills */}
        <div className="border border-slate-200 rounded-2xl p-3 shadow-sm space-y-2 bg-white">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
            <span>Write a caption...</span>
            <span className="text-slate-400">{captionText.length} chars</span>
          </div>

          <textarea
            value={captionText}
            onChange={(e) => setCaptionText(e.target.value)}
            rows={3}
            className="w-full text-xs text-slate-800 placeholder-slate-400 bg-transparent border-0 p-0 focus:outline-none resize-none leading-relaxed font-medium"
            placeholder="Write a caption for your reel..."
          />

          {/* Style Pills Row (Matches Phone 5: HIGH-ENERGY GYMTOK & ATHLETE & COACH BREAKDOWN) */}
          <div className="pt-2 border-t border-slate-100 flex space-x-1.5 overflow-x-auto scrollbar-none">
            <button
              onClick={() => handleSelectTone('gymtok')}
              className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider whitespace-nowrap transition-all active:scale-95 ${
                selectedTone === 'gymtok'
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              HIGH-ENERGY GYMTOK
            </button>

            <button
              onClick={() => handleSelectTone('athlete')}
              className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider whitespace-nowrap transition-all active:scale-95 ${
                selectedTone === 'athlete'
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              ATHLETE &amp; COACH BREAKDOWN
            </button>

            <button
              onClick={() => handleSelectTone('promo')}
              className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider whitespace-nowrap transition-all active:scale-95 ${
                selectedTone === 'promo'
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              PRE-WORKOUT PUMP
            </button>
          </div>
        </div>

        {/* Direct Share Section (Matches Phone 5 DIRECT SHARE: Instagram Reels & TikTok) */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-900 block px-0.5">
            DIRECT SHARE:
          </span>

          <div className="grid grid-cols-2 gap-2">
            {/* Instagram Reels Button */}
            <button
              onClick={() => handleShareToPlatform('instagram')}
              className="flex items-center justify-center space-x-1.5 py-3 px-3 rounded-xl bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white text-xs font-black shadow-md shadow-pink-500/20 active:scale-95 transition-transform"
            >
              <span>Instagram Reels</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>

            {/* TikTok Button */}
            <button
              onClick={() => handleShareToPlatform('tiktok')}
              className="flex items-center justify-center space-x-1.5 py-3 px-3 rounded-xl bg-black text-white text-xs font-black shadow-md shadow-black/20 active:scale-95 transition-transform"
            >
              <span>TikTok</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-300" />
            </button>
          </div>
        </div>

        {/* Primary Download Button (Matches Phone 5 DOWNLOAD VIDEO (.MP4)) */}
        <button
          onClick={handleDownload}
          className="w-full py-3.5 px-4 rounded-xl bg-[#FF4800] hover:bg-[#E63E00] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-500/25 transition-all active:scale-95 flex items-center justify-center space-x-2"
        >
          <Download className="w-4 h-4 stroke-[3]" />
          <span>DOWNLOAD VIDEO (.MP4)</span>
        </button>

        {/* Bottom Navigation Links: Adjust Position & New Video */}
        <div className="flex items-center justify-between px-1 pt-0.5 text-xs font-bold text-slate-700">
          <button
            onClick={onTweakPosition}
            className="flex items-center space-x-1 py-1 px-2 rounded-lg hover:text-slate-900 active:scale-95"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            <span>Adjust Position</span>
          </button>

          <button
            onClick={onNewMockup}
            className="flex items-center space-x-1 py-1 px-2 rounded-lg hover:text-[#FF4800] active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>New Video</span>
          </button>
        </div>
      </div>

      {/* Social Guidance Modal */}
      {socialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xs w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-orange-50 text-[#FF4800] flex items-center justify-center">
              <Share2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-extrabold text-slate-900 text-sm">
                Share to {socialModal === 'tiktok' ? 'TikTok' : 'Instagram'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Caption copied to clipboard! Tap below to save your video and post.
              </p>
            </div>

            <button
              onClick={() => {
                handleDownload();
                setSocialModal(null);
              }}
              className="w-full py-2.5 rounded-xl bg-[#FF4800] hover:bg-[#E63E00] text-white text-xs font-black shadow-md"
            >
              Download &amp; Open {socialModal === 'tiktok' ? 'TikTok' : 'Instagram'}
            </button>

            <button
              onClick={() => setSocialModal(null)}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 block mx-auto"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
