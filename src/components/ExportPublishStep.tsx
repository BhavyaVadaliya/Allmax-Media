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
  ExternalLink,
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
  const [customCaption, setCustomCaption] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isHashtagsCopied, setIsHashtagsCopied] = useState<boolean>(false);
  const [socialModal, setSocialModal] = useState<'tiktok' | 'instagram' | null>(null);

  const [isMuted, setIsMuted] = useState<boolean>(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const templates = getCaptionTemplates(product);
    setCaptionTemplates(templates);
    const active = templates.find((t) => t.tone === selectedTone) || templates[0];
    if (active) {
      setCustomCaption(active.caption);
    }
  }, [product, selectedTone]);

  const activeTemplate =
    captionTemplates.find((t) => t.tone === selectedTone) || captionTemplates[0];

  const handleCopyCaption = async () => {
    const fullText = `${customCaption}\n\n${activeTemplate?.hashtags.join(' ')}`;
    try {
      await navigator.clipboard.writeText(fullText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch (e) {
      console.error('Clipboard copy failed:', e);
    }
  };

  const handleCopyHashtags = async () => {
    if (!activeTemplate) return;
    try {
      await navigator.clipboard.writeText(activeTemplate.hashtags.join(' '));
      setIsHashtagsCopied(true);
      setTimeout(() => setIsHashtagsCopied(false), 2500);
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

  const handleTikTokUpload = async () => {
    if (navigator.share && renderResult.blob) {
      try {
        const file = new File([renderResult.blob], renderResult.filename, {
          type: renderResult.blob.type,
        });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Allmax ${product.name} Mockup`,
            text: `${customCaption}\n\n${activeTemplate?.hashtags.join(' ')}`,
            files: [file],
          });
          return;
        }
      } catch (err) {}
    }
    handleCopyCaption();
    setSocialModal('tiktok');
  };

  const handleInstagramUpload = async () => {
    if (navigator.share && renderResult.blob) {
      try {
        const file = new File([renderResult.blob], renderResult.filename, {
          type: renderResult.blob.type,
        });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Allmax ${product.name} Mockup`,
            text: `${customCaption}\n\n${activeTemplate?.hashtags.join(' ')}`,
            files: [file],
          });
          return;
        }
      } catch (err) {}
    }
    handleCopyCaption();
    setSocialModal('instagram');
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4 sm:space-y-6 py-2 sm:py-4">
      {/* Step Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 gap-2">
        <div>
          <h1 className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
            Your Mockup Video is Ready!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 hidden sm:block">
            Download your video or share directly with ready-to-use captions.
          </p>
        </div>

        <div className="flex items-center space-x-1.5 sm:space-x-2 text-xs font-semibold shrink-0">
          <button
            onClick={onTweakPosition}
            className="flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Adjust</span> Position
          </button>
          <button
            onClick={onNewMockup}
            className="flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Responsive 1-col on mobile, 2-col on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start">
        {/* Left Column: Video Player & Direct Download */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Mockup Video Preview
            </h3>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              H.264 MP4
            </span>
          </div>

          {/* Video Player */}
          <div className="relative aspect-[9/16] max-h-[340px] sm:max-h-[480px] mx-auto bg-slate-950 rounded-xl overflow-hidden shadow-md flex items-center justify-center">
            {renderResult.mediaType === 'video' ? (
              <video
                ref={videoRef}
                key={renderResult.url}
                src={renderResult.url}
                controls
                autoPlay
                loop
                muted={isMuted}
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={renderResult.url}
                alt="Rendered Mockup"
                className="w-full h-full object-cover"
              />
            )}

            {/* Sound Toggle */}
            {renderResult.mediaType === 'video' && (
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="absolute top-2.5 right-2.5 bg-black/75 hover:bg-black px-2.5 py-1 rounded-full text-[11px] text-white flex items-center space-x-1 transition-all"
              >
                {isMuted ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                    <span>Muted</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Sound On</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Primary Download Button */}
          <button
            onClick={handleDownload}
            className="w-full py-3 sm:py-3.5 rounded-xl bg-[#FF4800] hover:bg-[#E63E00] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-orange-500/25 transition-all active:scale-95 flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Download Video (.mp4)</span>
          </button>

          {/* Overlaid Product Spec info */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center space-x-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-[#FF4800]" />
              <span className="font-bold text-slate-900 truncate">{product.name}</span>
            </div>
            <a
              href={product.allmaxUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FF4800] font-semibold hover:underline flex items-center space-x-0.5 shrink-0 ml-2"
            >
              <span>Product Page</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Right Column: Social Publishing & Captions */}
        <div className="lg:col-span-7 space-y-4">
          {/* Quick Social Buttons */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-[#FF4800]" />
              <span>Share to Social Platforms</span>
            </h3>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={handleTikTokUpload}
                className="flex items-center justify-center space-x-2 py-3 px-3 rounded-xl bg-slate-950 hover:bg-black text-white text-xs font-bold transition-all shadow-md active:scale-95"
              >
                <span className="font-black">TikTok</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={handleInstagramUpload}
                className="flex items-center justify-center space-x-2 py-3 px-3 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-95 text-white text-xs font-bold transition-all shadow-md active:scale-95"
              >
                <span className="font-black">Instagram Reels</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-white/80" />
              </button>
            </div>
          </div>

          {/* Ready-to-Use Fitness Captions */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#FF4800]" />
                <span>Ready-To-Use Fitness Caption</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-medium">Auto-generated</span>
            </div>

            {/* Tone Selector Chips */}
            <div className="flex space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
              {captionTemplates.map((tpl) => (
                <button
                  key={tpl.tone}
                  onClick={() => {
                    setSelectedTone(tpl.tone);
                    setCustomCaption(tpl.caption);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 active:scale-95 ${
                    selectedTone === tpl.tone
                      ? 'bg-[#FF4800] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tpl.title}
                </button>
              ))}
            </div>

            {/* Caption Text Box */}
            <div className="space-y-2">
              <textarea
                value={customCaption}
                onChange={(e) => setCustomCaption(e.target.value)}
                rows={3}
                className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#FF4800] resize-none"
                placeholder="Write your caption..."
              />

              {/* Hashtags Strip */}
              <div className="flex flex-wrap gap-1 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                {activeTemplate?.hashtags.map((h, i) => (
                  <span key={i} className="text-[10px] font-bold text-[#FF4800]">
                    {h}
                  </span>
                ))}
              </div>

              {/* 1-Click Copy Button */}
              <button
                onClick={handleCopyCaption}
                className={`w-full py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center space-x-2 active:scale-95 ${
                  isCopied
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800 shadow-sm'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800 shadow-sm'
                }`}
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Caption &amp; Hashtags Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy Caption &amp; Hashtags</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Social Upload Guidance Modal */}
      {socialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="font-extrabold text-slate-900 text-sm">
              Ready to Share to {socialModal === 'tiktok' ? 'TikTok' : 'Instagram Reels'}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              1. Your video has been downloaded.<br />
              2. Your fitness caption and hashtags are copied to your clipboard.<br />
              3. Open {socialModal === 'tiktok' ? 'TikTok' : 'Instagram'} and paste the caption!
            </p>
            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setSocialModal(null)}
                className="flex-1 py-2 rounded-xl bg-[#FF4800] text-white text-xs font-bold shadow"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
