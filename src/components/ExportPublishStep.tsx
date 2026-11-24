'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Volume2,
  VolumeX,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  Maximize2,
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

  // 3-Mode Draggable bottom sheet slider: 'collapsed' (watch reel) | 'normal' (standard) | 'expanded' (big caption)
  const [sheetMode, setSheetMode] = useState<'collapsed' | 'normal' | 'expanded'>('normal');
  const [dragY, setDragY] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartYRef = useRef<number>(0);
  const sheetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const templates = getCaptionTemplates(product);
    setCaptionTemplates(templates);
    const active = templates.find((t) => t.tone === selectedTone) || templates[0];
    if (active) {
      setCaptionText(`${active.caption}\n\n${active.hashtags.join(' ')}`);
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

  // Touch Drag Handlers for Bottom Sheet Slider
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    dragStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - dragStartYRef.current;
    setDragY(deltaY);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (sheetMode === 'normal') {
      if (dragY > 50) {
        setSheetMode('collapsed');
      } else if (dragY < -50) {
        setSheetMode('expanded');
      }
    } else if (sheetMode === 'collapsed') {
      if (dragY < -40) {
        setSheetMode('normal');
      }
    } else if (sheetMode === 'expanded') {
      if (dragY > 50) {
        setSheetMode('normal');
      }
    }
    setDragY(0);
  };

  // Mouse Drag Handlers for Desktop Testing
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartYRef.current = e.clientY;
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaY = e.clientY - dragStartYRef.current;
      setDragY(deltaY);
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    if (sheetMode === 'normal') {
      if (dragY > 50) {
        setSheetMode('collapsed');
      } else if (dragY < -50) {
        setSheetMode('expanded');
      }
    } else if (sheetMode === 'collapsed') {
      if (dragY < -40) {
        setSheetMode('normal');
      }
    } else if (sheetMode === 'expanded') {
      if (dragY > 50) {
        setSheetMode('normal');
      }
    }
    setDragY(0);
  }, [isDragging, sheetMode, dragY]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div className="relative h-full w-full overflow-hidden select-none bg-black flex flex-col justify-between">
      {/* 1. Full-Height 9:16 Vertical Video Reel (Behind the sheet) */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black overflow-hidden">
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
            className="w-full h-full object-cover cursor-pointer"
          />
        )}

        {/* Floating Top Overlays on Video */}
        <div className="absolute top-3 left-3 z-20 flex items-center space-x-2">
          {renderResult.mediaType === 'video' && (
            <button
              onClick={toggleVideoPlayback}
              className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 flex items-center justify-center active:scale-90 transition-transform shadow-lg"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
            </button>
          )}

          {renderResult.mediaType === 'video' && (
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 flex items-center justify-center active:scale-90 transition-transform shadow-lg"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
            </button>
          )}
        </div>

        {/* Floating Fullscreen Mode Indicator when Collapsed */}
        {sheetMode === 'collapsed' && (
          <div className="absolute top-3 right-3 z-20 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-white font-extrabold flex items-center space-x-1 border border-white/20 shadow-lg">
            <span>Watching Full Reel</span>
          </div>
        )}
      </div>

      {/* 2. Draggable Bottom Sheet Slider (Caption, Share, Download, Done) */}
      <div
        ref={sheetRef}
        style={{
          transform:
            sheetMode === 'collapsed'
              ? `translateY(calc(100% - 68px + ${isDragging && dragY < 0 ? dragY : 0}px))`
              : `translateY(${
                  isDragging
                    ? sheetMode === 'expanded' && dragY < 0
                      ? 0
                      : dragY
                    : 0
                }px)`,
          transition: isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), height 0.35s ease',
        }}
        className={`absolute bottom-0 left-0 right-0 z-30 bg-white rounded-t-3xl shadow-[0_-12px_40px_rgba(0,0,0,0.45)] border-t border-slate-200/90 flex flex-col safe-bottom transition-all ${
          sheetMode === 'expanded' ? 'max-h-[88vh] h-[88vh]' : 'max-h-[58vh]'
        }`}
      >
        {/* Drag Handle & Slider Header */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          className="w-full pt-2.5 pb-2 px-4 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing hover:bg-slate-50 transition-colors rounded-t-3xl border-b border-slate-100 shrink-0 select-none"
        >
          {/* Slider Pill Handle */}
          <div className="w-12 h-1.5 bg-slate-300 rounded-full mb-1.5" />

          {/* Interactive Drag & Pull Options */}
          <div className="w-full flex items-center justify-between text-[11px] font-black uppercase tracking-wider px-1">
            {sheetMode === 'collapsed' ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSheetMode('normal');
                }}
                className="w-full flex items-center justify-center space-x-1 py-0.5 text-[#FF4800]"
              >
                <ChevronUp className="w-3.5 h-3.5 stroke-[3] animate-bounce" />
                <span>Pull up for Caption &amp; Share</span>
              </button>
            ) : sheetMode === 'normal' ? (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSheetMode('collapsed');
                  }}
                  className="flex items-center space-x-1 text-slate-500 hover:text-slate-800 active:scale-95 py-0.5 px-2 rounded-lg bg-slate-100"
                >
                  <ChevronDown className="w-3 h-3 stroke-[3]" />
                  <span>Full Reel</span>
                </button>

                <span className="text-[10px] text-slate-400 font-bold">Caption &amp; Share</span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSheetMode('expanded');
                  }}
                  className="flex items-center space-x-1 text-[#FF4800] hover:text-[#E63E00] active:scale-95 py-0.5 px-2 rounded-lg bg-orange-50 font-black shadow-sm"
                >
                  <span>Big Caption</span>
                  <Maximize2 className="w-3 h-3 stroke-[2.5]" />
                </button>
              </>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSheetMode('normal');
                }}
                className="w-full flex items-center justify-center space-x-1 py-0.5 text-slate-600 hover:text-slate-900 active:scale-95"
              >
                <ChevronDown className="w-3.5 h-3.5 stroke-[3]" />
                <span>Pull down to shrink caption</span>
              </button>
            )}
          </div>
        </div>

        {/* Sheet Content (When open, scrollable) */}
        <div className="p-3 sm:p-4 overflow-y-auto scrollbar-none space-y-3 flex-1 min-h-0">
          {/* Caption Card with char counter & style pills */}
          <div className="border border-slate-200 rounded-2xl p-3 shadow-sm space-y-2 bg-white">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
              <span className="font-extrabold text-slate-700">Write a caption...</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopyCaption}
                  className="flex items-center space-x-1 text-[10px] text-[#FF4800] font-black hover:underline active:scale-95"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span className="text-emerald-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
                <span className="text-slate-400">{captionText.length} chars</span>
              </div>
            </div>

            <textarea
              value={captionText}
              onChange={(e) => setCaptionText(e.target.value)}
              rows={sheetMode === 'expanded' ? 7 : 3}
              className={`w-full text-xs text-slate-800 placeholder-slate-400 bg-transparent border-0 p-0 focus:outline-none resize-none leading-relaxed font-medium ${
                sheetMode === 'expanded' ? 'min-h-[140px]' : ''
              }`}
              placeholder="Write a caption for your reel..."
            />

            {/* Style Pills Row (HIGH-ENERGY GYMTOK, ATHLETE & COACH BREAKDOWN, PRE-WORKOUT PUMP) */}
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

          {/* Direct Share Section (Instagram Reels & TikTok) */}
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

          {/* Primary Download Button */}
          <button
            onClick={handleDownload}
            className="w-full py-3.5 px-4 rounded-xl bg-[#FF4800] hover:bg-[#E63E00] text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-orange-500/25 transition-all active:scale-95 flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4 stroke-[3]" />
            <span>DOWNLOAD VIDEO (.MP4)</span>
          </button>

          {/* DONE Button (Directly below Download Button) */}
          <button
            onClick={onNewMockup}
            className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-black text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-md active:scale-95 transition-all flex items-center justify-center space-x-2"
          >
            <Check className="w-4 h-4 stroke-[3] text-emerald-400" />
            <span>DONE (CREATE NEW POST)</span>
          </button>

          {/* Subtle Back to Edit Option */}
          <button
            onClick={onTweakPosition}
            className="text-[11px] font-bold text-slate-400 hover:text-slate-600 block mx-auto pt-0.5 active:scale-95"
          >
            ← Back to Edit Mockup
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
