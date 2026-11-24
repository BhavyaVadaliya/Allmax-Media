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
    <div className="w-full max-w-6xl mx-auto space-y-6 py-4">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 pb-4 gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Your Mockup Video is Ready!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Download your video or share it directly to TikTok and Instagram with ready-to-use captions.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 text-xs font-semibold">
          <button
            onClick={onTweakPosition}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Adjust Placement</span>
          </button>
          <button
            onClick={onNewMockup}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Video</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Video Player & Direct Download (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Preview Video
          </h3>

          {/* Video Player */}
          <div className="relative aspect-[9/16] max-h-[500px] mx-auto bg-slate-950 rounded-xl overflow-hidden shadow-md flex items-center justify-center">
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
            className="w-full py-3.5 rounded-xl bg-[#FF4800] hover:bg-[#E63E00] text-white font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-orange-500/25 transition-all active:scale-95 flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Download Video (.mp4)</span>
          </button>

          {/* Product link */}
          <div className="pt-1 flex items-center justify-between text-xs text-slate-500">
            <span>Overlaid Product: <strong className="text-slate-800">{product.name}</strong></span>
            <a
              href={product.allmaxUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FF4800] hover:underline flex items-center space-x-0.5"
            >
              <span>View Product</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Right Column: Social Publishing & Captions (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Social Buttons */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3.5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Upload to Social Media
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* TikTok */}
              <button
                onClick={handleTikTokUpload}
                className="p-4 rounded-xl border border-slate-200 hover:border-black bg-slate-50 hover:bg-slate-100 transition-all text-left flex items-center space-x-3.5 group"
              >
                <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-black text-xs shadow-sm">
                  TT
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">TikTok</span>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-black transition-colors" />
                  </div>
                  <span className="text-[11px] text-slate-500">Ready in 9:16 vertical</span>
                </div>
              </button>

              {/* Instagram */}
              <button
                onClick={handleInstagramUpload}
                className="p-4 rounded-xl border border-slate-200 hover:border-pink-500 bg-slate-50 hover:bg-slate-100 transition-all text-left flex items-center space-x-3.5 group"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center font-black text-xs shadow-sm">
                  IG
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">Instagram Reels</span>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-pink-600 transition-colors" />
                  </div>
                  <span className="text-[11px] text-slate-500">Optimized for Reels</span>
                </div>
              </button>
            </div>
          </div>

          {/* Captions Generator */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Ready-to-Use Captions
              </h3>

              {/* Clean Tone Pills */}
              <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
                {captionTemplates.map((tpl) => (
                  <button
                    key={tpl.tone}
                    onClick={() => {
                      setSelectedTone(tpl.tone);
                      setCustomCaption(tpl.caption);
                    }}
                    className={`px-2.5 py-1 rounded-md capitalize transition-all ${
                      selectedTone === tpl.tone
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {tpl.tone}
                  </button>
                ))}
              </div>
            </div>

            {/* Editable Caption Textarea */}
            <div className="space-y-1.5">
              <textarea
                rows={5}
                value={customCaption}
                onChange={(e) => setCustomCaption(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm text-slate-800 leading-relaxed focus:outline-none focus:border-[#FF4800] focus:bg-white transition-all"
              />
            </div>

            {/* Hashtags */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-slate-600">Hashtags:</span>
                <button
                  onClick={handleCopyHashtags}
                  className="text-[#FF4800] hover:underline"
                >
                  {isHashtagsCopied ? 'Hashtags Copied!' : 'Copy Tags Only'}
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                {activeTemplate?.hashtags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Big Copy Caption Button */}
            <button
              onClick={handleCopyCaption}
              className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center justify-center space-x-2 ${
                isCopied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Caption & Hashtags Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Caption & All Hashtags</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Social Modal */}
      {socialModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Upload to {socialModal === 'tiktok' ? 'TikTok' : 'Instagram'}
              </h3>
              <button
                onClick={() => setSocialModal(null)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center space-x-2">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>Your caption and hashtags have already been copied to your clipboard!</span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600">
              <p>1. Open {socialModal === 'tiktok' ? 'TikTok' : 'Instagram'}.</p>
              <p>2. Select your downloaded video: <strong>{renderResult.filename}</strong></p>
              <p>3. Paste your copied caption into the description.</p>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => setSocialModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
              >
                Cancel
              </button>
              <a
                href={
                  socialModal === 'tiktok'
                    ? 'https://www.tiktok.com/upload'
                    : 'https://www.instagram.com/'
                }
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setSocialModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#FF4800] hover:bg-[#E63E00] text-white text-xs font-bold text-center shadow-sm"
              >
                Open {socialModal === 'tiktok' ? 'TikTok' : 'Instagram'}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
