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
  Play,
  Pause,
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

  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const templates = getCaptionTemplates(product);
    setCaptionTemplates(templates);
    const active = templates.find((t) => t.tone === selectedTone) || templates[0];
    if (active) {
      setCaptionText(active.caption);
    }
  }, [product, selectedTone]);

  const activeTemplate =
    captionTemplates.find((t) => t.tone === selectedTone) || captionTemplates[0];

  const handleSelectTone = (tone: CaptionTone) => {
    setSelectedTone(tone);
    const tpl = captionTemplates.find((t) => t.tone === tone);
    if (tpl) {
      setCaptionText(tpl.caption);
    }
  };

  const handleCopyCaption = async () => {
    const hashtags = activeTemplate?.hashtags.join(' ') || '';
    const fullText = `${captionText}\n\n${hashtags}`;
    try {
      await navigator.clipboard.writeText(fullText);
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
    const hashtags = activeTemplate?.hashtags.join(' ') || '';
    const shareText = `${captionText}\n\n${hashtags}`;

    if (navigator.share && renderResult.blob) {
      try {
        const file = new File([renderResult.blob], renderResult.filename, {
          type: renderResult.blob.type,
        });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Allmax ${product.name} Workout Reel`,
            text: shareText,
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
      {/* 1. Main Content Area (Thumbnail + Caption, Zero Scroll) */}
      <div className="flex-1 min-h-0 p-1 sm:p-2 flex flex-col justify-center space-y-2.5 overflow-hidden">
        {/* Instagram Post Composer Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-3 shadow-md space-y-2">
          <div className="flex gap-3 items-center">
            {/* Post Video Thumbnail Preview */}
            <div className="relative w-24 sm:w-28 aspect-[9/16] max-h-[160px] rounded-2xl overflow-hidden bg-black shrink-0 border border-slate-200 shadow-inner">
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

              {renderResult.mediaType === 'video' && (
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="absolute bottom-1 right-1 p-1 rounded-full bg-black/60 text-white"
                >
                  {isMuted ? <VolumeX className="w-2.5 h-2.5" /> : <Volume2 className="w-2.5 h-2.5" />}
                </button>
              )}

              <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-[7px] font-black text-white uppercase tracking-tight">
                AM
              </div>
            </div>

            {/* Caption Textarea */}
            <div className="flex-1 min-w-0 flex flex-col justify-between h-[140px] space-y-1">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                <span>Write a caption...</span>
                <span className="text-slate-400">{captionText.length} chars</span>
              </div>

              <textarea
                value={captionText}
                onChange={(e) => setCaptionText(e.target.value)}
                rows={3}
                className="w-full text-xs text-slate-800 placeholder-slate-400 bg-slate-50 border border-slate-200 rounded-xl p-2 focus:outline-none focus:ring-1 focus:ring-[#FF4800] focus:border-[#FF4800] resize-none leading-relaxed flex-1"
                placeholder="Write a caption for your reel..."
              />

              <div className="text-[10px] font-bold text-[#FF4800] truncate">
                {activeTemplate?.hashtags.join(' ')}
              </div>
            </div>
          </div>

          {/* Quick Caption Tone Selector Pills */}
          <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between gap-1.5">
            <div className="flex space-x-1 overflow-x-auto scrollbar-none flex-1">
              {captionTemplates.map((tpl) => {
                const isSelected = selectedTone === tpl.tone;
                return (
                  <button
                    key={tpl.tone}
                    onClick={() => handleSelectTone(tpl.tone)}
                    className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider whitespace-nowrap transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tpl.title}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleCopyCaption}
              className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold transition-all flex items-center space-x-1 shrink-0 active:scale-95 ${
                isCopied
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800 shadow-sm'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
              }`}
            >
              {isCopied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-slate-500" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Social Share Buttons */}
        <div className="bg-white border border-slate-200 rounded-2xl p-2.5 shadow-sm space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
            Direct Share:
          </span>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleShareToPlatform('instagram')}
              className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white text-xs font-black shadow-md shadow-pink-500/20 active:scale-95 transition-transform"
            >
              <span>Instagram Reels</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => handleShareToPlatform('tiktok')}
              className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-black text-white text-xs font-black shadow-md shadow-black/20 active:scale-95 transition-transform"
            >
              <span>TikTok Post</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Docked Bottom Action Drawer (Fixed, No Scrolling) */}
      <div className="bg-white border-t border-slate-200 p-2.5 sm:p-3 shadow-2xl safe-bottom space-y-2">
        {/* Big Primary Download Button */}
        <button
          onClick={handleDownload}
          className="w-full py-3 px-4 rounded-xl bg-[#FF4800] hover:bg-[#E63E00] text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-orange-500/25 transition-all active:scale-95 flex items-center justify-center space-x-2"
        >
          <Download className="w-4 h-4 stroke-[3]" />
          <span>Download Video (.mp4)</span>
        </button>

        {/* Secondary Navigation Options */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <button
            onClick={onTweakPosition}
            className="flex-1 flex items-center justify-center space-x-1 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs font-bold active:scale-95"
          >
            <Sliders className="w-3 h-3" />
            <span>Adjust Position</span>
          </button>

          <button
            onClick={onNewMockup}
            className="flex-1 flex items-center justify-center space-x-1 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:text-[#FF4800] text-xs font-bold active:scale-95"
          >
            <RotateCcw className="w-3 h-3" />
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
