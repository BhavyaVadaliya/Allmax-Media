'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  AllmaxProduct,
  MediaItem,
  OverlayConfig,
  OverlayPositionPreset,
  RenderResult,
} from '@/types';
import { ALLMAX_PRODUCTS, BADGE_OPTIONS } from '@/data/allmaxProducts';
import { renderMockupMedia } from '@/lib/videoRenderer';
import {
  Move,
  Play,
  Pause,
  Smartphone,
  Monitor,
  Loader2,
  Check,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface ProductOverlayStudioProps {
  media: MediaItem;
  onMockupGenerated: (result: RenderResult, product: AllmaxProduct) => void;
  onBackToMedia: () => void;
}

export const ProductOverlayStudio: React.FC<ProductOverlayStudioProps> = ({
  media,
  onMockupGenerated,
  onBackToMedia,
}) => {
  const [selectedProduct, setSelectedProduct] = useState<AllmaxProduct>(ALLMAX_PRODUCTS[0]);
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9'>('9:16');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [config, setConfig] = useState<OverlayConfig>({
    productId: ALLMAX_PRODUCTS[0].id,
    x: 76,
    y: 75,
    scale: 0.38,
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
  const dragStartRef = useRef<{ clientX: number; clientY: number; startX: number; startY: number }>({
    clientX: 0,
    clientY: 0,
    startX: 0,
    startY: 0,
  });

  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [renderProgress, setRenderProgress] = useState<number>(0);

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
      case 'top-left':
        x = 24;
        y = 25;
        break;
      case 'center':
        x = 50;
        y = 50;
        break;
      case 'floating-right':
        x = 78;
        y = 55;
        break;
    }
    setConfig((prev) => ({
      ...prev,
      preset,
      x,
      y,
    }));
  };

  const handleSelectProduct = (product: AllmaxProduct) => {
    setSelectedProduct(product);
    setConfig((prev) => ({
      ...prev,
      productId: product.id,
      scale: product.defaultScale,
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

  // Touch Drag Handlers (Mobile Support)
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

  const updateCoordinates = useCallback(
    (clientX: number, clientY: number) => {
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
    },
    []
  );

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
      e.preventDefault(); // Prevent rubber-band scrolling while dragging overlay
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
    setIsRendering(true);
    setRenderProgress(10);

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
        aspectRatio,
        onProgress: (percent) => {
          setRenderProgress(percent);
        },
      });

      setIsRendering(false);
      onMockupGenerated(result, selectedProduct);
    } catch (err: any) {
      console.error('Rendering error:', err);
      alert('Mockup composition failed: ' + (err.message || 'Unknown error'));
      setIsRendering(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4 sm:space-y-6 py-2 sm:py-4 pb-28 lg:pb-8">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 gap-2">
        <div>
          <h1 className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
            Place Allmax Product in Video
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 hidden sm:block">
            Touch or drag the supplement directly on the video screen.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={onBackToMedia}
            className="px-2.5 sm:px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-600 transition-colors"
          >
            ← <span className="hidden sm:inline">Change</span> Video
          </button>
          
          <button
            onClick={handleGenerateMockup}
            disabled={isRendering}
            className="hidden lg:flex items-center space-x-2 px-5 py-2 rounded-xl bg-[#FF4800] hover:bg-[#E63E00] text-white text-xs sm:text-sm font-bold shadow-md shadow-orange-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {isRendering ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating ({renderProgress}%)...</span>
              </>
            ) : (
              <span>Create Mockup Video →</span>
            )}
          </button>
        </div>
      </div>

      {/* Main Studio Grid: Mobile Optimized Vertical Flow / Desktop 2-Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start">
        {/* Stage Column (Left on Desktop, Top on Mobile) */}
        <div className="lg:col-span-6 space-y-2.5">
          {/* Format Switcher */}
          <div className="flex items-center justify-between bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm text-xs font-medium">
            <span className="text-slate-500 text-[11px] sm:text-xs">Ratio:</span>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setAspectRatio('9:16')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  aspectRatio === '9:16'
                    ? 'bg-[#FF4800] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3 h-3" />
                <span>9:16 (Vertical)</span>
              </button>
              <button
                onClick={() => setAspectRatio('16:9')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  aspectRatio === '16:9'
                    ? 'bg-[#FF4800] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Monitor className="w-3 h-3" />
                <span>16:9</span>
              </button>
            </div>
          </div>

          {/* Interactive Canvas Stage */}
          <div
            ref={containerRef}
            className={`relative mx-auto bg-slate-950 rounded-2xl overflow-hidden shadow-xl select-none cursor-grab active:cursor-grabbing touch-none ${
              aspectRatio === '9:16'
                ? 'aspect-[9/16] h-[34vh] max-h-[340px] sm:h-auto sm:max-h-[500px]'
                : 'aspect-[16/9] w-full max-h-[320px]'
            }`}
          >
            {media.type === 'video' ? (
              <video
                key={media.url}
                ref={videoRef}
                src={media.url}
                autoPlay
                loop
                muted
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

            {/* Draggable & Touch-enabled Product Overlay */}
            <div
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              style={{
                position: 'absolute',
                left: `${config.x}%`,
                top: `${config.y}%`,
                transform: `translate(-50%, -50%) rotate(${config.rotation}deg)`,
                width: `${config.scale * 100}%`,
                opacity: config.opacity,
                zIndex: 20,
                touchAction: 'none',
              }}
              className="cursor-grab active:cursor-grabbing select-none"
            >
              <div
                className={`relative flex flex-col items-center justify-center ${
                  config.hasDropShadow ? 'filter drop-shadow-[0_14px_18px_rgba(0,0,0,0.7)]' : ''
                }`}
              >
                {/* Visual pulse boundary */}
                <div className="absolute -inset-1.5 border-2 border-white/70 rounded-xl opacity-60 pointer-events-none" />

                {/* Tub SVG Graphic */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedProduct.svgGraphic}
                  alt={selectedProduct.name}
                  className="w-full h-auto object-contain select-none pointer-events-none"
                  draggable={false}
                />

                {/* Sponsor Badge Overlay */}
                {config.showBadge && config.badgeText && (
                  <div className="mt-1 px-2.5 py-0.5 rounded-full bg-slate-900/95 text-white text-[9px] font-extrabold uppercase shadow-lg border border-amber-400 whitespace-nowrap">
                    {config.badgeText}
                  </div>
                )}
              </div>
            </div>

            {/* Video Play/Pause toggle */}
            {media.type === 'video' && (
              <button
                onClick={togglePlay}
                className="absolute bottom-2.5 left-2.5 z-30 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition-all backdrop-blur-sm"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
              </button>
            )}

            {/* Hint pill */}
            <div className="absolute bottom-2.5 right-2.5 z-30 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] text-white font-medium pointer-events-none">
              👆 Touch &amp; Drag
            </div>
          </div>

          <p className="text-[11px] text-center text-slate-500 flex items-center justify-center space-x-1">
            <Move className="w-3 h-3 text-[#FF4800]" />
            <span>Drag supplement anywhere on screen with finger or mouse</span>
          </p>
        </div>

        {/* Controls Column (Right on Desktop, Below Preview on Mobile) */}
        <div className="lg:col-span-6 space-y-4">
          {/* 1. Choose Product (Horizontal Carousel on Mobile, Grid on Desktop) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <span>1. Select Allmax Product</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-orange-100 text-[#FF4800] rounded font-bold">
                  {selectedProduct.name}
                </span>
              </h3>
              <span className="text-[10px] text-slate-400 font-medium">Swipe to choose</span>
            </div>

            {/* Responsive Product Picker: Swipeable on Mobile, Grid on Desktop */}
            <div className="flex lg:grid lg:grid-cols-2 gap-2.5 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
              {ALLMAX_PRODUCTS.map((prod) => {
                const isSelected = selectedProduct.id === prod.id;
                return (
                  <button
                    key={prod.id}
                    onClick={() => handleSelectProduct(prod)}
                    className={`min-w-[145px] sm:min-w-[160px] lg:min-w-0 p-2.5 rounded-xl border text-left flex items-center space-x-2.5 transition-all shrink-0 snap-start active:scale-95 ${
                      isSelected
                        ? 'border-[#FF4800] bg-orange-50/70 ring-2 ring-[#FF4800]/20 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-9 h-11 sm:w-10 sm:h-12 flex-shrink-0 bg-slate-100 rounded-lg p-1 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={prod.svgGraphic}
                        alt={prod.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 truncate block">
                          {prod.name}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#FF4800] shrink-0 ml-1" />}
                      </div>
                      <span className="text-[10px] text-slate-500 truncate block">
                        {prod.heroBadge}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Position Snaps */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              2. Quick Position Presets
            </h3>

            <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
              <button
                onClick={() => applyPreset('bottom-right')}
                className={`py-2 px-2 rounded-xl border transition-all text-center active:scale-95 text-[11px] sm:text-xs ${
                  config.preset === 'bottom-right'
                    ? 'border-[#FF4800] bg-orange-500 text-white shadow-sm'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                ↘ Bottom Right
              </button>
              <button
                onClick={() => applyPreset('bottom-left')}
                className={`py-2 px-2 rounded-xl border transition-all text-center active:scale-95 text-[11px] sm:text-xs ${
                  config.preset === 'bottom-left'
                    ? 'border-[#FF4800] bg-orange-500 text-white shadow-sm'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                ↙ Bottom Left
              </button>
              <button
                onClick={() => applyPreset('center')}
                className={`py-2 px-2 rounded-xl border transition-all text-center active:scale-95 text-[11px] sm:text-xs ${
                  config.preset === 'center'
                    ? 'border-[#FF4800] bg-orange-500 text-white shadow-sm'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                • Center
              </button>
              <button
                onClick={() => applyPreset('top-right')}
                className={`py-2 px-2 rounded-xl border transition-all text-center active:scale-95 text-[11px] sm:text-xs ${
                  config.preset === 'top-right'
                    ? 'border-[#FF4800] bg-orange-500 text-white shadow-sm'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                ↗ Top Right
              </button>
              <button
                onClick={() => applyPreset('top-left')}
                className={`py-2 px-2 rounded-xl border transition-all text-center active:scale-95 text-[11px] sm:text-xs ${
                  config.preset === 'top-left'
                    ? 'border-[#FF4800] bg-orange-500 text-white shadow-sm'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                ↖ Top Left
              </button>
              <button
                onClick={() => applyPreset('floating-right')}
                className={`py-2 px-2 rounded-xl border transition-all text-center active:scale-95 text-[11px] sm:text-xs ${
                  config.preset === 'floating-right'
                    ? 'border-[#FF4800] bg-orange-500 text-white shadow-sm'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                → Float Right
              </button>
            </div>
          </div>

          {/* 3. Size & Badge Options */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3.5 text-xs">
            {/* Scale Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-bold text-slate-800">
                <span>Product Size:</span>
                <span className="text-[#FF4800] font-black">{Math.round(config.scale * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="0.65"
                step="0.01"
                value={config.scale}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, scale: parseFloat(e.target.value) }))
                }
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#FF4800]"
              />
            </div>

            {/* Badge Select */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="font-bold text-slate-800 block">Sponsor Badge:</label>
              <select
                value={config.badgeText}
                onChange={(e) => setConfig((prev) => ({ ...prev, badgeText: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF4800]"
              >
                {BADGE_OPTIONS.map((b) => (
                  <option key={b.id} value={b.label}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Desktop Only Action Button */}
          <button
            onClick={handleGenerateMockup}
            disabled={isRendering}
            className="hidden lg:flex w-full py-3.5 rounded-xl bg-[#FF4800] hover:bg-[#E63E00] text-white font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-orange-500/25 transition-all active:scale-95 disabled:opacity-50 items-center justify-center space-x-2"
          >
            {isRendering ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating Video ({renderProgress}%)...</span>
              </>
            ) : (
              <span>Create Mockup Video →</span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Sticky Bottom Action Dock (Thumb-Friendly) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl z-40 flex items-center justify-between gap-3 safe-bottom">
        <div className="flex items-center space-x-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-orange-100 p-1 shrink-0 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={selectedProduct.svgGraphic} alt="" className="max-h-full max-w-full" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-extrabold text-slate-900 block truncate">
              {selectedProduct.name}
            </span>
            <span className="text-[10px] text-slate-500 block truncate">
              {Math.round(config.scale * 100)}% • {config.preset}
            </span>
          </div>
        </div>

        <button
          onClick={handleGenerateMockup}
          disabled={isRendering}
          className="flex-1 max-w-[210px] py-3 px-4 rounded-xl bg-[#FF4800] hover:bg-[#E63E00] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-orange-500/25 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-1.5"
        >
          {isRendering ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>{renderProgress}%</span>
            </>
          ) : (
            <>
              <span>Create Mockup</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
