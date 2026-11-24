import { OverlayConfig, AllmaxProduct, RenderResult, MediaType, MediaItem } from '@/types';

interface RenderOptions {
  mediaElement: HTMLVideoElement | HTMLImageElement;
  mediaItem?: MediaItem;
  mediaType: MediaType;
  product: AllmaxProduct;
  config: OverlayConfig;
  onProgress?: (progress: number, stepMessage: string) => void;
  aspectRatio?: '9:16' | '16:9' | '1:1';
}

export async function renderMockupMedia(options: RenderOptions): Promise<RenderResult> {
  const { mediaElement, mediaItem, mediaType, product, config, onProgress, aspectRatio = '9:16' } = options;

  let targetWidth = 720;
  let targetHeight = 1280;

  if (aspectRatio === '16:9') {
    targetWidth = 1280;
    targetHeight = 720;
  } else if (aspectRatio === '1:1') {
    targetWidth = 1080;
    targetHeight = 1080;
  }

  // Preload product SVG image for canvas drawing
  const productImage = await loadSvgImage(product.svgGraphic);

  // Wrap onProgress in a strictly monotonic updater so progress NEVER jumps backwards
  let currentMaxPercent = 0;
  const safeProgress = (percent: number, stepMessage: string) => {
    if (percent >= currentMaxPercent) {
      currentMaxPercent = percent;
      onProgress?.(percent, stepMessage);
    }
  };

  if (mediaType === 'image') {
    const result = await renderImageMockup({
      imgElement: mediaElement as HTMLImageElement,
      productImage,
      product,
      config,
      width: targetWidth,
      height: targetHeight,
      onProgress: safeProgress,
    });
    return {
      ...result,
      originalMedia: mediaItem,
      config,
      aspectRatio,
    };
  } else {
    // Client-side Canvas + MediaRecorder Compositor (Smooth, Instant, Monotonic)
    safeProgress(15, 'Preparing Allmax supplement layer...');
    safeProgress(25, 'Rendering frames with client-side video compositor...');

    const clientResult = await renderVideoMockupClient({
      videoElement: mediaElement as HTMLVideoElement,
      productImage,
      product,
      config,
      width: targetWidth,
      height: targetHeight,
      onProgress: safeProgress,
    });

    safeProgress(100, 'Allmax video mockup generated successfully!');

    return {
      ...clientResult,
      originalMedia: mediaItem,
      config,
      aspectRatio,
    };
  }
}

function loadSvgImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error('Failed to load product graphic: ' + err));
    img.src = src;
  });
}

// Generate transparent overlay PNG data URL for FFmpeg
export async function createOverlayDataUrl({
  productImage,
  product,
  config,
  width,
  height,
}: {
  productImage: HTMLImageElement;
  product: AllmaxProduct;
  config: OverlayConfig;
  width: number;
  height: number;
}): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create canvas context for overlay');

  ctx.clearRect(0, 0, width, height);
  drawOverlayElements(ctx, productImage, product, config, width, height);
  return canvas.toDataURL('image/png');
}

// Try Server-Side FFmpeg Render via API
async function tryServerFfmpegRender({
  mediaItem,
  mediaElement,
  overlayDataUrl,
  product,
  onProgress,
}: {
  mediaItem?: MediaItem;
  mediaElement: HTMLVideoElement;
  overlayDataUrl: string;
  product: AllmaxProduct;
  onProgress?: (progress: number, stepMessage: string) => void;
}): Promise<RenderResult | null> {
  const formData = new FormData();
  const filename = `Allmax_${product.name.replace(/\s+/g, '_')}_Video.mp4`;
  formData.append('filename', filename);
  formData.append('overlayPng', overlayDataUrl);

  if (mediaItem?.blob) {
    formData.append('videoFile', mediaItem.blob, mediaItem.name || 'video.mp4');
  } else if (mediaItem?.url) {
    formData.append('videoUrl', mediaItem.url);
  } else if (mediaElement.src) {
    formData.append('videoUrl', mediaElement.src);
  } else {
    return null;
  }

  onProgress?.(60, 'Processing video frames with H.264 & AAC audio sync...');
  const res = await fetch('/api/render-mockup', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`API returned ${res.status}: ${res.statusText}`);
  }

  onProgress?.(90, 'Finalizing broadcast MP4 stream...');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);

  return {
    url,
    blob,
    mediaType: 'video',
    filename,
    sizeBytes: blob.size,
    durationSeconds: mediaElement.duration || 6,
  };
}

