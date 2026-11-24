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
  OverlayPositionPreset,
  RenderResult,
} from '@/types';
import { ALLMAX_PRODUCTS } from '@/data/allmaxProducts';
import { renderMockupMedia } from '@/lib/videoRenderer';
import {
  Play,
  Pause,
  Loader2,
  Check,
  ArrowRight,
  Sparkles,
  Maximize2,
  Move,
  Volume2,
  VolumeX,
  Compass,
  Layers,
  ChevronRight,
} from 'lucide-react';

export interface ProductOverlayStudioRef {
  generateMockup: () => void;
}

interface ProductOverlayStudioProps {
  media: MediaItem;
  onMockupGenerated: (result: RenderResult, product: AllmaxProduct) => void;
  onBackToMedia: () => void;
  onRenderingChange?: (isRendering: boolean, progress: number) => void;
}

const PRESET_ORDER: OverlayPositionPreset[] = [
  'bottom-right',
  'bottom-left',
  'top-right',
  'center',
];

export const ProductOverlayStudio = forwardRef<
  ProductOverlayStudioRef,
  ProductOverlayStudioProps
>(({ media, onMockupGenerated, onBackToMedia, onRenderingChange }, ref) => {
  const [selectedProduct, setSelectedProduct] = useState<AllmaxProduct>(ALLMAX_PRODUCTS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [config, setConfig] = useState<OverlayConfig>({
    productId: ALLMAX_PRODUCTS[0].id,
    x: 76,
    y: 75,
    scale: 0.40,
    rotation: 0,
    opacity: 1.0,
    hasDropShadow: true,
    hasGlow: false,
    preset: 'bottom-right',
    badgeText: '⚡ ALLMAX ATHLETE',
    showBadge: true,
    ctaText: '',
    showCta: false,
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
  const [renderMessage, setRenderMessage] = useState<string>('Preparing video render...');

  useEffect(() => {
    onRenderingChange?.(isRendering, renderProgress);
  }, [isRendering, renderProgress, onRenderingChange]);

  const applyPreset = (preset: OverlayPositionPreset) => {
    let x = 50;
    let y = 50;
    switch (preset) {
      case 'bottom-right':
        x = 76;
        y = 75;
        break;
      case 'bottom-left':
        x = 24;
        y = 75;
        break;
      case 'top-right':
        x = 76;
        y = 25;
        break;
      case 'center':
        x = 50;
        y = 50;
        break;
    }
    setConfig((prev) => ({
      ...prev,
      preset,
      x,
      y,
    }));
  };

  // Cycle to next corner preset on 1-tap
  const cycleNextPreset = () => {
    const currentIndex = PRESET_ORDER.indexOf(config.preset);
    const nextPreset = PRESET_ORDER[(currentIndex + 1) % PRESET_ORDER.length];
    applyPreset(nextPreset);
  };

  // Cycle sticker size on 1-tap: Small (0.32) -> Med (0.42) -> Large (0.52)
  const cycleStickerSize = () => {
    setConfig((prev) => {
      if (prev.scale <= 0.35) return { ...prev, scale: 0.42 };
      if (prev.scale <= 0.45) return { ...prev, scale: 0.52 };
      return { ...prev, scale: 0.32 };
    });
  };

  const getSizeLabel = () => {
    if (config.scale <= 0.35) return 'S';
    if (config.scale <= 0.45) return 'M';
    return 'L';
  };

  const handleSelectProduct = (product: AllmaxProduct) => {
    setSelectedProduct(product);
    setConfig((prev) => ({
      ...prev,
      productId: product.id,
      scale: product.defaultScale || 0.40,
    }));
  };

  // Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      startX: config.x,
      startY: config.y,
    };
  };

  // Touch Drag Handlers (Mobile Finger Dragging)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    setIsDragging(true);
    dragStartRef.current = {
      clientX: touch.clientX,
      clientY: touch.clientY,
      startX: config.x,
      startY: config.y,
    };
  };

  const updateCoordinates = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const deltaX = ((clientX - dragStartRef.current.clientX) / rect.width) * 100;
    const deltaY = ((clientY - dragStartRef.current.clientY) / rect.height) * 100;
    const newX = Math.max(12, Math.min(88, dragStartRef.current.startX + deltaX));
    const newY = Math.max(12, Math.min(88, dragStartRef.current.startY + deltaY));
    setConfig((prev) => ({
      ...prev,
      x: Math.round(newX),
      y: Math.round(newY),
    }));
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      updateCoordinates(e.clientX, e.clientY);
    },
    [isDragging, updateCoordinates]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      e.preventDefault();
      const touch = e.touches[0];
      updateCoordinates(touch.clientX, touch.clientY);
    },
    [isDragging, updateCoordinates]
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleDragEnd);
      window.addEventListener('touchcancel', handleDragEnd);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleDragEnd);
      window.removeEventListener('touchcancel', handleDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleDragEnd);
      window.removeEventListener('touchcancel', handleDragEnd);
    };
  }, [isDragging, handleMouseMove, handleTouchMove, handleDragEnd]);

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

  const handleGenerateMockup = async () => {
    if (isRendering) return;
    setIsRendering(true);
    setRenderProgress(10);
    setRenderMessage('Preparing workout video...');

    try {
      let mediaElement: HTMLVideoElement | HTMLImageElement;

      if (media.type === 'video') {
        if (videoRef.current && videoRef.current.readyState >= 2) {
          mediaElement = videoRef.current;
        } else {
          const video = document.createElement('video');
          video.src = media.url;
          video.crossOrigin = 'anonymous';
          video.playsInline = true;
          video.muted = true;
          await new Promise((res) => {
            video.onloadedmetadata = () => res(null);
            video.onerror = () => res(null);
            setTimeout(res, 2000);
          });
          mediaElement = video;
        }
      } else {
        const img = new Image();
        img.src = media.url;
        img.crossOrigin = 'anonymous';
        await new Promise((res) => {
          img.onload = () => res(null);
          img.onerror = () => res(null);
          setTimeout(res, 2000);
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
        onProgress: (percent, msg) => {
          setRenderProgress(percent);
          if (msg) setRenderMessage(msg);
        },
      });

      setIsRendering(false);
      onMockupGenerated(result, selectedProduct);
    } catch (err: any) {
      console.error('Rendering error:', err);
      alert('Mockup creation error: ' + (err.message || 'Unknown error'));
      setIsRendering(false);
    }
  };

  useImperativeHandle(ref, () => ({
    generateMockup: handleGenerateMockup,
  }));

  return (
    <div className="h-full flex flex-col justify-between overflow-hidden select-none">
      {/* 1. Large Immersive Video Viewport (Takes up majority of screen) */}
      <div className="flex-1 min-h-0 relative flex items-center justify-center p-1 sm:p-2">
        <div
          ref={containerRef}
          className="relative h-full aspect-[9/16] max-h-[58vh] bg-black rounded-3xl overflow-hidden shadow-2xl border border-slate-200 select-none cursor-grab active:cursor-grabbing"
          style={{ touchAction: 'none' }}
        >
          {media.type === 'video' ? (
            <video
              key={media.url}
              ref={videoRef}
              src={media.url}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              className="w-full h-full object-cover pointer-events-none"
            />
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={media.url}
              alt="Source Media"
              className="w-full h-full object-cover pointer-events-none"
            />
          )}

          {/* Draggable Allmax Product Sticker */}
          <div
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            style={{
              position: 'absolute',
              left: `${config.x}%`,
              top: `${config.y}%`,
              transform: `translate(-50%, -50%) rotate(${config.rotation}deg)`,
              width: `${config.scale * 100}%`,
              zIndex: 30,
              touchAction: 'none',
            }}
            className="cursor-grab active:cursor-grabbing select-none transition-transform"
          >
            <div className="relative flex flex-col items-center justify-center filter drop-shadow-[0_16px_24px_rgba(0,0,0,0.85)]">
              {/* Instagram Active Dragging Bounding Outline */}
              {isDragging && (
                <div className="absolute -inset-2 border-2 border-dashed border-white rounded-2xl pointer-events-none animate-pulse" />
              )}

              {/* Tub SVG Graphic */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedProduct.svgGraphic}
                alt={selectedProduct.name}
                className="w-full h-auto object-contain select-none pointer-events-none"
                draggable={false}
              />

              {/* Sponsor Badge */}
              {config.showBadge && (
                <div className="mt-1 px-2.5 py-0.5 rounded-full bg-slate-950/95 text-white text-[8px] sm:text-[9px] font-black uppercase tracking-wider shadow-lg border border-amber-400 whitespace-nowrap">
                  {config.badgeText || '⚡ ALLMAX ATHLETE'}
                </div>
              )}
            </div>
          </div>

          {/* Floating Action Toolbar on Right (TikTok/Reels Style - 0 Extra Space Used) */}
          <div className="absolute top-3 right-2.5 z-35 flex flex-col items-center space-y-2 pointer-events-auto">
            {/* Snap Position Pill (1-Tap Cycle) */}
            <button
              onClick={cycleNextPreset}
              className="w-9 h-9 rounded-full bg-black/65 backdrop-blur-md text-white border border-white/20 flex flex-col items-center justify-center active:scale-90 transition-transform shadow-lg"
              title="Snap Position"
            >
              <Compass className="w-4 h-4 text-orange-400" />
            </button>

            {/* Size Pill: S / M / L */}
            <button
              onClick={cycleStickerSize}
              className="w-9 h-9 rounded-full bg-black/65 backdrop-blur-md text-white border border-white/20 flex flex-col items-center justify-center active:scale-90 transition-transform shadow-lg font-black text-[11px]"
              title="Toggle Size (S, M, L)"
            >
              <span className="text-amber-400">{getSizeLabel()}</span>
            </button>

            {/* Sponsor Badge Toggle Pill */}
            <button
              onClick={() => setConfig((p) => ({ ...p, showBadge: !p.showBadge }))}
              className={`w-9 h-9 rounded-full backdrop-blur-md border flex items-center justify-center active:scale-90 transition-transform shadow-lg ${
                config.showBadge
                  ? 'bg-amber-500/90 text-white border-amber-300'
                  : 'bg-black/65 text-slate-400 border-white/20'
              }`}
              title="Toggle Athlete Badge"
            >
              <Sparkles className="w-4 h-4" />
            </button>

            {/* Sound Toggle */}
            {media.type === 'video' && (
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="w-9 h-9 rounded-full bg-black/65 backdrop-blur-md text-white border border-white/20 flex items-center justify-center active:scale-90 transition-transform shadow-lg"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>
            )}
          </div>

          {/* Floating Left Top: Play / Pause */}
          <div className="absolute top-3 left-2.5 z-35 flex items-center space-x-1.5 pointer-events-auto">
            {media.type === 'video' && (
              <button
                onClick={togglePlay}
                className="p-2 rounded-full bg-black/65 backdrop-blur-md text-white border border-white/20 active:scale-90 transition-transform shadow-lg"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
              </button>
            )}
          </div>

          {/* Drag Indicator Tooltip on Bottom of Video */}
          <div className="absolute bottom-2.5 left-0 right-0 z-30 flex justify-center pointer-events-none">
            <div className="bg-black/65 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-white font-extrabold flex items-center space-x-1.5 border border-white/20 shadow-md">
              <Move className="w-3 h-3 text-orange-400" />
              <span>Drag supplement anywhere</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Docked Bottom Drawer (Fixed, No Scrolling Needed on Mobile) */}
      <div className="bg-white border-t border-slate-200 p-2.5 sm:p-3 shadow-2xl safe-bottom space-y-2">
        {/* Product Drawer Header */}
        <div className="flex items-center justify-between text-xs font-bold px-1">
          <div className="flex items-center space-x-1 text-slate-800">
            <Layers className="w-3.5 h-3.5 text-[#FF4800]" />
            <span>Select Supplement:</span>
          </div>
          <span className="text-[#FF4800] font-black text-[11px] truncate max-w-[170px]">
            {selectedProduct.name}
          </span>
        </div>

        {/* Large Horizontal Product Cards Carousel */}
        <div className="flex space-x-2 overflow-x-auto pb-0.5 scrollbar-none snap-x">
          {ALLMAX_PRODUCTS.map((prod) => {
            const isSelected = selectedProduct.id === prod.id;
            return (
              <button
                key={prod.id}
                onClick={() => handleSelectProduct(prod)}
                className={`w-[85px] sm:w-[95px] p-2 rounded-2xl border flex flex-col items-center justify-center shrink-0 snap-start transition-all active:scale-95 ${
                  isSelected
                    ? 'border-[#FF4800] bg-orange-50/90 ring-2 ring-[#FF4800]/30 shadow-md'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="w-9 h-11 flex items-center justify-center mb-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={prod.svgGraphic}
                    alt=""
                    className="max-h-full max-w-full object-contain pointer-events-none"
                  />
                </div>
                <span className="text-[10px] font-black text-slate-900 truncate w-full text-center block">
                  {prod.name}
                </span>
                <span className="text-[8px] text-slate-500 truncate w-full text-center block font-bold uppercase">
                  {prod.heroBadge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Big Bottom Action Button */}
        <div className="flex items-center space-x-2 pt-0.5">
          <button
            onClick={onBackToMedia}
            className="py-3 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-bold text-xs hover:bg-slate-100 active:scale-95 transition-all"
          >
            ← Media
          </button>

          <button
            onClick={handleGenerateMockup}
            disabled={isRendering}
            className="flex-1 py-3 px-4 rounded-xl bg-[#FF4800] hover:bg-[#E63E00] text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-orange-500/25 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {isRendering ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating ({renderProgress}%)...</span>
              </>
            ) : (
              <>
                <span>Create Video Reel</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Fullscreen Rendering Loader Overlay */}
      {isRendering && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xs w-full p-6 text-center space-y-4 shadow-2xl border border-slate-100">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-orange-100 text-[#FF4800] flex items-center justify-center shadow-inner">
              <Loader2 className="w-7 h-7 animate-spin" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Rendering Allmax Reel
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {renderMessage}
              </p>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-[#FF4800] h-full transition-all duration-300 rounded-full"
                style={{ width: `${renderProgress}%` }}
              />
            </div>

            <div className="text-xs font-black text-[#FF4800]">
              {renderProgress}% Complete
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

ProductOverlayStudio.displayName = 'ProductOverlayStudio';
