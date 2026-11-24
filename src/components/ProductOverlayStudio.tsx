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
  Sparkles,
  Volume2,
  VolumeX,
  Move,
  ArrowRight,
  Layers,
  ChevronLeft,
  Check,
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

const CATEGORIES = ['All', 'Protein', 'Pre-Workout', 'Creatine & Performance'];

export const ProductOverlayStudio = forwardRef<
  ProductOverlayStudioRef,
  ProductOverlayStudioProps
>(({ media, onMockupGenerated, onBackToMedia, onRenderingChange }, ref) => {
  const [selectedProduct, setSelectedProduct] = useState<AllmaxProduct>(ALLMAX_PRODUCTS[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [config, setConfig] = useState<OverlayConfig>({
    productId: ALLMAX_PRODUCTS[0].id,
    x: 75,
    y: 75,
    scale: 0.32,
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
  const maxProgressRef = useRef<number>(0);
  const [renderMessage, setRenderMessage] = useState<string>(
    'Rendering frames with client-side video compositor...'
  );

  useEffect(() => {
    onRenderingChange?.(isRendering, renderProgress);
  }, [isRendering, renderProgress, onRenderingChange]);

  const applyPreset = (preset: OverlayPositionPreset) => {
    let x = 50;
    let y = 50;
    switch (preset) {
      case 'bottom-right':
        x = 75;
        y = 75;
        break;
      case 'bottom-left':
        x = 25;
        y = 75;
        break;
      case 'top-right':
        x = 75;
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

  const setStickerScale = (scale: number) => {
    setConfig((prev) => ({ ...prev, scale }));
  };

  const handleSelectProduct = (product: AllmaxProduct) => {
    setSelectedProduct(product);
    setConfig((prev) => ({
      ...prev,
      productId: product.id,
      scale: 0.32,
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
    const newX = Math.max(15, Math.min(85, dragStartRef.current.startX + deltaX));
    const newY = Math.max(15, Math.min(85, dragStartRef.current.startY + deltaY));
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
    maxProgressRef.current = 10;
    setRenderProgress(10);
    setRenderMessage('Rendering frames with client-side video compositor...');

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
          if (percent >= maxProgressRef.current) {
            maxProgressRef.current = percent;
            setRenderProgress(percent);
          }
          if (msg) setRenderMessage(msg);
        },
      });

      maxProgressRef.current = 100;
      setRenderProgress(100);
      setRenderMessage('Allmax video reel created!');
      await new Promise((res) => setTimeout(res, 350));

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

  const filteredProducts =
    selectedCategory === 'All'
      ? ALLMAX_PRODUCTS
      : ALLMAX_PRODUCTS.filter((p) => p.category === selectedCategory);

  return (
    <div className="h-full flex flex-col justify-between overflow-hidden select-none bg-slate-50/50">
      {/* 1. Main Video Reel Canvas (True 9:16 Vertical Ratio, Beautifully Centered) */}
      <div className="flex-1 min-h-0 relative flex items-center justify-center p-2">
        <div
          ref={containerRef}
          className="relative h-full aspect-[9/16] max-h-[60vh] bg-black rounded-3xl overflow-hidden shadow-2xl border border-slate-200/90 select-none cursor-grab active:cursor-grabbing mx-auto"
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

          {/* Interactive Supplement Sticker Overlay */}
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
            <div className="relative flex flex-col items-center justify-center filter drop-shadow-[0_18px_26px_rgba(0,0,0,0.85)]">
              {/* Active Dragging Bounding Feedback */}
              {isDragging && (
                <div className="absolute -inset-2 border-2 border-dashed border-white rounded-2xl pointer-events-none animate-pulse" />
              )}

              {/* High-Resolution Tub Graphic */}
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

          {/* Floating Minimalist Top Toolbar (Clean Glassmorphism) */}
          <div className="absolute top-3 left-3 right-3 z-35 flex items-center justify-between pointer-events-auto">
            {/* Left: Play / Pause & Sound */}
            <div className="flex items-center space-x-1.5">
              {media.type === 'video' && (
                <button
                  onClick={togglePlay}
                  className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 flex items-center justify-center active:scale-90 transition-transform shadow-lg hover:bg-black/80"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                </button>
              )}

              {media.type === 'video' && (
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 flex items-center justify-center active:scale-90 transition-transform shadow-lg hover:bg-black/80"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              )}
            </div>

            {/* Right: Badge Toggle */}
            <button
              onClick={() => setConfig((p) => ({ ...p, showBadge: !p.showBadge }))}
              className={`px-2.5 py-1 rounded-full backdrop-blur-md border text-[10px] font-extrabold flex items-center space-x-1 active:scale-90 transition-transform shadow-lg ${
                config.showBadge
                  ? 'bg-amber-500/90 text-white border-amber-300 ring-2 ring-amber-400/40'
                  : 'bg-black/60 text-slate-300 border-white/20'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Badge {config.showBadge ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          {/* Drag Helper Tip on Bottom */}
          <div className="absolute bottom-2.5 left-0 right-0 z-30 flex justify-center pointer-events-none">
            <div className="bg-black/65 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-white font-bold flex items-center space-x-1.5 border border-white/20 shadow-md">
              <Move className="w-3 h-3 text-orange-400" />
              <span>Drag supplement anywhere</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Redesigned Premium Bottom Drawer (Unified Controls + Large Product Cards) */}
      <div className="bg-white border-t border-slate-200/90 p-3 sm:p-4 shadow-2xl safe-bottom space-y-2.5 rounded-t-3xl">
        {/* Row 1: Fast Alignment & Size Controls (Zero-Scroll & 1-Tap) */}
        <div className="flex items-center justify-between gap-2 pb-1 border-b border-slate-100">
          {/* Quick Corner Snap Buttons */}
          <div className="flex items-center space-x-1">
            <span className="text-[10px] font-black uppercase text-slate-400 mr-0.5">Snap:</span>
            {[
              { id: 'bottom-right' as const, label: '↘ BR' },
              { id: 'bottom-left' as const, label: '↙ BL' },
              { id: 'top-right' as const, label: '↗ TR' },
              { id: 'center' as const, label: '• CTR' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => applyPreset(p.id)}
                className={`px-2 py-1 rounded-lg text-[10px] font-black tracking-tight transition-all active:scale-95 ${
                  config.preset === p.id
                    ? 'bg-[#FF4800] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Size Pills: S, M, L */}
          <div className="flex items-center space-x-1">
            <span className="text-[10px] font-black uppercase text-slate-400 mr-0.5">Size:</span>
            {[
              { scale: 0.24, label: 'S' },
              { scale: 0.32, label: 'M' },
              { scale: 0.42, label: 'L' },
            ].map((s) => (
              <button
                key={s.label}
                onClick={() => setStickerScale(s.scale)}
                className={`w-6 h-6 rounded-lg text-[10px] font-black flex items-center justify-center transition-all active:scale-95 ${
                  Math.abs(config.scale - s.scale) < 0.05
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Product Carousel Header with Category Filters */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1.5">
            <Layers className="w-3.5 h-3.5 text-[#FF4800]" />
            <span className="font-black text-slate-900">Choose Supplement</span>
          </div>

          {/* Selected Product Title */}
          <span className="text-[#FF4800] font-black text-[11px] truncate max-w-[160px]">
            {selectedProduct.name}
          </span>
        </div>

        {/* Row 3: Modern Supplement Carousel (Larger Graphics, Clean Cards) */}
        <div className="flex space-x-2.5 overflow-x-auto pb-1 scrollbar-none snap-x">
          {filteredProducts.map((prod) => {
            const isSelected = selectedProduct.id === prod.id;
            return (
              <button
                key={prod.id}
                onClick={() => handleSelectProduct(prod)}
                className={`w-[96px] sm:w-[104px] p-2.5 rounded-2xl border flex flex-col items-center justify-between shrink-0 snap-start transition-all active:scale-95 ${
                  isSelected
                    ? 'border-[#FF4800] bg-orange-50/90 ring-2 ring-[#FF4800]/30 shadow-md'
                    : 'border-slate-200/90 bg-white hover:bg-slate-50 shadow-sm'
                }`}
              >
                {/* Large Crisp Tub Graphic */}
                <div className="w-11 h-14 flex items-center justify-center mb-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={prod.svgGraphic}
                    alt=""
                    className="max-h-full max-w-full object-contain pointer-events-none"
                  />
                </div>

                {/* Bold Clean Name & Tag */}
                <div className="w-full text-center">
                  <span className="text-[11px] font-black text-slate-900 truncate w-full block leading-tight">
                    {prod.name}
                  </span>
                  <span
                    className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-full inline-block mt-0.5 truncate max-w-full ${
                      isSelected
                        ? 'bg-[#FF4800] text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {prod.category}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Row 4: Action Buttons Row */}
        <div className="flex items-center space-x-2 pt-1">
          <button
            onClick={onBackToMedia}
            className="py-3 px-3.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 active:scale-95 transition-all flex items-center space-x-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Media</span>
          </button>

          <button
            onClick={handleGenerateMockup}
            disabled={isRendering}
            className="flex-1 py-3 px-4 rounded-xl bg-[#FF4800] hover:bg-[#E63E00] text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-orange-500/25 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-1.5"
          >
            {isRendering ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating ({renderProgress}%)...</span>
              </>
            ) : (
              <>
                <span>CREATE VIDEO REEL</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Rendering Modal Dialog */}
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
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                {renderMessage}
              </p>
            </div>

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