export function drawOverlayElements(
  ctx: CanvasRenderingContext2D,
  productImage: HTMLImageElement,
  product: AllmaxProduct,
  config: OverlayConfig,
  canvasWidth: number,
  canvasHeight: number
) {
  ctx.save();

  const posX = (config.x / 100) * canvasWidth;
  const posY = (config.y / 100) * canvasHeight;

  const baseTubWidth = canvasWidth * 0.45;
  const tubWidth = baseTubWidth * config.scale;
  const tubHeight = tubWidth * (520 / 400);

  ctx.globalAlpha = Math.max(0.1, Math.min(1.0, config.opacity));

  ctx.translate(posX, posY);
  if (config.rotation !== 0) {
    ctx.rotate((config.rotation * Math.PI) / 180);
  }

  // Drop shadow
  if (config.hasDropShadow) {
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
    ctx.shadowBlur = 24 * config.scale;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 16 * config.scale;
    ctx.drawImage(productImage, -tubWidth / 2, -tubHeight / 2, tubWidth, tubHeight);
    ctx.restore();
  }

  // Ambient glow
  if (config.hasGlow) {
    ctx.save();
    ctx.shadowColor = product.accentColor;
    ctx.shadowBlur = 32 * config.scale;
    ctx.drawImage(productImage, -tubWidth / 2, -tubHeight / 2, tubWidth, tubHeight);
    ctx.restore();
  }

  // Main product graphic
  ctx.drawImage(productImage, -tubWidth / 2, -tubHeight / 2, tubWidth, tubHeight);

  // Sticker / Badge
  if (config.showBadge && config.badgeText) {
    ctx.save();
    const badgeText = config.badgeText;
    const badgeFontSize = Math.max(12, Math.round(14 * config.scale * 1.5));
    ctx.font = `bold ${badgeFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;

    const textMetrics = ctx.measureText(badgeText);
    const badgePaddingX = 14 * config.scale;
    const badgePaddingY = 7 * config.scale;
    const badgeW = textMetrics.width + badgePaddingX * 2;
    const badgeH = badgeFontSize + badgePaddingY * 2;
    const badgeY = tubHeight / 2 + 8;

    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;

    ctx.fillStyle = '#0a0d16';
    roundRect(ctx, -badgeW / 2, badgeY, badgeW, badgeH, 8);
    ctx.fill();

    ctx.strokeStyle = product.accentColor;
    ctx.lineWidth = 1.5;
    roundRect(ctx, -badgeW / 2, badgeY, badgeW, badgeH, 8);
    ctx.stroke();

    ctx.shadowColor = 'transparent';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(badgeText, 0, badgeY + badgeH / 2);

    ctx.restore();
  }

  // Call-To-Action Banner
  if (config.showCta && config.ctaText) {
    ctx.save();
    const ctaText = config.ctaText;
    const ctaFontSize = Math.max(11, Math.round(12 * config.scale * 1.4));
    ctx.font = `600 ${ctaFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;

    const textMetrics = ctx.measureText(ctaText);
    const ctaW = textMetrics.width + 20 * config.scale;
    const ctaH = ctaFontSize + 12 * config.scale;
    const ctaY = -tubHeight / 2 - ctaH - 8;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    roundRect(ctx, -ctaW / 2, ctaY, ctaW, ctaH, 6);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    roundRect(ctx, -ctaW / 2, ctaY, ctaW, ctaH, 6);
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ctaText, 0, ctaY + ctaH / 2);

    ctx.restore();
  }

  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function drawFittedMedia(
  ctx: CanvasRenderingContext2D,
  media: HTMLVideoElement | HTMLImageElement,
  canvasWidth: number,
  canvasHeight: number
) {
  const mediaW = 'videoWidth' in media ? media.videoWidth : media.naturalWidth;
  const mediaH = 'videoHeight' in media ? media.videoHeight : media.naturalHeight;

  if (!mediaW || !mediaH) {
    ctx.fillStyle = '#06090F';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    return;
  }

  const mediaRatio = mediaW / mediaH;
  const canvasRatio = canvasWidth / canvasHeight;

  let renderW: number;
  let renderH: number;
  let offsetX: number;
  let offsetY: number;

  if (mediaRatio > canvasRatio) {
    renderH = canvasHeight;
    renderW = canvasHeight * mediaRatio;
    offsetX = (canvasWidth - renderW) / 2;
    offsetY = 0;
  } else {
    renderW = canvasWidth;
    renderH = canvasWidth / mediaRatio;
    offsetX = 0;
    offsetY = (canvasHeight - renderH) / 2;
  }

  ctx.drawImage(media, offsetX, offsetY, renderW, renderH);

  // Subtle vignette
  const gradient = ctx.createLinearGradient(0, canvasHeight * 0.7, 0, canvasHeight);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, canvasHeight * 0.7, canvasWidth, canvasHeight * 0.3);
}

