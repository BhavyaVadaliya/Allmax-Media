'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  Video,
  Square,
  AlertCircle,
  Check,
  RefreshCw,
  FolderOpen,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Image as ImageIcon,
  ChevronLeft,
  Search,
  TrendingUp,
  Tv,
  Mic,
} from 'lucide-react';
import { AllmaxProduct, MediaItem, SearchIntentHook } from '@/types';
import { ALLMAX_PRODUCTS, SAMPLE_CREATOR_MEDIA } from '@/data/allmaxProducts';
import { getSearchHooksForProduct } from '@/data/searchHooks';

interface MediaCaptureStepProps {
  onMediaSelected: (media: MediaItem | null) => void;
  selectedMedia: MediaItem | null;
  selectedProduct: AllmaxProduct;
  onSelectProduct: (product: AllmaxProduct) => void;
  selectedHook: SearchIntentHook | null;
  onSelectHook: (hook: SearchIntentHook) => void;
  promoCode?: string;
  onProceedToStudio: () => void;
  onGoHome?: () => void;
}

export const MediaCaptureStep: React.FC<MediaCaptureStepProps> = ({
  onMediaSelected,
  selectedMedia,
  selectedProduct,
  onSelectProduct,
  selectedHook,
  onSelectHook,
  promoCode = 'ALEX15 • 20% OFF',
  onProceedToStudio,
  onGoHome,
}) => {
  // Sub-step state within Step 1 (Create): 1 = SKU, 2 = Hook, 3 = Clip
  const [subStep, setSubStep] = useState<1 | 2 | 3>(selectedMedia ? 3 : 1);

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [demoTab, setDemoTab] = useState<'video' | 'image'>('video');

  const demoVideos = SAMPLE_CREATOR_MEDIA.filter((item) => item.type === 'video');
  const demoImages = SAMPLE_CREATOR_MEDIA.filter((item) => item.type === 'image');

  const hooks = getSearchHooksForProduct(selectedProduct, promoCode);
  const activeHook =
    (selectedHook && hooks.find((h) => h.id === selectedHook.id)) || hooks[0];

  // Keep parent synced with default hook whenever product changes
  useEffect(() => {
    if (!selectedHook || !hooks.some((h) => h.id === selectedHook.id)) {
      onSelectHook(hooks[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProduct.id]);

  const liveCameraRef = useRef<HTMLVideoElement | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const stopCameraStream = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setShowCamera(false);
    setIsRecording(false);
    setRecordingSeconds(0);
  }, []);

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, [stopCameraStream]);

  const startCamera = async () => {
    setCameraError(null);
    stopCameraStream();
    setShowCamera(true);

    try {
      const constraints: MediaStreamConstraints = {
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: true,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;

      if (liveCameraRef.current) {
        liveCameraRef.current.srcObject = stream;
        liveCameraRef.current.play();
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError(
        'Camera access denied. Please allow camera permissions or choose from gallery.'
      );
    }
  };

  const startRecording = () => {
    if (!mediaStreamRef.current) return;
    recordedChunksRef.current = [];
    const mimeTypes = ['video/webm;codecs=vp8', 'video/webm', 'video/mp4'];
    const mimeType = mimeTypes.find((t) => MediaRecorder.isTypeSupported(t)) || 'video/webm';

    try {
      const recorder = new MediaRecorder(mediaStreamRef.current, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const recordedMedia: MediaItem = {
          id: 'recorded-' + Date.now(),
          type: 'video',
          sourceType: 'camera',
          url,
          blob,
          name: 'Camera_Clip.mp4',
          duration: recordingSeconds,
        };
        onMediaSelected(recordedMedia);
        stopCameraStream();
      };

      recorder.start(100);
      setIsRecording(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Recording error:', err);
      setCameraError('Could not start recording. Please upload a video file instead.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    if (!isVideo && !isImage) {
      alert('Please select a valid video (MP4/MOV/WebM) or image (JPG/PNG) file.');
      return;
    }

    const url = URL.createObjectURL(file);
    const media: MediaItem = {
      id: 'upload-' + Date.now(),
      type: isVideo ? 'video' : 'image',
      sourceType: 'upload',
      url,
      blob: file,
      name: file.name,
      fileSize: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
    };
    onMediaSelected(media);
    e.target.value = '';
  };

  const togglePlay = () => {
    if (!previewVideoRef.current) return;
    if (isPlaying) {
      previewVideoRef.current.pause();
      setIsPlaying(false);
    } else {
      previewVideoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSubBack = () => {
    if (showCamera) {
      stopCameraStream();
      return;
    }
    if (subStep === 3) {
      setSubStep(2);
    } else if (subStep === 2) {
      setSubStep(1);
    } else if (onGoHome) {
      onGoHome();
    }
  };

  // Helper to render teleprompter script with highlighted spec phrase
  const renderHighlightedScript = (hook: SearchIntentHook) => {
    if (!hook.highlightPhrase || !hook.script.includes(hook.highlightPhrase)) {
      return `"${hook.script}"`;
    }
    const parts = hook.script.split(hook.highlightPhrase);
    return (
      <>
        &ldquo;{parts[0]}
        <span className="text-[#FF4800] font-black">{hook.highlightPhrase}</span>
        {parts.slice(1).join(hook.highlightPhrase)}&rdquo;
      </>
    );
  };

  const subStepTitle =
    subStep === 1
      ? 'SUB-STEP 1.1 (CREATE 1/3): PRODUCT SKU'
      : subStep === 2
      ? 'SUB-STEP 1.2 (CREATE 2/3): SEARCH HOOK'
      : 'SUB-STEP 1.3 (CREATE 3/3): RECORD / CLIP';

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC] overflow-hidden select-none">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*,image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Top 3-Step Pill Bar + Sub-Step Bar */}
      <div className="shrink-0 bg-white border-b border-slate-200 px-3 pt-2 pb-2 space-y-2">
        <div className="grid grid-cols-3 gap-1.5">
          <div className="py-1.5 px-2 rounded-xl bg-[#FF4800] text-white text-[11px] font-black text-center shadow-sm shadow-orange-500/20">
            Step 1: Create
          </div>
          <div className="py-1.5 px-2 rounded-xl bg-slate-100 text-slate-400 text-[11px] font-bold text-center border border-slate-200/70">
            Step 2: Package
          </div>
          <div className="py-1.5 px-2 rounded-xl bg-slate-100 text-slate-400 text-[11px] font-bold text-center border border-slate-200/70">
            Step 3: Post
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] font-black tracking-wider">
          <button
            onClick={handleSubBack}
            className="flex items-center space-x-0.5 text-slate-600 hover:text-slate-900 active:scale-95 py-0.5"
          >
            <ChevronLeft className="w-3.5 h-3.5 stroke-[3]" />
            <span>Back</span>
          </button>

          <span className="text-slate-500 uppercase truncate px-2">{subStepTitle}</span>

          <span className="text-[#FF4800] uppercase shrink-0">{selectedProduct.shortName}</span>
        </div>
      </div>

      {/* ================================================================= */}
      {/* SUB-STEP 1.1: SELECT ALLMAX PRODUCT SKU                           */}
      {/* ================================================================= */}
      {subStep === 1 && (
        <div className="flex-1 min-h-0 flex flex-col justify-between overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none p-3.5 space-y-3">
            <div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Select Allmax Product SKU
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Tap the supplement you are featuring to load verified packaging &amp; scripts.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pb-2">
              {ALLMAX_PRODUCTS.map((product) => {
                const isSelected = selectedProduct.id === product.id;
                return (
                  <button
                    key={product.id}
                    onClick={() => onSelectProduct(product)}
                    className={`text-left rounded-2xl p-3 transition-all active:scale-[0.98] flex flex-col justify-between border-2 ${
                      isSelected
                        ? 'bg-orange-50/60 border-[#FF4800] shadow-md shadow-orange-500/10'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                    }`}
                  >
                    {/* Top Row: Spec Pill & Checkmark */}
                    <div className="flex items-center justify-between gap-1 w-full">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200/80 text-[9px] font-black text-slate-700 uppercase truncate">
                        {product.specs[0]?.value || product.category}
                      </span>

                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                          isSelected
                            ? 'bg-[#FF4800] border-[#FF4800] text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </span>
                    </div>

                    {/* Product Tub Graphic */}
                    <div className="my-2.5 flex items-center justify-center h-24">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.svgGraphic}
                        alt={product.name}
                        className="h-full w-auto object-contain drop-shadow-md"
                      />
                    </div>

                    {/* Name & Tagline */}
                    <div>
                      <p className="text-xs font-black text-slate-900 uppercase tracking-tight truncate">
                        {product.shortName}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">
                        {product.tagline}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Docked CTA */}
          <div className="shrink-0 p-3 bg-white border-t border-slate-200 safe-bottom">
            <button
              onClick={() => setSubStep(2)}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#FF4800] hover:bg-[#E63E00] text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-orange-500/25 transition-all active:scale-95 flex items-center justify-center space-x-1.5"
            >
              <span>NEXT: SELECT SEARCH HOOK</span>
              <span className="text-base font-bold">→</span>
            </button>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* SUB-STEP 1.2: SELECT SEARCH-INTENT HOOK                           */}
      {/* ================================================================= */}
      {subStep === 2 && (
        <div className="flex-1 min-h-0 flex flex-col justify-between overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none p-3.5 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight">
                  Select Search-Intent Hook
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Compliance-checked hooks for{' '}
                  <strong className="text-slate-800">{selectedProduct.shortName}</strong>
                </p>
              </div>

              <span className="shrink-0 inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-sky-50 border border-sky-200 text-[10px] font-bold text-sky-700">
                <TrendingUp className="w-3 h-3" />
                <span>AI Search &amp; GEO Signal</span>
              </span>
            </div>

            <div className="space-y-2.5 pb-2">
              {hooks.map((hook) => {
                const isSelected = activeHook.id === hook.id;
                return (
                  <button
                    key={hook.id}
                    onClick={() => onSelectHook(hook)}
                    className={`w-full text-left rounded-2xl p-3.5 transition-all active:scale-[0.99] border-2 space-y-2 ${
                      isSelected
                        ? 'bg-orange-50/50 border-[#FF4800] shadow-md shadow-orange-500/10'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                    }`}
                  >
                    {/* Query Row */}
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-black text-sky-600 uppercase tracking-wide flex items-start gap-1 leading-snug">
                        <Search className="w-3 h-3 shrink-0 mt-0.5" />
                        <span>QUERY: &ldquo;{hook.query}&rdquo;</span>
                      </span>

                      {isSelected ? (
                        <span className="shrink-0 px-2 py-0.5 rounded-md bg-[#FF4800] text-white text-[9px] font-black uppercase tracking-wider">
                          SELECTED
                        </span>
                      ) : (
                        <span className="shrink-0 text-[10px] font-bold text-slate-400">
                          Select
                        </span>
                      )}
                    </div>

                    {/* Hook Title */}
                    <h3 className="text-sm font-black text-slate-900 tracking-tight">
                      {hook.title}
                    </h3>

                    {/* Teleprompter Script Preview Box */}
                    <div className="rounded-xl bg-[#F8FAFC] border border-slate-200/80 p-2.5 text-xs text-slate-700 leading-relaxed font-medium">
                      &ldquo;{hook.script}&rdquo;
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Docked CTA */}
          <div className="shrink-0 p-3 bg-white border-t border-slate-200 safe-bottom">
            <button
              onClick={() => setSubStep(3)}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#FF4800] hover:bg-[#E63E00] text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-orange-500/25 transition-all active:scale-95 flex items-center justify-center space-x-1.5"
            >
              <span>NEXT: RECORD OR CHOOSE CLIP</span>
              <span className="text-base font-bold">→</span>
            </button>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* SUB-STEP 1.3: RECORD, UPLOAD OR DEMO CLIP (WITH TELEPROMPTER)     */}
      {/* ================================================================= */}
      {subStep === 3 && (
        <>
          {showCamera ? (
            /* Live Camera Recording with Eye-Level Teleprompter Overlay */
            <div className="flex-1 min-h-0 flex flex-col justify-between p-3 overflow-hidden">
              <div className="relative flex-1 min-h-0 bg-black rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
                <video
                  ref={liveCameraRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />

                {/* Eye-Level Teleprompter Floating at Top of Camera */}
                <div className="absolute top-3 left-3 right-3 z-20 rounded-2xl bg-black/75 backdrop-blur-md border border-white/20 p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-[#FF4800] text-white text-[9px] font-black uppercase tracking-wider">
                      <Tv className="w-3 h-3" />
                      <span>EYE-LEVEL TELEPROMPTER</span>
                    </span>
                    <span className="text-[10px] font-black text-white/80 uppercase">
                      {selectedProduct.shortName}
                    </span>
                  </div>
                  <p className="text-xs text-white leading-relaxed font-semibold">
                    {renderHighlightedScript(activeHook)}
                  </p>
                </div>

                {/* Recording Timer Pill */}
                {isRecording && (
                  <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-1.5 bg-red-600/95 px-3 py-1 rounded-full text-xs text-white font-bold shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    <span>REC 00:{String(recordingSeconds).padStart(2, '0')}</span>
                  </div>
                )}

                {/* Bottom Controls */}
                <div className="absolute bottom-4 left-0 right-0 z-20 flex items-center justify-center space-x-6">
                  <button
                    onClick={stopCameraStream}
                    className="px-4 py-2 rounded-full bg-black/65 backdrop-blur-md text-white text-xs font-bold border border-white/20"
                  >
                    Cancel
                  </button>

                  {!isRecording ? (
                    <button
                      onClick={startRecording}
                      className="w-16 h-16 rounded-full bg-white p-1 shadow-xl active:scale-95 transition-transform flex items-center justify-center"
                    >
                      <div className="w-full h-full rounded-full bg-[#FF4800] border-2 border-white flex items-center justify-center">
                        <Video className="w-6 h-6 text-white" />
                      </div>
                    </button>
                  ) : (
                    <button
                      onClick={stopRecording}
                      className="w-16 h-16 rounded-full bg-white p-1 shadow-xl active:scale-95 transition-transform flex items-center justify-center"
                    >
                      <div className="w-full h-full rounded-full bg-red-600 flex items-center justify-center">
                        <Square className="w-6 h-6 text-white fill-white" />
                      </div>
                    </button>
                  )}

                  <div className="w-16" />
                </div>

                {cameraError && (
                  <div className="absolute inset-0 z-30 bg-black/85 p-6 flex flex-col items-center justify-center text-center space-y-3">
                    <AlertCircle className="w-10 h-10 text-red-500" />
                    <p className="text-xs text-white/90">{cameraError}</p>
                    <button
                      onClick={() => setShowCamera(false)}
                      className="px-4 py-2 bg-white text-slate-900 rounded-xl text-xs font-bold"
                    >
                      Back
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : !selectedMedia ? (
            /* Choose Record, Upload or Demo Media (with Teleprompter Card) */
            <div className="flex-1 min-h-0 flex flex-col justify-between p-3 overflow-y-auto scrollbar-none space-y-3">
              {/* Eye-Level Teleprompter Card */}
              <div className="rounded-2xl bg-white border border-slate-200 p-3.5 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-[#FF4800] text-white text-[10px] font-black uppercase tracking-wider">
                    <Tv className="w-3 h-3" />
                    <span>EYE-LEVEL TELEPROMPTER</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[10px] font-black text-slate-700 uppercase">
                    {selectedProduct.shortName}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-semibold">
                  {renderHighlightedScript(activeHook)}
                </p>

                <div className="flex items-center space-x-1.5 text-[11px] font-bold text-slate-500 pt-0.5">
                  <Mic className="w-3.5 h-3.5 text-[#FF4800]" />
                  <span>Read script above while recording, upload a clip, or use a demo take</span>
                </div>
              </div>

              {/* Primary Record & Upload Buttons */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={startCamera}
                  className="flex items-center justify-center space-x-2 py-3.5 px-3 rounded-2xl bg-[#FF4800] hover:bg-[#E63E00] active:scale-95 transition-all text-xs font-black text-white shadow-md shadow-orange-500/25"
                >
                  <Camera className="w-4 h-4" />
                  <span>Record Video</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center space-x-2 py-3.5 px-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 transition-all text-xs font-black text-slate-800 shadow-sm"
                >
                  <FolderOpen className="w-4 h-4 text-[#FF4800]" />
                  <span>Upload Gallery</span>
                </button>
              </div>

              {/* Separate 1-Tap Demo Videos & Demo Images Section */}
              <div className="space-y-2 flex-1 min-h-0 flex flex-col justify-end">
                <div className="flex items-center justify-between px-0.5">
                  <span className="text-xs font-black text-slate-900">
                    Or Try 1-Tap Demo Media
                  </span>

                  <div className="inline-flex rounded-xl bg-slate-100 p-0.5 border border-slate-200">
                    <button
                      onClick={() => setDemoTab('video')}
                      className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                        demoTab === 'video'
                          ? 'bg-[#FF4800] text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Video className="w-3 h-3" />
                      <span>Videos ({demoVideos.length})</span>
                    </button>
                    <button
                      onClick={() => setDemoTab('image')}
                      className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                        demoTab === 'image'
                          ? 'bg-[#FF4800] text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <ImageIcon className="w-3 h-3" />
                      <span>Images ({demoImages.length})</span>
                    </button>
                  </div>
                </div>

                <div className="flex space-x-2 overflow-x-auto scrollbar-none pb-1">
                  {(demoTab === 'video' ? demoVideos : demoImages).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => onMediaSelected(item)}
                      className="relative w-[30%] shrink-0 aspect-[9/14] rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-sm group active:scale-95 transition-transform"
                    >
                      {item.thumbnail ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={item.thumbnail}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <video
                          src={item.url}
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      )}

                      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center">
                        {item.type === 'video' ? (
                          <Play className="w-2.5 h-2.5 text-white fill-white" />
                        ) : (
                          <ImageIcon className="w-2.5 h-2.5 text-white" />
                        )}
                      </div>

                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex items-end p-1.5">
                        <span className="text-[9px] font-black text-white leading-tight line-clamp-2 text-left">
                          {item.name}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Media Selected State */
            <div className="flex-1 min-h-0 flex flex-col justify-between overflow-hidden">
              <div className="flex-1 min-h-0 relative flex items-center justify-center p-2">
                <div className="relative h-full aspect-[9/16] max-h-[65vh] bg-black rounded-3xl overflow-hidden shadow-2xl border border-slate-200 w-full">
                  {selectedMedia.type === 'video' ? (
                    <video
                      key={selectedMedia.url}
                      ref={previewVideoRef}
                      src={selectedMedia.url}
                      autoPlay
                      loop
                      muted={isMuted}
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={selectedMedia.url}
                      alt="Selected Media"
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* Floating Top Left: Pause / Play & Mute / Unmute */}
                  <div className="absolute top-3.5 left-3.5 z-30 flex items-center space-x-2">
                    {selectedMedia.type === 'video' && (
                      <button
                        onClick={togglePlay}
                        className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center border border-white/20 active:scale-90 transition-transform shadow-lg"
                        title={isPlaying ? 'Pause' : 'Play'}
                      >
                        {isPlaying ? (
                          <Pause className="w-3.5 h-3.5" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-white" />
                        )}
                      </button>
                    )}

                    {selectedMedia.type === 'video' && (
                      <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center border border-white/20 active:scale-90 transition-transform shadow-lg"
                        title={isMuted ? 'Unmute' : 'Mute'}
                      >
                        {isMuted ? (
                          <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Floating Top Right: Selected Badge */}
                  <div className="absolute top-3.5 right-3.5 z-30 bg-black/65 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[11px] text-white font-extrabold flex items-center space-x-1.5 border border-white/20 shadow-lg">
                    <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                    <span>Selected</span>
                  </div>
                </div>
              </div>

              {/* Clean Bottom Tray */}
              <div className="bg-white border-t border-slate-200 p-3 sm:p-4 shadow-xl safe-bottom space-y-2.5 rounded-t-3xl">
                <div className="flex justify-center">
                  <button
                    onClick={() => onMediaSelected(null)}
                    className="px-5 py-2 rounded-full bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200 shadow-sm hover:bg-slate-200 active:scale-95 transition-all flex items-center space-x-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#FF4800]" />
                    <span>{selectedMedia.type === 'video' ? 'Replace Video' : 'Replace Image'}</span>
                  </button>
                </div>

                <button
                  onClick={onProceedToStudio}
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#FF4800] hover:bg-[#E63E00] text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-orange-500/25 transition-all active:scale-95 flex items-center justify-center space-x-1.5"
                >
                  <span>NEXT: PACKAGE (STEP 2)</span>
                  <span className="text-base font-bold">→</span>
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
