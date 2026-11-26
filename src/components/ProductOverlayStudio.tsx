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
import QRCode from 'qrcode';
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
  Flame,
  ShieldCheck,
  AlertTriangle,
  Tag,
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
    const [qrDataUrl, setQrDataUrl] = useState<string>('');
    const [animKey, setAnimKey] = useState<number>(0);

    useEffect(() => {
      QRCode.toDataURL(selectedProduct.allmaxUrl || 'https://www.allmaxnutrition.com', {
        width: 240,
        margin: 1,
        color: { dark: '#0A0D16', light: '#FFFFFF' },
      })
        .then(setQrDataUrl)
        .catch(() => {});
    }, [selectedProduct.allmaxUrl]);

    const [isPlaying, setIsPlaying] = useState<boolean>(true);
    const [isMuted, setIsMuted] = useState<boolean>(true);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const captionRef = useRef<HTMLTextAreaElement | null>(null);

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

    const activeCaptionText = seoTab === 'instagram' ? igCaption : tiktokCaption;
    const restrictedClaimRegex = /\b(cure|cures|treat|treats|prevent|prevents|diagnose|miracle|steroid|steroids)\b/i;
    const restrictedMatch = activeCaptionText.match(restrictedClaimRegex);
    const isClaimCompliant = !restrictedMatch;

    useEffect(() => {
      const el = captionRef.current;
      if (el) {
        el.style.height = 'auto';
        el.style.height = `${el.scrollHeight}px`;
      }
    }, [seoTab, igCaption, tiktokCaption]);

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

        // Keep tub inside IG/TikTok Safe Zones (clear of top OCR banner, right UI bar, and bottom lockup)
        setConfig((prev) => ({
          ...prev,
          x: Math.max(14, Math.min(78, dragStartRef.current.startX + deltaX)),
          y: Math.max(23, Math.min(79, dragStartRef.current.startY + deltaY)),
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
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
      setAnimKey((k) => k + 1);
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
                Branded End-Card
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
              className="relative aspect-[9/16] h-[58vh] max-h-[580px] w-auto max-w-full bg-black rounded-3xl overflow-hidden shadow-xl border border-slate-200"
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

                  {/* LAYER 1: Top SEARCH-QUERY OCR BANNER (Animated Slide-Down) */}
                  <div
                    key={`banner-${animKey}`}
                    className="absolute top-3.5 left-3 right-3 z-20 rounded-2xl bg-white shadow-lg border-b-4 border-[#FF4800] px-3 py-2 text-center pointer-events-none animate-reel-banner"
                  >
                    <span className="text-[8px] font-black tracking-[0.14em] text-[#FF4800] uppercase block">
                      SEARCH-QUERY OCR BANNER
                    </span>
                    <p className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-tight leading-tight mt-0.5 truncate">
                      {hookTitle}
                    </p>
                  </div>

                  {/* LAYER 2: Center Kinetic Subtitle Box (Animated Pop-In) */}
                  <div
                    key={`sub-${animKey}`}
                    className="absolute top-[43%] left-3.5 right-3.5 -translate-y-1/2 z-20 rounded-xl bg-black/75 backdrop-blur-sm border border-amber-400/60 px-3 py-2 text-center pointer-events-none shadow-lg animate-reel-subtitle"
                  >
                    <p className="text-[11px] sm:text-xs font-black text-amber-300 uppercase tracking-wide leading-snug">
                      &ldquo;{kineticLine}&rdquo;
                    </p>
                  </div>

                  {/* LAYER 3A: Draggable Product Tub (Animated Bounce-Up) */}
                  <div
                    key={`tub-${animKey}`}
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
                    className={`group/tub absolute z-20 cursor-grab active:cursor-grabbing ${
                      isDragging ? 'scale-[1.03]' : 'animate-reel-tub'
                    }`}
                  >
                    {/* Studio Rim Light Glow Behind Tub */}
                    {config.hasGlow && (
                      <div className="pointer-events-none absolute -inset-2 rounded-full bg-[#FF4800]/30 blur-md" />
                    )}

                    {/* 4 Corner Safe-Zone Framing Brackets (Shown on Drag or Safe Zones ON) */}
                    {(isDragging || showSafeZones) && (
                      <div className="pointer-events-none absolute -inset-1.5 z-30">
                        <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-[#FF4800] rounded-tl" />
                        <span className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-[#FF4800] rounded-tr" />
                        <span className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-[#FF4800] rounded-bl" />
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-[#FF4800] rounded-br" />
                      </div>
                    )}

                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedProduct.svgGraphic}
                      alt={selectedProduct.name}
                      draggable={false}
                      className="relative z-10 w-full h-auto object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.8)] select-none"
                    />
                  </div>

                  {/* LAYER 3B: Bottom ATHLETE PROMO LOCKUP (Animated Slide-In) */}
                  <div
                    key={`promo-${animKey}`}
                    className="absolute bottom-9 left-[32%] right-2.5 z-20 rounded-xl bg-black/85 backdrop-blur-md border border-white/15 px-2.5 py-1.5 pointer-events-none shadow-lg animate-reel-promo"
                  >
                    <span className="text-[8px] font-bold tracking-wider text-slate-400 uppercase block">
                      ATHLETE PROMO LOCKUP
                    </span>
                    <p className="text-[11px] font-mono font-black text-white truncate">
                      CODE: <span className="text-[#FF4800]">{promoCode}</span>
                    </p>
                  </div>

                  {/* Bottom Creator Watermark Strip (Animated Fade-Up) */}
                  <div
                    key={`strip-${animKey}`}
                    className="absolute bottom-2 left-3 right-3 z-20 rounded-lg bg-black/65 backdrop-blur-sm px-2.5 py-1 text-[10px] text-white/90 font-semibold truncate pointer-events-none animate-reel-strip"
                  >
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
                /* Animated 2-Sec Branded End-Card Preview */
                <div
                  key={`endcard-${animKey}`}
                  className="relative w-full h-full bg-gradient-to-b from-[#07090F] via-[#0D121F] to-[#05070B] flex flex-col items-center justify-between py-4 px-4 text-center text-white overflow-hidden"
                >
                  {/* Animated Radial Orange Glow */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-52 h-52 rounded-full bg-[#FF4800]/25 blur-[65px] animate-intro-glow" />
                  </div>

                  {/* Top Allmax Nutrition Brand Header (Slide-Down) */}
                  <div className="relative z-10 flex items-center justify-center space-x-1.5 animate-reel-banner">
                    <Flame className="w-4 h-4 text-[#FF4800] fill-[#FF4800]" />
                    <span className="text-xs font-black tracking-[0.18em] uppercase">
                      ALLMAX NUTRITION
                    </span>
                  </div>

                  {/* Hero Product Tub (Bounce-In) */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedProduct.svgGraphic}
                    alt={selectedProduct.name}
                    className="relative z-10 h-24 w-auto object-contain drop-shadow-[0_0_24px_rgba(255,72,0,0.45)] animate-intro-tub-center"
                  />

                  {/* Product Details + Specs + Orange Promo Pill (Slide-Up) */}
                  <div className="relative z-10 space-y-1.5 w-full animate-intro-slide-up">
                    <p className="text-xs font-black text-white leading-tight">
                      Fuel Your Recovery • Shop with Code {promoShort}
                    </p>
                    <p className="text-[10px] font-semibold text-slate-400">
                      {selectedProduct.specs.map((s) => `${s.value} ${s.label}`).join(' • ')}
                    </p>
                    <div className="inline-block px-4 py-1.5 rounded-full bg-[#FF4800] text-white text-[11px] font-black tracking-wide shadow-md shadow-orange-500/30">
                      CODE: {promoCode}
                    </div>
                  </div>

                  {/* Scannable QR Code Card (Pop-In + Scanner Glow) */}
                  <div className="relative z-10 rounded-2xl bg-white p-2 border-2 border-[#FF4800] text-center shadow-lg flex items-center space-x-2.5 animate-intro-fade">
                    <div className="relative">
                      {qrDataUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={qrDataUrl} alt="Product QR Code" className="w-14 h-14 rounded" />
                      ) : (
                        <QrCode className="w-14 h-14 text-slate-900" />
                      )}
                    </div>
                    <div className="text-left pr-1">
                      <span className="text-[10px] font-black text-[#FF4800] block leading-tight">
                        SCAN TO SHOP
                      </span>
                      <span className="text-[9px] font-bold text-slate-700 block mt-0.5">
                        {selectedProduct.shortName}
                      </span>
                      <span className="text-[8px] font-medium text-slate-400 block">
                        allmaxnutrition.com
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 6/6 AI Layers Applied Status Bar + Video Controls */}
          <div className="flex items-center justify-between px-1 text-[11px] font-bold gap-2">
            <span className="flex items-center space-x-1.5 text-emerald-600 font-black">
              <Layers className="w-3.5 h-3.5" />
              <span>6/6 AI Layers Applied</span>
            </span>
            <div className="flex items-center space-x-2">
              {previewTab === 'reel' && media.type === 'video' && (
                <div className="flex items-center space-x-1">
                  <button
                    onClick={togglePlay}
                    className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center active:scale-90 transition-transform"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? (
                      <Pause className="w-3 h-3" />
                    ) : (
                      <Play className="w-3 h-3 fill-white" />
                    )}
                  </button>
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center active:scale-90 transition-transform"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? (
                      <VolumeX className="w-3 h-3 text-slate-300" />
                    ) : (
                      <Volume2 className="w-3 h-3 text-emerald-400" />
                    )}
                  </button>
                </div>
              )}
              <span className="text-slate-400 font-mono text-[10px]">
                720×1280 • 30fps • Compliant
              </span>
            </div>
          </div>

          {/* 3D Product Compositing Quick Controls (Safe-Zone Snap + Size + Studio Light) */}
          {previewTab === 'reel' && (
            <div className="rounded-2xl bg-white border border-slate-200 px-2.5 py-2 shadow-sm flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center space-x-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 mr-1">
                  3D Safe-Zone:
                </span>
                {[
                  { label: 'Bottom-L', x: 16, y: 78 },
                  { label: 'Mid-L', x: 18, y: 56 },
                  { label: 'Mid-R', x: 74, y: 56 },
                ].map((pos) => (
                  <button
                    key={pos.label}
                    onClick={() => setConfig((prev) => ({ ...prev, x: pos.x, y: pos.y }))}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                      Math.abs(config.x - pos.x) < 4 && Math.abs(config.y - pos.y) < 4
                        ? 'bg-[#FF4800] text-white border-[#FF4800]'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() =>
                    setConfig((prev) => ({
                      ...prev,
                      scale: Math.max(0.24, +(prev.scale - 0.04).toFixed(2)),
                    }))
                  }
                  className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black flex items-center justify-center"
                  title="Decrease Tub Size"
                >
                  -
                </button>
                <span className="text-[10px] font-mono font-bold text-slate-500 w-8 text-center">
                  {Math.round(config.scale * 100)}%
                </span>
                <button
                  onClick={() =>
                    setConfig((prev) => ({
                      ...prev,
                      scale: Math.min(0.46, +(prev.scale + 0.04).toFixed(2)),
                    }))
                  }
                  className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black flex items-center justify-center"
                  title="Increase Tub Size"
                >
                  +
                </button>
                <button
                  onClick={() => setConfig((prev) => ({ ...prev, hasGlow: !prev.hasGlow }))}
                  className={`px-2 py-1 rounded-lg text-[10px] font-black border transition-all ${
                    config.hasGlow
                      ? 'bg-orange-50 text-[#FF4800] border-[#FF4800]/50'
                      : 'bg-slate-50 text-slate-500 border-slate-200'
                  }`}
                  title="Toggle Studio Rim Light"
                >
                  Studio Lit
                </button>
              </div>
            </div>
          )}

          {/* Promo Lockup & Compliance Card (Discount Code + 2s End-Card + FDA/Health Canada Claims) */}
          <div className="rounded-2xl bg-white border border-slate-200 p-2.5 shadow-sm space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center space-x-1.5 text-[10px] font-black uppercase tracking-wider text-slate-800">
                <Tag className="w-3.5 h-3.5 text-[#FF4800]" />
                <span>Promo Lockup &amp; Compliance</span>
              </span>
              {isClaimCompliant ? (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[9px] font-black text-emerald-700">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>FDA / Health Canada Approved</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-300 text-[9px] font-black text-amber-800">
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                  <span>Review &ldquo;{restrictedMatch?.[0]}&rdquo; Claim</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              <div className="rounded-xl bg-[#F8FAFC] border border-slate-200/80 px-2.5 py-1.5">
                <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 block">
                  Embedded Discount Code
                </span>
                <span className="font-mono font-black text-slate-900 truncate block">
                  {promoCode}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setPreviewTab('endcard')}
                className="text-left rounded-xl bg-[#F8FAFC] hover:bg-orange-50/70 border border-slate-200/80 hover:border-[#FF4800]/40 px-2.5 py-1.5 transition-colors"
              >
                <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 block">
                  2-Sec Branded End-Card
                </span>
                <span className="font-black text-[#FF4800] truncate block">
                  2.0s QR Outro Active →
                </span>
              </button>
            </div>

            <div className="rounded-xl bg-emerald-50/60 border border-emerald-200/70 px-2.5 py-1.5 text-[10px] text-slate-700 flex items-center justify-between gap-2">
              <span className="truncate">
                <strong className="text-emerald-800">Approved Claim:</strong> {selectedProduct.tagline}
              </span>
              <span className="shrink-0 text-[9px] font-mono font-bold text-emerald-700">
                NPN / DSHEA
              </span>
            </div>
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
              ref={captionRef}
              value={seoTab === 'instagram' ? igCaption : tiktokCaption}
              onChange={(e) => {
                if (seoTab === 'instagram') {
                  setIgCaption(e.target.value);
                } else {
                  setTiktokCaption(e.target.value);
                }
                e.target.style.height = 'auto';
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              rows={1}
              className="w-full rounded-xl bg-[#F8FAFC] border border-slate-200 p-2.5 text-xs text-slate-800 leading-relaxed font-medium focus:outline-none focus:border-[#FF4800] resize-none overflow-hidden"
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