// Client-Side Image Render
async function renderImageMockup({
  imgElement,
  productImage,
  product,
  config,
  width,
  height,
  onProgress,
}: {
  imgElement: HTMLImageElement;
  productImage: HTMLImageElement;
  product: AllmaxProduct;
  config: OverlayConfig;
  width: number;
  height: number;
  onProgress?: (progress: number, step: string) => void;
}): Promise<RenderResult> {
  onProgress?.(30, 'Compositing image layers...');
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not initialize 2D canvas context');

  drawFittedMedia(ctx, imgElement, width, height);
  drawOverlayElements(ctx, productImage, product, config, width, height);

  onProgress?.(85, 'Encoding high-resolution PNG...');

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to create image blob'));
          return;
        }
        onProgress?.(100, 'Mockup ready!');
        const url = URL.createObjectURL(blob);
        resolve({
          url,
          blob,
          mediaType: 'image',
          filename: `Allmax_${product.name.replace(/\s+/g, '_')}_Mockup.png`,
          sizeBytes: blob.size,
        });
      },
      'image/png',
      0.95
    );
  });
}

// Client-Side Video Fallback Render
async function renderVideoMockupClient({
  videoElement,
  productImage,
  product,
  config,
  width,
  height,
  onProgress,
}: {
  videoElement: HTMLVideoElement;
  productImage: HTMLImageElement;
  product: AllmaxProduct;
  config: OverlayConfig;
  width: number;
  height: number;
  onProgress?: (progress: number, step: string) => void;
}): Promise<RenderResult> {
  // Ensure video element is connected to DOM to avoid browser throttling
  let tempContainer: HTMLDivElement | null = null;
  if (!videoElement.isConnected) {
    tempContainer = document.createElement('div');
    tempContainer.style.position = 'fixed';
    tempContainer.style.top = '-9999px';
    tempContainer.style.left = '-9999px';
    tempContainer.style.width = '300px';
    tempContainer.style.height = '300px';
    tempContainer.style.opacity = '0';
    tempContainer.style.pointerEvents = 'none';
    tempContainer.appendChild(videoElement);
    document.body.appendChild(tempContainer);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not initialize 2D canvas context');

  videoElement.currentTime = 0;
  videoElement.muted = true;
  videoElement.playsInline = true;

  if (videoElement.readyState < 2) {
    await new Promise<void>((resolve) => {
      const onReady = () => {
        videoElement.removeEventListener('loadeddata', onReady);
        resolve();
      };
      videoElement.addEventListener('loadeddata', onReady);
      setTimeout(resolve, 3000);
    });
  }

  const duration = Math.min(
    videoElement.duration && !isNaN(videoElement.duration) ? videoElement.duration : 6,
    30
  );

  const canvasStream = canvas.captureStream(30);

  const mimeTypes = [
    'video/mp4',
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ];
  const mimeType = mimeTypes.find((type) => MediaRecorder.isTypeSupported(type)) || 'video/webm';

  const recorder = new MediaRecorder(canvasStream, {
    mimeType,
    videoBitsPerSecond: 4_000_000,
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  return new Promise((resolve, reject) => {
    let animationFrameId: number;
    let isCleanedUp = false;

    const cleanup = () => {
      if (isCleanedUp) return;
      isCleanedUp = true;
      cancelAnimationFrame(animationFrameId);
      videoElement.pause();
      videoElement.currentTime = 0;
      if (tempContainer && tempContainer.parentNode) {
        tempContainer.parentNode.removeChild(tempContainer);
      }
    };

    recorder.onstop = () => {
      cleanup();
      onProgress?.(98, 'Finalizing high-definition video file...');
      const blob = new Blob(chunks, { type: mimeType });
      const url = URL.createObjectURL(blob);
      const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
      resolve({
        url,
        blob,
        mediaType: 'video',
        filename: `Allmax_${product.name.replace(/\s+/g, '_')}_Video.${ext}`,
        sizeBytes: blob.size,
        durationSeconds: duration,
      });
    };

    recorder.onerror = (e) => {
      cleanup();
      reject(new Error('MediaRecorder error: ' + e));
    };

    // Play video and start recorder only once playback actively begins!
    videoElement
      .play()
      .then(() => {
        recorder.start(100);

        const renderLoop = () => {
          if (isCleanedUp) return;

          if (videoElement.ended || videoElement.currentTime >= duration) {
            recorder.stop();
            return;
          }

          if (videoElement.paused && !videoElement.ended) {
            videoElement.play().catch(() => {});
          }

          drawFittedMedia(ctx, videoElement, width, height);
          drawOverlayElements(ctx, productImage, product, config, width, height);

          const progressPercent = Math.min(
            95,
            Math.max(25, Math.round(25 + (videoElement.currentTime / duration) * 70))
          );
          onProgress?.(
            progressPercent,
            `Rendering frame: ${videoElement.currentTime.toFixed(1)}s / ${duration.toFixed(1)}s`
          );

          animationFrameId = requestAnimationFrame(renderLoop);
        };

        animationFrameId = requestAnimationFrame(renderLoop);
      })
      .catch((err) => {
        cleanup();
        reject(new Error('Could not start video playback for rendering: ' + err.message));
      });
  });
}
