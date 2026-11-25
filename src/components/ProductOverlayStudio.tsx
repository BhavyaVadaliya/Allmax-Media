'use client';

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {
  AllmaxProduct,
  MediaItem,
  OverlayConfig,
  RenderResult,
  SearchIntentHook,
} from '@/types';
import { ALLMAX_PRODUCTS } from '@/data/allmaxProducts';
import { renderMockupMedia } from '@/lib/videoRenderer';
import {
  Play,
  Pause,
  Loader2,
  Volume2,
  VolumeX,
  Eye,
  RotateCcw,
  Layers,
  Copy,
  Check,
  ArrowRight,
  QrCode,
} from 'lucide-react';

export interface ProductOverlayStudioRef {
  generateMockup: () => void;
}

interface ProductOverlayStudioProps {
  media: MediaItem;
  initialProduct?: AllmaxProduct;
  selectedHook?: SearchIntentHook | null;
  promoCode?: string;
  creatorHandle?: string;
  onMockupGenerated: (result: RenderResult, product: AllmaxProduct) => void;
  onBackToMedia: () => void;
  onRenderingChange?: (isRendering: boolean, progress: number) => void;
}

export const ProductOverlayStudio = forwardRef<
  ProductOverlayStudioRef,
  ProductOverlayStudioProps
