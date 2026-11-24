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
  ExternalLink,
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
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number }>({
    mouseX: 0,
    mouseY: 0,
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

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: config.x,
      startY: config.y,
    };
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const deltaX = ((e.clientX - dragStartRef.current.mouseX) / rect.width) * 100;
      const deltaY = ((e.clientY - dragStartRef.current.mouseY) / rect.height) * 100;
      const newX = Math.max(12, Math.min(88, dragStartRef.current.startX + deltaX));
      const newY = Math.max(12, Math.min(88, dragStartRef.current.startY + deltaY));
      setConfig((prev) => ({
        ...prev,
        x: Math.round(newX),
        y: Math.round(newY),
      }));
    },
    [isDragging]
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleDragEnd);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragEnd);
    };
  }, [isDragging, handleMouseMove, handleDragEnd]);

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
    <div className="w-full max-w-6xl mx-auto space-y-6 py-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 pb-4 gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Place Allmax Product in Video
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Pick a supplement and place it anywhere on your video.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={onBackToMedia}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-600 transition-colors"
          >
            ← Change Video
          </button>
          <button
            onClick={handleGenerateMockup}
            disabled={isRendering}
            className="flex items-center space-x-2 px-6 py-2 rounded-xl bg-[#FF4800] hover:bg-[#E63E00] text-white text-xs sm:text-sm font-bold shadow-md shadow-orange-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {isRendering ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Video ({renderProgress}%)...</span>
              </>
            ) : (
              <span>Create Mockup Video →</span>
            )}
          </button>
        </div>
      </div>

      {/* Clean 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Video Stage (6 cols) */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between bg-white border border-slate-200 px-3 py-2 rounded-xl shadow-sm text-xs font-medium">
            <span className="text-slate-500">Video Format:</span>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setAspectRatio('9:16')}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg transition-all ${
                  aspectRatio === '9:16'
                    ? 'bg-[#FF4800] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>9:16 (TikTok & Reels)</span>
              </button>
              <button
                onClick={() => setAspectRatio('16:9')}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg transition-all ${
                  aspectRatio === '16:9'
                    ? 'bg-[#FF4800] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>16:9</span>
              </button>
            </div>
          </div>

          {/* Viewport Canvas */}
          <div
            ref={containerRef}
            className={`relative mx-auto bg-slate-950 rounded-2xl overflow-hidden shadow-xl select-none cursor-grab active:cursor-grabbing ${
              aspectRatio === '9:16'
                ? 'aspect-[9/16] max-h-[540px]'
                : 'aspect-[16/9] w-full'
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

            {/* Draggable Product Overlay */}
            <div
              onMouseDown={handleMouseDown}
              style={{
                position: 'absolute',
                left: `${config.x}%`,
                top: `${config.y}%`,
                transform: `translate(-50%, -50%) rotate(${config.rotation}deg)`,
                width: `${config.scale * 100}%`,
                opacity: config.opacity,
                zIndex: 20,
              }}
              className="group cursor-grab active:cursor-grabbing"
            >
              <div
                className={`relative flex flex-col items-center justify-center ${
                  config.hasDropShadow ? 'filter drop-shadow-[0_16px_20px_rgba(0,0,0,0.7)]' : ''
                }`}
              >
                {/* Visual outline on hover */}
                <div className="absolute -inset-1 border-2 border-white/60 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                {/* Tub SVG Graphic */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedProduct.svgGraphic}
                  alt={selectedProduct.name}
                  className="w-full h-auto object-contain select-none pointer-events-none"
                  draggable={false}
                />

                {/* Badge Overlay */}
                {config.showBadge && config.badgeText && (
                  <div className="mt-1 px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-extrabold uppercase shadow-lg border border-amber-400 whitespace-nowrap">
                    {config.badgeText}
                  </div>
                )}
              </div>
            </div>

            {/* Play/Pause Button */}
            {media.type === 'video' && (
              <button
                onClick={togglePlay}
                className="absolute bottom-3 left-3 z-30 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition-all backdrop-blur-sm"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
              </button>
            )}

            <div className="absolute bottom-3 right-3 z-30 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded text-[11px] text-white font-medium pointer-events-none">
              Drag anywhere to place
            </div>
          </div>

          <p className="text-xs text-center text-slate-500 flex items-center justify-center space-x-1">
            <Move className="w-3.5 h-3.5 text-[#FF4800]" />
            <span>Click and drag the supplement directly on the video screen</span>
          </p>
        </div>

        {/* Right Column: Simple Controls (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          {/* 1. Choose Product */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              1. Choose Allmax Product
            </h3>

            <div className="grid grid-cols-2 gap-2.5 max-h-[260px] overflow-y-auto pr-1">
              {ALLMAX_PRODUCTS.slice(0, 6).map((prod) => {
                const isSelected = selectedProduct.id === prod.id;
                return (
                  <button
                    key={prod.id}
                    onClick={() => handleSelectProduct(prod)}
                    className={`p-2.5 rounded-xl border text-left flex items-center space-x-2.5 transition-all ${
                      isSelected
                        ? 'border-[#FF4800] bg-orange-50/60 ring-2 ring-[#FF4800]/20 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-10 h-12 flex-shrink-0 bg-slate-100 rounded-lg p-1 flex items-center justify-center">
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
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#FF4800]" />}
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
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              2. Position on Video
            </h3>

            <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
              <button
                onClick={() => applyPreset('bottom-right')}
                className={`py-2 px-3 rounded-xl border transition-all text-center ${
                  config.preset === 'bottom-right'
                    ? 'border-[#FF4800] bg-orange-500 text-white shadow-sm'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                ↘ Bottom Right
              </button>
              <button
                onClick={() => applyPreset('bottom-left')}
                className={`py-2 px-3 rounded-xl border transition-all text-center ${
                  config.preset === 'bottom-left'
                    ? 'border-[#FF4800] bg-orange-500 text-white shadow-sm'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                ↙ Bottom Left
              </button>
              <button
                onClick={() => applyPreset('center')}
                className={`py-2 px-3 rounded-xl border transition-all text-center ${
                  config.preset === 'center'
                    ? 'border-[#FF4800] bg-orange-500 text-white shadow-sm'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                • Center
              </button>
              <button
                onClick={() => applyPreset('top-right')}
                className={`py-2 px-3 rounded-xl border transition-all text-center ${
                  config.preset === 'top-right'
                    ? 'border-[#FF4800] bg-orange-500 text-white shadow-sm'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                ↗ Top Right
              </button>
              <button
                onClick={() => applyPreset('top-left')}
                className={`py-2 px-3 rounded-xl border transition-all text-center ${
                  config.preset === 'top-left'
                    ? 'border-[#FF4800] bg-orange-500 text-white shadow-sm'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                ↖ Top Left
              </button>
              <button
                onClick={() => applyPreset('floating-right')}
                className={`py-2 px-3 rounded-xl border transition-all text-center ${
                  config.preset === 'floating-right'
                    ? 'border-[#FF4800] bg-orange-500 text-white shadow-sm'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                → Float Right
              </button>
            </div>
          </div>

          {/* 3. Size & Badge */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 text-xs">
            {/* Scale Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold text-slate-700">
                <span>Product Size:</span>
                <span className="text-[#FF4800]">{Math.round(config.scale * 100)}%</span>
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
                className="w-full"
              />
            </div>

            {/* Badge Select */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="font-semibold text-slate-700 block">Sponsor Badge:</label>
              <select
                value={config.badgeText}
                onChange={(e) => setConfig((prev) => ({ ...prev, badgeText: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 text-xs font-medium"
              >
                {BADGE_OPTIONS.map((b) => (
                  <option key={b.id} value={b.label}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 4. Action Button */}
          <button
            onClick={handleGenerateMockup}
            disabled={isRendering}
            className="w-full py-3.5 rounded-xl bg-[#FF4800] hover:bg-[#E63E00] text-white font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-orange-500/25 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2"
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
    </div>
  );
};
