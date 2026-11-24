'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Move,
  Play,
  Pause,
  Loader2,
  Check,
  ArrowRight,
  Sparkles,
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
        aspectRatio: '9:16',
        onProgress: (percent) => {
          setRenderProgress(percent);
        },
      });

      setIsRendering(false);
      onMockupGenerated(result, selectedProduct);
    } catch (err: any) {
      console.error('Rendering error:', err);
      alert('Video creation failed: ' + (err.message || 'Unknown error'));
      setIsRendering(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-3 py-1 px-1 pb-24 sm:pb-8">
      {/* Top Simple Step Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">
            Step 2: Position Supplement
          </h1>
          <p className="text-[11px] text-slate-500">
            Drag the tub on screen or tap a position preset below
          </p>
        </div>

        <button
          onClick={onBackToMedia}
          className="text-xs font-bold text-slate-500 hover:text-slate-800 bg-white border border-slate-200 px-2.5 py-1 rounded-lg"
        >
          ← Back
        </button>
      </div>

      {/* Video Preview Canvas (Optimized Mobile Height - No Scrolling Needed) */}
      <div className="relative mx-auto bg-slate-950 rounded-2xl overflow-hidden shadow-lg border border-slate-200 touch-none">
        <div
          ref={containerRef}
          className="relative aspect-[9/16] h-[250px] sm:h-[320px] mx-auto select-none cursor-grab active:cursor-grabbing"
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

          {/* Draggable & Touch-Move Product Overlay */}
          <div
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            style={{
              position: 'absolute',
              left: `${config.x}%`,
              top: `${config.y}%`,
              transform: `translate(-50%, -50%) rotate(${config.rotation}deg)`,
              width: `${config.scale * 100}%`,
              zIndex: 20,
              touchAction: 'none',
            }}
            className="cursor-grab active:cursor-grabbing select-none"
          >
            <div className="relative flex flex-col items-center justify-center filter drop-shadow-[0_12px_16px_rgba(0,0,0,0.7)]">
              {/* Subtle outline for tactile feedback */}
              <div className="absolute -inset-1 border border-white/60 rounded-xl pointer-events-none" />

              {/* Tub SVG Graphic */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedProduct.svgGraphic}
                alt={selectedProduct.name}
                className="w-full h-auto object-contain select-none pointer-events-none"
                draggable={false}
              />

              {/* Sponsor Badge */}
              <div className="mt-0.5 px-2 py-0.5 rounded-full bg-slate-900/95 text-white text-[8px] font-black uppercase shadow-md border border-amber-400 whitespace-nowrap">
                ⚡ ALLMAX ATHLETE
              </div>
            </div>
          </div>

          {/* Video Play/Pause toggle */}
          {media.type === 'video' && (
            <button
              onClick={togglePlay}
              className="absolute bottom-2 left-2 z-30 p-1.5 rounded-full bg-black/60 text-white"
            >
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-white" />}
            </button>
          )}

          {/* Touch Indicator Tag */}
          <div className="absolute bottom-2 right-2 z-30 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] text-white font-semibold pointer-events-none">
            👆 Drag with finger
          </div>
        </div>
      </div>

      {/* Control 1: Horizontal Supplement Reel (1-Tap Select) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm space-y-1.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-800">
          <span>Choose Supplement:</span>
          <span className="text-[#FF4800] text-[11px] font-extrabold">{selectedProduct.name}</span>
        </div>

        <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none snap-x">
          {ALLMAX_PRODUCTS.map((prod) => {
            const isSelected = selectedProduct.id === prod.id;
            return (
              <button
                key={prod.id}
                onClick={() => handleSelectProduct(prod)}
                className={`w-[110px] p-2 rounded-xl border text-center flex flex-col items-center justify-center shrink-0 snap-start transition-all active:scale-95 ${
                  isSelected
                    ? 'border-[#FF4800] bg-orange-50/80 ring-2 ring-[#FF4800]/25 shadow-sm'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="w-8 h-10 flex items-center justify-center mb-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={prod.svgGraphic} alt="" className="max-h-full max-w-full object-contain" />
                </div>
                <span className="text-[11px] font-black text-slate-900 truncate w-full block">
                  {prod.name}
                </span>
                <span className="text-[9px] text-slate-500 truncate w-full block">
                  {prod.heroBadge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Control 2: Quick Position Preset Pills */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm space-y-2">
        <span className="text-xs font-bold text-slate-800 block">Position on Screen:</span>
        <div className="grid grid-cols-4 gap-1.5 text-xs font-bold">
          <button
            onClick={() => applyPreset('bottom-right')}
            className={`py-2 px-1 rounded-xl border text-center transition-all text-[11px] active:scale-95 ${
              config.preset === 'bottom-right'
                ? 'border-[#FF4800] bg-[#FF4800] text-white shadow-sm'
                : 'border-slate-200 text-slate-700 bg-slate-50'
            }`}
          >
            ↘ Bottom-R
          </button>
          <button
            onClick={() => applyPreset('bottom-left')}
            className={`py-2 px-1 rounded-xl border text-center transition-all text-[11px] active:scale-95 ${
              config.preset === 'bottom-left'
                ? 'border-[#FF4800] bg-[#FF4800] text-white shadow-sm'
                : 'border-slate-200 text-slate-700 bg-slate-50'
            }`}
          >
            ↙ Bottom-L
          </button>
          <button
            onClick={() => applyPreset('top-right')}
            className={`py-2 px-1 rounded-xl border text-center transition-all text-[11px] active:scale-95 ${
              config.preset === 'top-right'
                ? 'border-[#FF4800] bg-[#FF4800] text-white shadow-sm'
                : 'border-slate-200 text-slate-700 bg-slate-50'
            }`}
          >
            ↗ Top-R
          </button>
          <button
            onClick={() => applyPreset('center')}
            className={`py-2 px-1 rounded-xl border text-center transition-all text-[11px] active:scale-95 ${
              config.preset === 'center'
                ? 'border-[#FF4800] bg-[#FF4800] text-white shadow-sm'
                : 'border-slate-200 text-slate-700 bg-slate-50'
            }`}
          >
            • Center
          </button>
        </div>
      </div>

      {/* Sticky Bottom Action Button for Generating Video */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl z-40 safe-bottom">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <span className="text-xs font-black text-slate-900 block truncate">
              {selectedProduct.name}
            </span>
            <span className="text-[10px] text-slate-500 block">
              Position: {config.preset}
            </span>
          </div>

          <button
            onClick={handleGenerateMockup}
            disabled={isRendering}
            className="flex-1 py-3 px-5 rounded-xl bg-[#FF4800] hover:bg-[#E63E00] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-500/25 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-1.5"
          >
            {isRendering ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating ({renderProgress}%)...</span>
              </>
            ) : (
              <>
                <span>Create Video</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
