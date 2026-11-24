'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload,
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
  ArrowRight,
  Film,
} from 'lucide-react';
import { MediaItem } from '@/types';
import { SAMPLE_CREATOR_MEDIA } from '@/data/allmaxProducts';

interface MediaCaptureStepProps {
  onMediaSelected: (media: MediaItem | null) => void;
  selectedMedia: MediaItem | null;
  onProceedToStudio: () => void;
}

export const MediaCaptureStep: React.FC<MediaCaptureStepProps> = ({
  onMediaSelected,
  selectedMedia,
  onProceedToStudio,
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

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
      setCameraError('Camera access denied. Please allow camera permissions or choose from gallery.');
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
    } catch (e: any) {
      console.error('Recording error:', e);
      setCameraError('Recording failed: ' + e.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isVideo && !isImage) {
      alert('Please upload a video (.mp4, .mov, .webm) or an image.');
      return;
    }

    const url = URL.createObjectURL(file);
    const newMedia: MediaItem = {
      id: 'upload-' + Date.now(),
      type: isVideo ? 'video' : 'image',
      sourceType: 'upload',
      url,
      blob: file,
      name: file.name,
      fileSize: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
    };

    onMediaSelected(newMedia);
    setShowCamera(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
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

  return (
    <div className="h-full flex flex-col justify-between overflow-hidden select-none">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*,image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Camera Fullscreen Overlay */}
      {showCamera ? (
        <div className="flex-1 min-h-0 relative flex items-center justify-center p-2">
          <div className="relative h-full aspect-[9/16] max-h-[58vh] bg-black rounded-3xl overflow-hidden shadow-2xl border-2 border-slate-700 flex flex-col justify-between w-full">
            <video
              ref={liveCameraRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Top Bar */}
            <div className="relative z-20 p-3 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent">
              <span className="text-xs font-black text-white uppercase tracking-wider flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span>Live Camera</span>
              </span>
              <button
                onClick={stopCameraStream}
                className="text-xs font-bold text-white/90 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full hover:bg-white/30"
              >
                Close
              </button>
            </div>

            {/* Record Trigger */}
            <div className="relative z-20 p-4 flex flex-col items-center justify-center bg-gradient-to-t from-black/80 to-transparent">
              {isRecording ? (
                <div className="flex flex-col items-center space-y-2">
                  <span className="text-sm font-black text-red-500 bg-black/70 px-3 py-0.5 rounded-full animate-pulse">
                    00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}
                  </span>
                  <button
                    onClick={stopRecording}
                    className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center bg-red-600 active:scale-95 transition-transform shadow-lg"
                  >
                    <Square className="w-7 h-7 fill-white text-white" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={startRecording}
                  className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center bg-white/30 backdrop-blur-md hover:bg-white/50 active:scale-95 transition-transform shadow-lg"
                >
                  <div className="w-12 h-12 rounded-full bg-red-600" />
                </button>
              )}
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
        /* ============================================================== */
        /* PHONE 1: INITIAL STATE (Select or Record Workout Video)         */
        /* ============================================================== */
        <div className="flex-1 min-h-0 flex flex-col justify-between p-3 overflow-hidden">
          {/* Big Dashed Card */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 min-h-0 border-2 border-dashed border-slate-300 rounded-3xl bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:border-[#FF4800] transition-colors max-h-[46vh] my-auto"
          >
            {/* Orange Video Camera Icon Badge */}
            <div className="w-16 h-16 rounded-2xl bg-[#FF4800] text-white flex items-center justify-center shadow-lg shadow-orange-500/30 mb-3">
              <Film className="w-8 h-8" />
            </div>

            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Select or Record Workout Video
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-1">
              9:16 Vertical Reel • MP4 / MOV
            </p>
          </div>

          {/* Action Row: From Gallery & Record Camera */}
          <div className="grid grid-cols-2 gap-2.5 my-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center space-x-2 py-3 px-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 transition-all text-xs font-black text-slate-800 shadow-sm"
            >
              <FolderOpen className="w-4 h-4 text-[#FF4800]" />
              <span>From Gallery</span>
            </button>

            <button
              onClick={startCamera}
              className="flex items-center justify-center space-x-2 py-3 px-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 transition-all text-xs font-black text-slate-800 shadow-sm"
            >
              <Camera className="w-4 h-4 text-[#FF4800]" />
              <span>Record Camera</span>
            </button>
          </div>

          {/* Or Try 1-Tap Demo Clips Section */}
          <div className="space-y-2">
            <span className="text-xs font-black text-slate-900 block px-0.5">
              Or Try 1-Tap Demo Clips
            </span>

            <div className="grid grid-cols-3 gap-2">
              {SAMPLE_CREATOR_MEDIA.slice(0, 3).map((item) => (
                <button
                  key={item.id}
                  onClick={() => onMediaSelected(item)}
                  className="relative aspect-[9/14] rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-sm group active:scale-95 transition-transform"
                >
                  {/* Thumbnail / Video */}
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

                  {/* Dark gradient overlay + Label */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex items-end p-1.5">
                    <span className="text-[9px] font-black text-white leading-tight line-clamp-2 text-left">
                      {item.name.replace(' Workout', '').replace(' Heavy Session', '')}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Disabled Pill Button (Matches Phone 1 DISABLE CTA) */}
          <div className="pt-3 pb-1">
            <button
              disabled
              className="w-full py-3 px-4 rounded-xl bg-slate-200 text-slate-400 font-black text-xs uppercase tracking-wider cursor-not-allowed"
            >
              DISABLE CTA
            </button>
          </div>
        </div>
      ) : (
        /* ============================================================== */
        /* PHONE 2: MEDIA SELECTED STATE                                  */
        /* ============================================================== */
        <div className="h-full flex flex-col justify-between overflow-hidden">
          {/* Main Large Video Preview (Occupies upper viewport) */}
          <div className="flex-1 min-h-0 relative flex items-center justify-center p-1 sm:p-2">
            <div className="relative h-full aspect-[9/16] max-h-[58vh] bg-black rounded-3xl overflow-hidden shadow-2xl border border-slate-200 w-full">
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
              <div className="absolute top-3 left-3 z-30 flex items-center space-x-2">
                {selectedMedia.type === 'video' && (
                  <button
                    onClick={togglePlay}
                    className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center border border-white/20 active:scale-90 transition-transform shadow-lg"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                  </button>
                )}

                {selectedMedia.type === 'video' && (
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center border border-white/20 active:scale-90 transition-transform shadow-lg"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                )}
              </div>

              {/* Floating Top Right: Selected Badge */}
              <div className="absolute top-3 right-3 z-30 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-white font-extrabold flex items-center space-x-1.5 border border-white/20 shadow-lg">
                <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                <span>Selected</span>
              </div>

              {/* Floating Bottom Center: Replace Media Button */}
              <div className="absolute bottom-3 left-0 right-0 z-30 flex justify-center">
                <button
                  onClick={() => onMediaSelected(null)}
                  className="px-4 py-1.5 rounded-full bg-black/70 backdrop-blur-md text-white text-[11px] font-bold border border-white/25 hover:bg-black/90 active:scale-95 transition-all flex items-center space-x-1.5 shadow-xl"
                >
                  <RefreshCw className="w-3 h-3 text-orange-400" />
                  <span>Replace Media</span>
                </button>
              </div>
            </div>
          </div>

          {/* Docked Bottom Tray (Matches Phone 2 bottom section) */}
          <div className="bg-white border-t border-slate-200 p-2.5 sm:p-3 shadow-2xl safe-bottom space-y-2">
            {/* Row 1: Gallery & Camera buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center space-x-2 py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 transition-all text-xs font-black text-slate-800 shadow-sm"
              >
                <FolderOpen className="w-3.5 h-3.5 text-[#FF4800]" />
                <span>From Gallery</span>
              </button>

              <button
                onClick={startCamera}
                className="flex items-center justify-center space-x-2 py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 transition-all text-xs font-black text-slate-800 shadow-sm"
              >
                <Camera className="w-3.5 h-3.5 text-[#FF4800]" />
                <span>Record Camera</span>
              </button>
            </div>

            {/* Row 2: Demo Workout Clips Carousel */}
            <div>
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1 px-1">
                <span>Or Choose Demo Workout Clips:</span>
                <span className="text-[#FF4800] font-black">1-Tap Ready</span>
              </div>

              <div className="flex space-x-2 overflow-x-auto pb-0.5 scrollbar-none snap-x">
                {SAMPLE_CREATOR_MEDIA.map((item) => {
                  const isSelected = selectedMedia?.id === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onMediaSelected(item)}
                      className={`h-9 px-3 rounded-xl border flex items-center space-x-1.5 shrink-0 snap-start transition-all active:scale-95 text-xs ${
                        isSelected
                          ? 'border-[#FF4800] bg-orange-50 text-[#FF4800] font-black ring-1 ring-[#FF4800]'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-bold'
                      }`}
                    >
                      <Video className="w-3 h-3 shrink-0 text-[#FF4800]" />
                      <span className="truncate max-w-[130px]">{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row 3: Big Orange Primary Next Button */}
            <button
              onClick={onProceedToStudio}
              className="w-full py-3 px-4 rounded-xl bg-[#FF4800] hover:bg-[#E63E00] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-500/25 transition-all active:scale-95 flex items-center justify-center space-x-2"
            >
              <span>NEXT: ADD SUPPLEMENT STICKER</span>
              <span className="text-sm">→</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
