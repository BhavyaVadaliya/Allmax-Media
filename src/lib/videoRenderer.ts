import { OverlayConfig, AllmaxProduct, RenderResult, MediaType, MediaItem } from '@/types';
import QRCode from 'qrcode';

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
  videoElement.loop = false; // MUST disable loop so playback terminates at end of video!

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

  const videoDuration = Math.min(
    videoElement.duration && !isNaN(videoElement.duration) ? videoElement.duration : 6,
    30
  );
  const outroDuration = 2.8;
  const totalDuration = videoDuration + outroDuration;

  // Pre-render high-res scannable QR code for the product/website onto an offscreen canvas
  const qrCanvas = document.createElement('canvas');
  const qrTargetUrl = product.allmaxUrl || 'https://www.allmaxnutrition.com';
  await QRCode.toCanvas(qrCanvas, qrTargetUrl, {
    width: 240,
    margin: 1,
    color: {
      dark: '#0A0D16',
      light: '#FFFFFF',
    },
    errorCorrectionLevel: 'M',
  });

  // Offscreen canvas to hold the final video frame for a smooth cross-fade into the outro
  const lastFrameCanvas = document.createElement('canvas');
  lastFrameCanvas.width = width;
  lastFrameCanvas.height = height;
  const lastFrameCtx = lastFrameCanvas.getContext('2d');
  let hasCapturedLastFrame = false;

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
    let isStopping = false;
    let safetyTimer: NodeJS.Timeout | null = null;
    let startTime = 0;

    const cleanup = () => {
      if (isCleanedUp) return;
      isCleanedUp = true;
      if (safetyTimer) clearTimeout(safetyTimer);
      cancelAnimationFrame(animationFrameId);
      videoElement.pause();
      videoElement.currentTime = 0;
      videoElement.loop = true; // Restore loop for preview
      if (tempContainer && tempContainer.parentNode) {
        tempContainer.parentNode.removeChild(tempContainer);
      }
    };

    const stopRecorderSafely = () => {
      if (isStopping) return;
      isStopping = true;
      if (safetyTimer) clearTimeout(safetyTimer);
      if (recorder.state === 'recording') {
        recorder.stop();
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
        durationSeconds: totalDuration,
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
        startTime = performance.now();

        // Guaranteed safety timeout covering video + outro duration
        safetyTimer = setTimeout(() => {
          stopRecorderSafely();
        }, (totalDuration + 1.2) * 1000);

        const renderLoop = () => {
          if (isCleanedUp) return;

          const elapsedSec = (performance.now() - startTime) / 1000;

          if (elapsedSec >= totalDuration) {
            stopRecorderSafely();
            return;
          }

          if (elapsedSec < videoDuration && !videoElement.ended) {
            // Phase 1: Main workout video + product sticker overlay
            if (videoElement.paused) {
              videoElement.play().catch(() => {});
            }

            drawFittedMedia(ctx, videoElement, width, height);
            drawOverlayElements(ctx, productImage, product, config, width, height);

            const effectiveTime = Math.max(videoElement.currentTime, elapsedSec);
            const progressPercent = Math.min(
              75,
              Math.max(25, Math.round(25 + (effectiveTime / videoDuration) * 50))
            );
            onProgress?.(
              progressPercent,
              `Rendering frame: ${effectiveTime.toFixed(1)}s / ${totalDuration.toFixed(1)}s`
            );
          } else {
            // Capture the last rendered video frame once for smooth cross-fade into outro
            if (!hasCapturedLastFrame && lastFrameCtx) {
              lastFrameCtx.drawImage(canvas, 0, 0);
              hasCapturedLastFrame = true;
              if (!videoElement.paused) {
                videoElement.pause();
              }
            }

            // Phase 2: Animated Allmax Branding + QR Outro
            const outroTime = Math.max(0, elapsedSec - videoDuration);
            drawOutroFrame({
              ctx,
              product,
              productImage,
              qrCanvas,
              outroTime,
              outroDuration,
              width,
              height,
              lastFrameCanvas: hasCapturedLastFrame ? lastFrameCanvas : null,
            });

            const outroRatio = Math.min(1, outroTime / outroDuration);
            const progressPercent = Math.min(96, Math.max(75, Math.round(75 + outroRatio * 21)));
            onProgress?.(
              progressPercent,
              `Adding Allmax QR outro animation...`
            );
          }

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

function easeOutCubic(t: number): number {
  const x = Math.max(0, Math.min(1, t));
  return 1 - Math.pow(1 - x, 3);
}

function easeOutBack(t: number): number {
  const x = Math.max(0, Math.min(1, t));
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

function drawOutroFrame({
  ctx,
  product,
  productImage,
  qrCanvas,
  outroTime,
  outroDuration,
  width,
  height,
  lastFrameCanvas,
}: {
  ctx: CanvasRenderingContext2D;
  product: AllmaxProduct;
  productImage: HTMLImageElement;
  qrCanvas: HTMLCanvasElement;
  outroTime: number;
  outroDuration: number;
  width: number;
  height: number;
  lastFrameCanvas: HTMLCanvasElement | null;
}) {
  const s = Math.min(width, height) / 720;
  const isLandscape = width > height;

  // 1. Cross-fade from last video frame into dark Allmax studio backdrop
  const bgFade = easeOutCubic(outroTime / 0.35);
  if (lastFrameCanvas && bgFade < 1) {
    ctx.drawImage(lastFrameCanvas, 0, 0, width, height);
  }

  ctx.save();
  ctx.globalAlpha = bgFade;

  // Rich dark gradient background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, '#07090F');
  bgGrad.addColorStop(0.55, '#0D121F');
  bgGrad.addColorStop(1, '#05070B');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Pulsing Allmax Persimmon Orange radial energy glow behind center
  const pulse = 0.85 + 0.15 * Math.sin(outroTime * 4.5);
  const glowRadius = Math.max(width, height) * 0.48 * pulse;
  const radialGlow = ctx.createRadialGradient(
    width / 2,
    height * 0.42,
    10,
    width / 2,
    height * 0.42,
    glowRadius
  );
  radialGlow.addColorStop(0, 'rgba(255, 72, 0, 0.28)');
  radialGlow.addColorStop(0.5, 'rgba(255, 72, 0, 0.08)');
  radialGlow.addColorStop(1, 'rgba(255, 72, 0, 0)');
  ctx.fillStyle = radialGlow;
  ctx.fillRect(0, 0, width, height);

  // Subtle animated diagonal accent streaks
  ctx.strokeStyle = 'rgba(255, 72, 0, 0.08)';
  ctx.lineWidth = 2 * s;
  const streakOffset = (outroTime * 90 * s) % (180 * s);
  for (let i = -2; i < 8; i++) {
    const xPos = i * 180 * s + streakOffset;
    ctx.beginPath();
    ctx.moveTo(xPos, 0);
    ctx.lineTo(xPos - 260 * s, height);
    ctx.stroke();
  }

  // 2. Top Allmax Brand Header (slides down 0.05s -> 0.50s)
  const brandT = easeOutCubic((outroTime - 0.05) / 0.45);
  if (brandT > 0) {
    ctx.save();
    ctx.globalAlpha = bgFade * brandT;
    const brandY = (isLandscape ? 58 : 110) * s - (1 - brandT) * 28 * s;

    // Orange AM badge + ALLMAX NUTRITION text centered
    const badgeSize = 42 * s;
    ctx.font = `900 ${Math.round(28 * s)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    const brandText = 'ALLMAX NUTRITION';
    const textW = ctx.measureText(brandText).width;
    const totalW = badgeSize + 14 * s + textW;
    const startX = width / 2 - totalW / 2;

    // Circle AM badge
    ctx.fillStyle = '#FF4800';
    ctx.beginPath();
    ctx.arc(startX + badgeSize / 2, brandY, badgeSize / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = `900 ${Math.round(17 * s)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('AM', startX + badgeSize / 2, brandY + 1 * s);

    // Brand wordmark
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `900 ${Math.round(28 * s)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText(brandText, startX + badgeSize + 14 * s, brandY + 1 * s);

    // Expanding orange underline
    const lineW = 140 * s * brandT;
    ctx.fillStyle = '#FF4800';
    roundRect(ctx, width / 2 - lineW / 2, brandY + 30 * s, lineW, 4 * s, 2 * s);
    ctx.fill();

    ctx.restore();
  }

  // Layout coordinates for Product Tub & QR Card (adapts cleanly for Portrait vs Landscape)
  const centerX = width / 2;
  const tubCenterX = isLandscape ? width * 0.3 : centerX;
  const tubCenterY = isLandscape ? height * 0.54 : height * 0.34;
  const qrCenterX = isLandscape ? width * 0.68 : centerX;
  const qrCenterY = isLandscape ? height * 0.54 : height * 0.69;

  // 3. Hero Product Tub with bounce-in & gentle float (0.18s -> 0.68s)
  const tubT = easeOutBack((outroTime - 0.18) / 0.5);
  if (tubT > 0) {
    ctx.save();
    const floatY = Math.sin(outroTime * 3.5) * 6 * s;
    const tubH = (isLandscape ? 270 : 310) * s * Math.max(0.01, tubT);
    const tubW = tubH * (400 / 520);

    ctx.globalAlpha = bgFade * Math.min(1, tubT * 1.4);
    ctx.shadowColor = product.accentColor || '#FF4800';
    ctx.shadowBlur = 32 * s;
    ctx.drawImage(
      productImage,
      tubCenterX - tubW / 2,
      tubCenterY - tubH / 2 + floatY,
      tubW,
      tubH
    );
    ctx.restore();
  }

  // 4. Product Name & Tagline (0.35s -> 0.80s)
  const titleT = easeOutCubic((outroTime - 0.35) / 0.45);
  if (titleT > 0) {
    ctx.save();
    ctx.globalAlpha = bgFade * titleT;
    const titleY = (isLandscape ? height * 0.84 : height * 0.505) + (1 - titleT) * 20 * s;

    ctx.fillStyle = '#FFFFFF';
    ctx.font = `900 ${Math.round(34 * s)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(product.name.toUpperCase(), tubCenterX, titleY);

    ctx.fillStyle = '#94A3B8';
    ctx.font = `700 ${Math.round(16 * s)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillText(product.tagline, tubCenterX, titleY + 28 * s);
    ctx.restore();
  }

  // 5. Animated QR Code Card (0.50s -> 1.00s)
  const qrT = easeOutBack((outroTime - 0.5) / 0.5);
  if (qrT > 0) {
    ctx.save();
    ctx.translate(qrCenterX, qrCenterY);
    const cardScale = Math.max(0.01, qrT);
    ctx.scale(cardScale, cardScale);
    ctx.globalAlpha = bgFade * Math.min(1, qrT * 1.5);

    const cardW = 240 * s;
    const cardH = 278 * s;

    // Card drop shadow
    ctx.shadowColor = 'rgba(255, 72, 0, 0.35)';
    ctx.shadowBlur = 28 * s;
    ctx.shadowOffsetY = 8 * s;

    ctx.fillStyle = '#FFFFFF';
    roundRect(ctx, -cardW / 2, -cardH / 2, cardW, cardH, 22 * s);
    ctx.fill();

    // Accent border
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = '#FF4800';
    ctx.lineWidth = 3 * s;
    roundRect(ctx, -cardW / 2, -cardH / 2, cardW, cardH, 22 * s);
    ctx.stroke();

    // Draw crisp QR Code
    const qrSize = 176 * s;
    const qrY = -cardH / 2 + 18 * s;
    ctx.drawImage(qrCanvas, -qrSize / 2, qrY, qrSize, qrSize);

    // Animated scanner laser line sweeping smoothly over the QR code
    const scanProgress = (Math.sin(outroTime * 4.2 - Math.PI / 2) + 1) / 2;
    const scanY = qrY + 8 * s + scanProgress * (qrSize - 16 * s);
    const scanGrad = ctx.createLinearGradient(-qrSize / 2, 0, qrSize / 2, 0);
    scanGrad.addColorStop(0, 'rgba(255, 72, 0, 0)');
    scanGrad.addColorStop(0.5, 'rgba(255, 72, 0, 0.9)');
    scanGrad.addColorStop(1, 'rgba(255, 72, 0, 0)');
    ctx.fillStyle = scanGrad;
    ctx.fillRect(-qrSize / 2, scanY, qrSize, 3 * s);

    // CTA Label inside QR card
    ctx.fillStyle = '#FF4800';
    ctx.font = `900 ${Math.round(17 * s)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SCAN TO SHOP', 0, qrY + qrSize + 24 * s);

    ctx.fillStyle = '#475569';
    ctx.font = `700 ${Math.round(12 * s)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillText('allmaxnutrition.com', 0, qrY + qrSize + 46 * s);

    ctx.restore();
  }

  // 6. Bottom Website Pill (0.75s -> end)
  const footerT = easeOutCubic((outroTime - 0.75) / 0.45);
  if (footerT > 0 && !isLandscape) {
    ctx.save();
    ctx.globalAlpha = bgFade * footerT;
    const footerY = height - 85 * s + (1 - footerT) * 20 * s;
    const pillW = 420 * s;
    const pillH = 40 * s;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    roundRect(ctx, centerX - pillW / 2, footerY - pillH / 2, pillW, pillH, 20 * s);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 72, 0, 0.45)';
    ctx.lineWidth = 1.5 * s;
    roundRect(ctx, centerX - pillW / 2, footerY - pillH / 2, pillW, pillH, 20 * s);
    ctx.stroke();

    ctx.fillStyle = '#F8FAFC';
    ctx.font = `800 ${Math.round(14 * s)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('FUEL YOUR GREATNESS  •  ALLMAXNUTRITION.COM', centerX, footerY);
    ctx.restore();
  }

  ctx.restore();
}
