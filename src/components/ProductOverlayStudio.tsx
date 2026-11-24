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

  // Update parent when rendering state changes
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

  const setStickerScale = (scale: number) => {
    setConfig((prev) => ({
      ...prev,
      scale,
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

  // Expose imperative handle so Navbar Next button can trigger render
  useImperativeHandle(ref, () => ({
    generateMockup: handleGenerateMockup,
  }));

  return (
    <div className="w-full max-w-lg mx-auto space-y-3 py-1 px-1">
      {/* Instagram Story / Reel Editor Canvas */}
      <div className="relative mx-auto bg-black rounded-2xl overflow-hidden shadow-xl border border-slate-200">
        <div
          ref={containerRef}
          className="relative aspect-[9/16] h-[280px] sm:h-[350px] mx-auto select-none overflow-hidden"
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

          {/* Draggable & Touch-Move Allmax Sticker */}
          <div
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            style={{
              position: 'absolute',
              left: `${config.x}%`,
              top: `${config.y}%`,
              transform: `translate(-50%, -50%) rotate(${config.rotation}deg)`,
              width: `${config.scale * 100}%`,
              zIndex: 25,
              touchAction: 'none',
            }}
            className="cursor-grab active:cursor-grabbing select-none transition-transform"
          >
            <div className="relative flex flex-col items-center justify-center filter drop-shadow-[0_14px_20px_rgba(0,0,0,0.75)]">
              {/* Instagram-style active sticker dashed border while dragging */}
              {isDragging && (
                <div className="absolute -inset-2 border-2 border-dashed border-white rounded-xl pointer-events-none animate-pulse" />
              )}

              {/* Tub Graphic */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedProduct.svgGraphic}
                alt={selectedProduct.name}
                className="w-full h-auto object-contain select-none pointer-events-none"
                draggable={false}
              />

              {/* Athlete Sponsor Badge */}
              {config.showBadge && (
                <div className="mt-1 px-2.5 py-0.5 rounded-full bg-slate-900/95 text-white text-[8px] sm:text-[9px] font-black uppercase tracking-wider shadow-lg border border-amber-400 whitespace-nowrap">
                  {config.badgeText || '⚡ ALLMAX ATHLETE'}
                </div>
              )}
            </div>
          </div>

          {/* Quick Floating Controls on Video */}
          <div className="absolute top-2 left-2 z-30 flex items-center space-x-1.5">
            {media.type === 'video' && (
              <button
                onClick={togglePlay}
                className="p-1.5 rounded-full bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 transition-colors"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
              </button>
            )}

            {media.type === 'video' && (
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-1.5 rounded-full bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>

          <div className="absolute top-2 right-2 z-30 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] text-white font-bold flex items-center space-x-1">
            <Move className="w-3 h-3 text-orange-400" />
            <span>Drag anywhere</span>
          </div>
        </div>
      </div>

      {/* Instagram Story Sticker Drawer: Supplement Picker */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#FF4800]" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-800">
              Allmax Stickers
            </span>
          </div>
          <span className="text-[11px] font-black text-[#FF4800] truncate max-w-[180px]">
            {selectedProduct.name}
          </span>
        </div>

        {/* Horizontal Sticker Reel */}
        <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none snap-x">
          {ALLMAX_PRODUCTS.map((prod) => {
            const isSelected = selectedProduct.id === prod.id;
            return (
              <button
                key={prod.id}
                onClick={() => handleSelectProduct(prod)}
                className={`w-[100px] p-2 rounded-xl border text-center flex flex-col items-center justify-center shrink-0 snap-start transition-all active:scale-95 ${
                  isSelected
                    ? 'border-[#FF4800] bg-orange-50/80 ring-2 ring-[#FF4800]/30 shadow-sm'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="w-8 h-10 flex items-center justify-center mb-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={prod.svgGraphic}
                    alt=""
                    className="max-h-full max-w-full object-contain pointer-events-none"
                  />
                </div>
                <span className="text-[10px] font-black text-slate-900 truncate w-full block">
                  {prod.name}
                </span>
                <span className="text-[8px] text-slate-500 truncate w-full block uppercase font-bold">
                  {prod.heroBadge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Instagram Quick Controls: Snap Corners & Size */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm space-y-2.5">
        {/* Row 1: Corner Snaps */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1.5">
            <span>Sticker Position:</span>
            <span className="text-[10px] text-slate-400 font-semibold capitalize">
              {config.preset.replace('-', ' ')}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 text-xs font-bold">
            <button
              onClick={() => applyPreset('bottom-right')}
              className={`py-1.5 px-1 rounded-xl border text-center transition-all text-[11px] active:scale-95 ${
                config.preset === 'bottom-right'
                  ? 'border-[#FF4800] bg-[#FF4800] text-white shadow-sm'
                  : 'border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              ↘ Bottom-R
            </button>
            <button
              onClick={() => applyPreset('bottom-left')}
              className={`py-1.5 px-1 rounded-xl border text-center transition-all text-[11px] active:scale-95 ${
                config.preset === 'bottom-left'
                  ? 'border-[#FF4800] bg-[#FF4800] text-white shadow-sm'
                  : 'border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              ↙ Bottom-L
            </button>
            <button
              onClick={() => applyPreset('top-right')}
              className={`py-1.5 px-1 rounded-xl border text-center transition-all text-[11px] active:scale-95 ${
                config.preset === 'top-right'
                  ? 'border-[#FF4800] bg-[#FF4800] text-white shadow-sm'
                  : 'border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              ↗ Top-R
            </button>
            <button
              onClick={() => applyPreset('center')}
              className={`py-1.5 px-1 rounded-xl border text-center transition-all text-[11px] active:scale-95 ${
                config.preset === 'center'
                  ? 'border-[#FF4800] bg-[#FF4800] text-white shadow-sm'
                  : 'border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              • Center
            </button>
          </div>
        </div>

        {/* Row 2: Size & Badge Toggle */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 gap-2">
          {/* Size Pills */}
          <div className="flex items-center space-x-1">
            <span className="text-[11px] font-bold text-slate-600 mr-1">Size:</span>
            {[
              { label: 'S', val: 0.3 },
              { label: 'M', val: 0.38 },
              { label: 'L', val: 0.48 },
            ].map((size) => (
              <button
                key={size.label}
                onClick={() => setStickerScale(size.val)}
                className={`w-7 h-7 rounded-lg text-[10px] font-black transition-all ${
                  Math.abs(config.scale - size.val) < 0.05
                    ? 'bg-slate-900 text-white shadow'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {size.label}
              </button>
            ))}
          </div>

          {/* Athlete Badge Toggle */}
          <button
            onClick={() => setConfig((prev) => ({ ...prev, showBadge: !prev.showBadge }))}
            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border text-[10px] font-extrabold transition-all active:scale-95 ${
              config.showBadge
                ? 'border-amber-300 bg-amber-50 text-amber-900 shadow-sm'
                : 'border-slate-200 bg-slate-50 text-slate-400'
            }`}
          >
            {config.showBadge ? (
              <Check className="w-3 h-3 text-amber-600 stroke-[3]" />
            ) : null}
            <span>Badge: {config.showBadge ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Sticky Bottom Action Button for Generating Mockup */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl z-40 safe-bottom">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
          <button
            onClick={onBackToMedia}
            className="py-3 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-bold text-xs hover:bg-slate-100 active:scale-95"
          >
            ← Media
          </button>

          <button
            onClick={handleGenerateMockup}
            disabled={isRendering}
            className="flex-1 py-3 px-5 rounded-xl bg-[#FF4800] hover:bg-[#E63E00] text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-orange-500/25 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {isRendering ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating ({renderProgress}%)...</span>
              </>
            ) : (
              <>
                <span>Next: Create Mockup</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Fullscreen Rendering Loader Overlay */}
      {isRendering && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xs w-full p-6 text-center space-y-4 shadow-2xl border border-slate-100">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-orange-100 text-[#FF4800] flex items-center justify-center shadow-inner">
              <Loader2 className="w-7 h-7 animate-spin" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Rendering Allmax Video
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

            <div className="text-[11px] font-extrabold text-[#FF4800]">
              {renderProgress}% Complete
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

ProductOverlayStudio.displayName = 'ProductOverlayStudio';