>(
  (
    {
      media,
      initialProduct,
      selectedHook,
      promoCode = 'ALEX15 • 20% OFF',
      creatorHandle = '@alex_lifts_allmax',
      onMockupGenerated,
      onBackToMedia,
      onRenderingChange,
    },
    ref
  ) => {
    const [selectedProduct] = useState<AllmaxProduct>(
      initialProduct || ALLMAX_PRODUCTS[0]
    );
    const [previewTab, setPreviewTab] = useState<'reel' | 'endcard'>('reel');
    const [showSafeZones, setShowSafeZones] = useState<boolean>(false);
    const [seoTab, setSeoTab] = useState<'instagram' | 'tiktok'>('instagram');
    const [copiedSeo, setCopiedSeo] = useState<boolean>(false);
    const [copiedAlt, setCopiedAlt] = useState<boolean>(false);

    const [isPlaying, setIsPlaying] = useState<boolean>(true);
    const [isMuted, setIsMuted] = useState<boolean>(true);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const hookTitle = selectedHook?.title || 'POST-WORKOUT RECOVERY HACK!';
    const kineticLine =
      selectedHook?.highlightPhrase ||
      selectedProduct.specs.map((s) => `${s.value} ${s.label}`).join(', ');
    const promoShort = promoCode.split('•')[0].trim() || 'ALEX15';

    // Default SEO Caption & Alt Text
    const [igCaption, setIgCaption] = useState<string>(
      `The cleanest ${selectedProduct.category.toLowerCase()} I've found for fast recovery. 🏆\n\n${
        selectedHook?.script ||
        `Switching to Allmax ${selectedProduct.shortName} (${selectedProduct.tagline}) changes everything. Use code ${promoShort} at checkout!`
      }\n\n#AllmaxNutrition #${selectedProduct.shortName.replace(/\s+/g, '')} #GymTok #FitnessReels`
    );

    const [tiktokCaption, setTiktokCaption] = useState<string>(
      `${hookTitle} 🔥 ${selectedProduct.shortName} (${selectedProduct.tagline}) — Use code ${promoShort} for 20% OFF! #Allmax #GymTok #WorkoutFuel`
    );

    const altText = `Fitness athlete ${creatorHandle} in gym featuring Allmax ${selectedProduct.shortName} with code ${promoShort}`;

    const [config, setConfig] = useState<OverlayConfig>({
      productId: (initialProduct || ALLMAX_PRODUCTS[0]).id,
      x: 16,
      y: 78,
      scale: 0.34,
      rotation: 0,
      opacity: 1.0,
      hasDropShadow: true,
      hasGlow: false,
      preset: 'bottom-left',
      badgeText: '',
      showBadge: false,
      ctaText: '',
      showCta: false,
      ocrBannerTitle: hookTitle,
      kineticSubtitle: kineticLine,
      promoCodeText: promoCode,
      creatorHandle,
    });

    const [isDragging, setIsDragging] = useState<boolean>(false);
    const dragStartRef = useRef<{
      clientX: number;
      clientY: number;
      startX: number;
      startY: number;
    }>({
      clientX: 0,
      clientY: 0,
      startX: 0,
      startY: 0,
    });

    const [isRendering, setIsRendering] = useState<boolean>(false);
    const [renderProgress, setRenderProgress] = useState<number>(0);
    const [renderStatus, setRenderStatus] = useState<string>('');
    const [renderError, setRenderError] = useState<string | null>(null);

    const handleDragStart = (clientX: number, clientY: number) => {
      setIsDragging(true);
      dragStartRef.current = {
        clientX,
        clientY,
        startX: config.x,
        startY: config.y,
      };
    };

    const handleDragMove = useCallback(
      (clientX: number, clientY: number) => {
        if (!isDragging || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const deltaX = ((clientX - dragStartRef.current.clientX) / rect.width) * 100;
        const deltaY = ((clientY - dragStartRef.current.clientY) / rect.height) * 100;

        setConfig((prev) => ({
          ...prev,
          x: Math.max(8, Math.min(92, dragStartRef.current.startX + deltaX)),
          y: Math.max(12, Math.min(88, dragStartRef.current.startY + deltaY)),
        }));
      },
      [isDragging]
    );

    const handleDragEnd = useCallback(() => {
      setIsDragging(false);
    }, []);

    useEffect(() => {
      const onMouseMove = (e: MouseEvent) => handleDragMove(e.clientX, e.clientY);
      const onTouchMove = (e: TouchEvent) => {
        if (e.touches.length === 1) {
          handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
        }
      };

      if (isDragging) {
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', handleDragEnd);
        window.addEventListener('touchmove', onTouchMove, { passive: false });
        window.addEventListener('touchend', handleDragEnd);
      }

      return () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', handleDragEnd);
        window.removeEventListener('touchmove', onTouchMove);
        window.removeEventListener('touchend', handleDragEnd);
      };
    }, [isDragging, handleDragMove, handleDragEnd]);

    const handleResetLayout = () => {
      setConfig((prev) => ({
        ...prev,
        x: 16,
        y: 78,
        scale: 0.34,
        rotation: 0,
      }));
    };

    const togglePlay = () => {
      if (!videoRef.current) return;
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    };

    const handleCopySeo = () => {
      const text = seoTab === 'instagram' ? igCaption : tiktokCaption;
      navigator.clipboard.writeText(text);
      setCopiedSeo(true);
      setTimeout(() => setCopiedSeo(false), 2000);
    };

    const handleCopyAlt = () => {
      navigator.clipboard.writeText(altText);
      setCopiedAlt(true);
      setTimeout(() => setCopiedAlt(false), 2000);
    };

    const handleGenerate = useCallback(async () => {
      setRenderError(null);
      setIsRendering(true);
      setRenderProgress(10);
      setRenderStatus('Preparing Allmax AI layers...');
      onRenderingChange?.(true, 10);

      try {
        let mediaElement: HTMLVideoElement | HTMLImageElement;

        if (media.type === 'video') {
          const vid = document.createElement('video');
          vid.crossOrigin = 'anonymous';
          vid.src = media.url;
          vid.muted = true;
          vid.playsInline = true;
          await new Promise<void>((resolve, reject) => {
            vid.onloadeddata = () => resolve();
            vid.onerror = () => reject(new Error('Failed to load video stream for rendering.'));
            setTimeout(() => resolve(), 3000);
          });
          mediaElement = vid;
        } else {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = media.url;
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject(new Error('Failed to load image for rendering.'));
          });
          mediaElement = img;
        }

        const result = await renderMockupMedia({
          mediaElement,
          mediaItem: media,
          mediaType: media.type,
          product: selectedProduct,
          config,
          aspectRatio: '9:16',
          onProgress: (p, msg) => {
            setRenderProgress(p);
            setRenderStatus(msg);
            onRenderingChange?.(true, p);
          },
        });

        setIsRendering(false);
        onRenderingChange?.(false, 100);
        onMockupGenerated(result, selectedProduct);
      } catch (err: any) {
        console.error('Render failed:', err);
        setRenderError(err.message || 'An error occurred while creating your mockup.');
        setIsRendering(false);
        onRenderingChange?.(false, 0);
      }
    }, [media, selectedProduct, config, onMockupGenerated, onRenderingChange]);

    useImperativeHandle(ref, () => ({
      generateMockup: handleGenerate,
    }));

    return (
      <div className="h-full flex flex-col bg-[#F8FAFC] overflow-hidden select-none">
        {/* Top 3-Step Pill Bar */}
        <div className="shrink-0 bg-white border-b border-slate-200 px-3 py-2">
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={onBackToMedia}
              disabled={isRendering}
              className="py-1.5 px-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-black text-center hover:bg-emerald-100 active:scale-95 transition-all"
            >
              ✓ Step 1: Create
            </button>
            <div className="py-1.5 px-2 rounded-xl bg-[#FF4800] text-white text-[11px] font-black text-center shadow-sm shadow-orange-500/20">
              Step 2: Package
            </div>
            <div className="py-1.5 px-2 rounded-xl bg-slate-100 text-slate-400 text-[11px] font-bold text-center border border-slate-200/70">
              Step 3: Post
            </div>
          </div>
        </div>

        {/* Scrollable Step 2 Body */}
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none p-3 space-y-3">
          {/* Preview Toolbar: 9:16 Live Reel | Branded End-Card | Safe Zones | Reset */}
          <div className="rounded-2xl bg-white border border-slate-200 p-1.5 flex items-center justify-between gap-1.5 shadow-sm">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setPreviewTab('reel')}
                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-black transition-all ${
                  previewTab === 'reel'
                    ? 'bg-[#FF4800] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                9:16 Live Reel
              </button>
              <button
                onClick={() => setPreviewTab('endcard')}
                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                  previewTab === 'endcard'
                    ? 'bg-[#FF4800] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                QR End-Card
              </button>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => setShowSafeZones(!showSafeZones)}
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${
                  showSafeZones
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>Safe Zones</span>
              </button>

              <button
                onClick={handleResetLayout}
                className="w-7 h-7 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-[#FF4800] active:scale-95"
                title="Reset Product Position"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Live 9:16 Reel Canvas with the 3 Overlay Layers */}
          <div className="flex justify-center">
            <div
              ref={containerRef}
              className="relative w-full aspect-[9/14] max-h-[54vh] bg-black rounded-3xl overflow-hidden shadow-xl border border-slate-200"
            >
              {previewTab === 'reel' ? (
                <>
                  {/* Base Video / Image */}
                  {media.type === 'video' ? (
                    <video
                      ref={videoRef}
                      src={media.url}
                      autoPlay
                      loop
                      muted={isMuted}
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={media.url}
                      alt="Base Media"
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* Top-Right Tiny Playback Controls */}
                  {media.type === 'video' && (
                    <div className="absolute bottom-11 right-2.5 z-30 flex items-center space-x-1.5">
                      <button
                        onClick={togglePlay}
                        className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center border border-white/20 active:scale-90"
                      >
                        {isPlaying ? (
                          <Pause className="w-3 h-3" />
                        ) : (
                          <Play className="w-3 h-3 fill-white" />
                        )}
                      </button>
                      <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center border border-white/20 active:scale-90"
                      >
                        {isMuted ? (
                          <VolumeX className="w-3 h-3 text-slate-300" />
                        ) : (
                          <Volume2 className="w-3 h-3 text-emerald-400" />
                        )}
                      </button>
                    </div>
                  )}

                  {/* LAYER 1: Top SEARCH-QUERY OCR BANNER */}
                  <div className="absolute top-3.5 left-3 right-3 z-20 rounded-2xl bg-white shadow-lg border-b-4 border-[#FF4800] px-3 py-2 text-center pointer-events-none">
                    <span className="text-[8px] font-black tracking-[0.14em] text-[#FF4800] uppercase block">
                      SEARCH-QUERY OCR BANNER
                    </span>
                    <p className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-tight leading-tight mt-0.5 truncate">
                      {hookTitle}
                    </p>
                  </div>

                  {/* LAYER 2: Center Kinetic Subtitle Box */}
                  <div className="absolute top-[43%] left-3.5 right-3.5 -translate-y-1/2 z-20 rounded-xl bg-black/75 backdrop-blur-sm border border-amber-400/60 px-3 py-2 text-center pointer-events-none shadow-lg">
                    <p className="text-[11px] sm:text-xs font-black text-amber-300 uppercase tracking-wide leading-snug">
                      &ldquo;{kineticLine}&rdquo;
                    </p>
                  </div>

                  {/* LAYER 3A: Draggable Product Tub */}
                  <div
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleDragStart(e.clientX, e.clientY);
                    }}
                    onTouchStart={(e) => {
                      if (e.touches.length === 1) {
                        e.stopPropagation();
                        handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
                      }
                    }}
                    style={{
                      left: `${config.x}%`,
                      top: `${config.y}%`,
                      transform: `translate(-50%, -50%) rotate(${config.rotation}deg)`,
                      width: `${config.scale * 42}%`,
                    }}
                    className={`absolute z-20 cursor-grab active:cursor-grabbing ${
                      isDragging ? 'ring-2 ring-[#FF4800] rounded-xl bg-white/10' : ''
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedProduct.svgGraphic}
                      alt={selectedProduct.name}
                      draggable={false}
                      className="w-full h-auto drop-shadow-[0_10px_18px_rgba(0,0,0,0.75)] select-none"
                    />
                  </div>

                  {/* LAYER 3B: Bottom ATHLETE PROMO LOCKUP */}
                  <div className="absolute bottom-9 left-[30%] right-12 z-20 rounded-xl bg-black/85 backdrop-blur-md border border-white/15 px-3 py-1.5 pointer-events-none shadow-lg">
                    <span className="text-[8px] font-bold tracking-wider text-slate-400 uppercase block">
                      ATHLETE PROMO LOCKUP
                    </span>
                    <p className="text-[11px] font-mono font-black text-white truncate">
                      CODE: <span className="text-[#FF4800]">{promoCode}</span>
                    </p>
                  </div>

                  {/* Bottom Creator Watermark Strip */}
                  <div className="absolute bottom-2 left-3 right-3 z-20 rounded-lg bg-black/65 backdrop-blur-sm px-2.5 py-1 text-[10px] text-white/90 font-semibold truncate pointer-events-none">
                    <strong className="text-white">{creatorHandle}</strong> {hookTitle} •{' '}
                    {promoShort}
                  </div>

                  {/* Safe Zones Overlay */}
                  {showSafeZones && (
                    <div className="absolute inset-0 z-30 pointer-events-none border-[18px] border-red-500/20">
                      <div className="absolute right-1.5 bottom-16 w-8 h-36 rounded-lg border border-dashed border-red-400/70 bg-red-500/10 flex items-center justify-center">
                        <span className="text-[7px] font-black text-red-200 -rotate-90 whitespace-nowrap">
                          IG / TIKTOK UI
                        </span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Branded End-Card Preview */
                <div className="w-full h-full bg-gradient-to-b from-[#07090F] via-[#0D121F] to-[#05070B] flex flex-col items-center justify-between py-6 px-4 text-center text-white">
                  <div className="space-y-1">
                    <div className="flex items-center justify-center space-x-1.5">
                      <span className="w-6 h-6 rounded-full bg-[#FF4800] flex items-center justify-center text-[10px] font-black">
                        AM
                      </span>
                      <span className="text-sm font-black tracking-widest">ALLMAX NUTRITION</span>
                    </div>
                    <div className="w-16 h-0.5 bg-[#FF4800] mx-auto rounded-full" />
                  </div>

                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedProduct.svgGraphic}
                    alt={selectedProduct.name}
                    className="h-28 w-auto object-contain drop-shadow-[0_0_24px_rgba(255,72,0,0.5)]"
                  />

                  <div className="rounded-2xl bg-white p-3 border-2 border-[#FF4800] text-center shadow-lg">
                    <QrCode className="w-16 h-16 text-slate-900 mx-auto" />
                    <span className="text-[10px] font-black text-[#FF4800] block mt-1">
                      SCAN TO SHOP
                    </span>
                    <span className="text-[8px] font-bold text-slate-500 block">
                      allmaxnutrition.com
                    </span>
                  </div>

                  <span className="text-[9px] font-bold tracking-widest text-slate-300 uppercase">
                    7.0s Animated QR Outro Included
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 6/6 AI Layers Applied Status Bar */}
          <div className="flex items-center justify-between px-1 text-[11px] font-bold">
            <span className="flex items-center space-x-1.5 text-emerald-600 font-black">
              <Layers className="w-3.5 h-3.5" />
              <span>6/6 AI Layers Applied</span>
            </span>
            <span className="text-slate-400 font-mono text-[10px]">
              720×1280 • 30fps • Compliant
            </span>
          </div>

          {/* SEO & Alt Text Card (Matches Image 2!) */}
          <div className="rounded-2xl bg-white border border-slate-200 p-3 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="inline-flex rounded-xl bg-slate-100 p-0.5 border border-slate-200">
                <button
                  onClick={() => setSeoTab('instagram')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${
                    seoTab === 'instagram'
                      ? 'bg-[#FF4800] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Instagram SEO + Alt Text
                </button>
                <button
                  onClick={() => setSeoTab('tiktok')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${
                    seoTab === 'tiktok'
                      ? 'bg-[#FF4800] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  TikTok Search
                </button>
              </div>

              <button
                onClick={handleCopySeo}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[10px] font-black text-slate-700 active:scale-95"
              >
                {copiedSeo ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-[#FF4800]" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <textarea
              value={seoTab === 'instagram' ? igCaption : tiktokCaption}
              onChange={(e) =>
                seoTab === 'instagram'
                  ? setIgCaption(e.target.value)
                  : setTiktokCaption(e.target.value)
              }
              rows={3}
              className="w-full rounded-xl bg-[#F8FAFC] border border-slate-200 p-2.5 text-xs text-slate-800 leading-relaxed font-medium focus:outline-none focus:border-[#FF4800] resize-none"
            />

            {/* Alt Text Bar */}
            <div className="rounded-xl bg-[#F8FAFC] border border-slate-200 px-2.5 py-2 flex items-center justify-between gap-2 text-[11px]">
              <div className="truncate text-slate-500">
                <strong className="text-slate-700">Alt Text:</strong> {altText}
              </div>
              <button
                onClick={handleCopyAlt}
                className="shrink-0 font-black text-[#FF4800] hover:underline text-[10px]"
              >
                {copiedAlt ? 'Copied!' : 'Copy Alt'}
              </button>
            </div>
          </div>

          {renderError && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium text-center">
              {renderError}
            </div>
          )}
        </div>

        {/* Bottom Primary CTA: Continue to Step 3: Post → */}
        <div className="shrink-0 bg-white border-t border-slate-200 p-3 safe-bottom">
          <button
            onClick={handleGenerate}
            disabled={isRendering}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#FF4800] hover:bg-[#E63E00] text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-orange-500/25 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <span>Continue to Step 3: Post</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

        {/* Rendering Overlay Modal */}
        {isRendering && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
            <div className="bg-white rounded-3xl max-w-xs w-full p-6 space-y-5 shadow-2xl border border-slate-200 text-center">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-orange-50 text-[#FF4800] flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>

              <div className="space-y-1">
                <h3 className="font-extrabold text-slate-900 text-base">
                  Rendering Allmax Reel
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed min-h-[32px]">
                  {renderStatus || 'Compositing video layers & QR outro...'}
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#FF4800] transition-all duration-300 rounded-full"
                    style={{ width: `${renderProgress}%` }}
                  />
                </div>
                <span className="text-xs font-black text-[#FF4800] block">
                  {renderProgress}% Complete
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

ProductOverlayStudio.displayName = 'ProductOverlayStudio';
