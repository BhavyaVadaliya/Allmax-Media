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
    <div className="w-full max-w-xl mx-auto space-y-3.5 py-1 px-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">
            Step 3: Download &amp; Share
          </h1>
          <p className="text-[11px] text-slate-500">
            Video created with {product.name} overlay
          </p>
        </div>

        <div className="flex items-center space-x-1.5 text-xs font-bold">
          <button
            onClick={onTweakPosition}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-700"
          >
            <Sliders className="w-3 h-3" />
            <span>Adjust</span>
          </button>
          <button
            onClick={onNewMockup}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-700"
          >
            <RotateCcw className="w-3 h-3" />
            <span>New</span>
          </button>
        </div>
      </div>

      {/* Video Preview Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-md space-y-2.5">
        <div className="relative aspect-[9/16] h-[260px] sm:h-[320px] mx-auto bg-slate-950 rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
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

          {renderResult.mediaType === 'video' && (
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="absolute top-2 right-2 bg-black/70 px-2 py-0.5 rounded-full text-[10px] text-white flex items-center space-x-1"
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-3 h-3 text-slate-400" />
                  <span>Muted</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3 h-3 text-emerald-400" />
                  <span>Sound On</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Big Download Button */}
        <button
          onClick={handleDownload}
          className="w-full py-3.5 rounded-xl bg-[#FF4800] hover:bg-[#E63E00] text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-orange-500/25 transition-all active:scale-95 flex items-center justify-center space-x-2"
        >
          <Download className="w-4 h-4 stroke-[2.5]" />
          <span>Download Video (.mp4)</span>
        </button>
      </div>

      {/* Social Direct Share Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleTikTokUpload}
          className="flex items-center justify-center space-x-1.5 py-3 px-3 rounded-xl bg-black text-white text-xs font-black shadow-sm active:scale-95"
        >
          <span>Share to TikTok</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
        </button>

        <button
          onClick={handleInstagramUpload}
          className="flex items-center justify-center space-x-1.5 py-3 px-3 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white text-xs font-black shadow-sm active:scale-95"
        >
          <span>Instagram Reels</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-white/90" />
        </button>
      </div>

      {/* 1-Click Fitness Caption Box */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800">Copy Post Caption:</span>
          <span className="text-[10px] text-slate-400 font-semibold">{activeTemplate?.title}</span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed font-medium">
          {customCaption}
          <div className="mt-1 text-[#FF4800] font-bold text-[11px]">
            {activeTemplate?.hashtags.join(' ')}
          </div>
        </div>

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
              <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
              <span>Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>Copy Caption &amp; Hashtags</span>
            </>
          )}
        </button>
      </div>

      {/* Social Modal */}
      {socialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xs w-full p-5 space-y-3 shadow-2xl border border-slate-200 text-center">
            <h3 className="font-extrabold text-slate-900 text-sm">
              Ready to Share to {socialModal === 'tiktok' ? 'TikTok' : 'Instagram'}!
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              1. Video has been downloaded to your phone.<br />
              2. Fitness caption has been copied to your clipboard.<br />
              3. Open {socialModal === 'tiktok' ? 'TikTok' : 'Instagram'} and paste the caption!
            </p>
            <button
              onClick={() => setSocialModal(null)}
              className="w-full py-2.5 rounded-xl bg-[#FF4800] text-white text-xs font-bold shadow"
            >
              Open App &amp; Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
