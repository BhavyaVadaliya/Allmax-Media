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
  Sparkles,
} from 'lucide-react';
import { MediaItem } from '@/types';
import { SAMPLE_CREATOR_MEDIA } from '@/data/allmaxProducts';

interface MediaCaptureStepProps {
  onMediaSelected: (media: MediaItem) => void;
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

  // Default to first workout clip if nothing selected
  useEffect(() => {
    if (!selectedMedia && SAMPLE_CREATOR_MEDIA.length > 0) {
      onMediaSelected(SAMPLE_CREATOR_MEDIA[0]);
    }
  }, [selectedMedia, onMediaSelected]);

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
      setCameraError('Camera access denied. Please allow camera permissions or upload a video.');
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
      console.error('Recording initialization failed:', e);
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
    <div className="h-full flex flex-col justify-between overflow-hidden">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*,image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Main Video/Media Viewport (Takes all available vertical space, Large & Immersive) */}
      <div className="flex-1 min-h-0 relative flex items-center justify-center p-1 sm:p-2">
        {showCamera ? (
          /* Live Camera View */
          <div className="relative h-full aspect-[9/16] max-h-[58vh] bg-black rounded-3xl overflow-hidden shadow-2xl border-2 border-slate-700 flex flex-col justify-between">
            <video
              ref={liveCameraRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Top Camera Controls */}
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

            {/* Bottom Camera Record Trigger */}
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
                  Back to Media
                </button>
              </div>
            )}
          </div>
        ) : selectedMedia ? (
          /* Large Selected Media Preview (Instagram Reel Style) */
          <div className="relative h-full aspect-[9/16] max-h-[58vh] bg-black rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
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

            {/* Floating Top Controls on Video */}
            <div className="absolute top-2.5 left-2.5 right-2.5 z-20 flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                {selectedMedia.type === 'video' && (
                  <button
                    onClick={togglePlay}
                    className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition-colors shadow-md"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                  </button>
                )}
                {selectedMedia.type === 'video' && (
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition-colors shadow-md"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                )}
              </div>

              {/* Ready Tag */}
              <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-white font-extrabold flex items-center space-x-1 border border-white/20">
                <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                <span>Selected</span>
              </div>
            </div>

            {/* Floating "Replace Media" Pill */}
            <div className="absolute bottom-2.5 left-0 right-0 z-20 flex justify-center">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-1.5 rounded-full bg-black/70 backdrop-blur-md text-white text-[11px] font-bold border border-white/25 hover:bg-black/90 active:scale-95 transition-all flex items-center space-x-1.5 shadow-lg"
              >
                <RefreshCw className="w-3 h-3 text-orange-400" />
                <span>Replace Media</span>
              </button>
            </div>
          </div>
        ) : (
          /* Empty State prompt */
          <div
            onClick={() => fileInputRef.current?.click()}
            className="h-full aspect-[9/16] max-h-[58vh] bg-slate-100 rounded-3xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:border-[#FF4800] transition-colors"
          >
            <Upload className="w-12 h-12 text-slate-400 mb-2" />
            <span className="text-sm font-black text-slate-800">Tap to Choose Video</span>
            <span className="text-xs text-slate-500 mt-1">Upload workout video or photo</span>
          </div>
        )}
      </div>

      {/* Docked Instagram-Style Media Tray (Fixed at bottom, No Scrolling Needed) */}
      <div className="bg-white border-t border-slate-200 p-2.5 sm:p-3 shadow-2xl safe-bottom space-y-2">
        {/* Row 1: Big Direct Buttons: Gallery & Camera */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all text-xs font-black text-slate-800 shadow-sm"
          >
            <FolderOpen className="w-4 h-4 text-[#FF4800]" />
            <span>From Gallery</span>
          </button>

          <button
            onClick={startCamera}
            className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all text-xs font-black text-slate-800 shadow-sm"
          >
            <Camera className="w-4 h-4 text-[#FF4800]" />
            <span>Record Camera</span>
          </button>
        </div>

        {/* Row 2: Instant Workout Sample Clips (1-Tap Test) */}
        <div>
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1 px-1">
            <span>Or Choose Demo Workout Clip:</span>
            <span className="text-[#FF4800] font-black">1-Tap Ready</span>
          </div>

          <div className="flex space-x-2 overflow-x-auto pb-0.5 scrollbar-none snap-x">
            {SAMPLE_CREATOR_MEDIA.map((item, idx) => {
              const isSelected = selectedMedia?.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onMediaSelected(item);
                    setShowCamera(false);
                  }}
                  className={`h-11 px-3 rounded-xl border flex items-center space-x-2 shrink-0 snap-start transition-all active:scale-95 ${
                    isSelected
                      ? 'border-[#FF4800] bg-orange-50/90 text-[#FF4800] ring-2 ring-[#FF4800]/30 font-black'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-bold'
                  }`}
                >
                  <Video className="w-3.5 h-3.5 shrink-0 text-[#FF4800]" />
                  <span className="text-xs truncate max-w-[140px]">{item.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 3: Primary Next Button */}
        <button
          onClick={onProceedToStudio}
          disabled={!selectedMedia}
          className="w-full py-3 px-4 rounded-xl bg-[#FF4800] hover:bg-[#E63E00] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-500/25 transition-all active:scale-95 disabled:opacity-40 flex items-center justify-center space-x-2"
        >
          <span>Next: Add Supplement Sticker</span>
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </button>
      </div>
    </div>
  );
};
