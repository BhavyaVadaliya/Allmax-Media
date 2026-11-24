'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload,
  Camera,
  Square,
  AlertCircle,
  ArrowRight,
  Check,
  Sparkles,
  RefreshCw,
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

  const liveCameraRef = useRef<HTMLVideoElement | null>(null);
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
      setCameraError('Could not open camera. Please allow camera permissions or upload a video.');
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
          name: `Camera_Video.mp4`,
          duration: recordingSeconds,
        };
        onMediaSelected(recordedMedia);
        stopCameraStream();
      };

      recorder.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 30) {
            stopRecording();
            return 30;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (e: any) {
      setCameraError('Recording error: ' + e.message);
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
    setIsRecording(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    if (!isVideo && !isImage) {
      alert('Please select a valid video (MP4, MOV, WebM) or photo (JPG, PNG).');
      return;
    }

    const url = URL.createObjectURL(file);
    onMediaSelected({
      id: 'upload-' + Date.now(),
      type: isVideo ? 'video' : 'image',
      sourceType: 'upload',
      url,
      blob: file,
      name: file.name,
    });
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-3.5 py-1 px-1">
      {/* Hidden native file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*,image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Screen Title */}
      <div className="text-center space-y-0.5">
        <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
          {selectedMedia ? 'Workout Media Selected' : 'Step 1: Choose Your Video or Photo'}
        </h1>
        <p className="text-xs text-slate-500">
          {selectedMedia
            ? 'Preview your media below or tap Replace to change it'
            : 'Select footage to place the Allmax Nutrition product onto'}
        </p>
      </div>

      {/* Camera Live Viewfinder Modal */}
      {showCamera && (
        <div className="bg-white border-2 border-slate-900 rounded-2xl p-3.5 space-y-3 shadow-xl animate-fade-in">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800">
            <span className="flex items-center space-x-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isRecording ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`} />
              <span>{isRecording ? `Recording (${recordingSeconds}s / 30s)` : 'Camera Ready'}</span>
            </span>
            <button
              onClick={stopCameraStream}
              className="text-xs text-slate-500 hover:text-slate-800 font-bold underline"
            >
              Cancel
            </button>
          </div>

          <div className="relative aspect-[9/16] max-h-[300px] mx-auto bg-slate-950 rounded-xl overflow-hidden shadow-inner">
            <video
              ref={liveCameraRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover -scale-x-100"
            />
          </div>

          {cameraError && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center space-x-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{cameraError}</span>
            </div>
          )}

          <div className="flex justify-center pt-1">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider shadow-md active:scale-95"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-white" />
                <span>Start Recording</span>
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-full bg-slate-900 text-white font-black text-xs uppercase tracking-wider shadow-md active:scale-95"
              >
                <Square className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                <span>Stop &amp; Use Video</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* STATE 1: SELECTION OPTIONS (Shown ONLY when NO media is selected) */}
      {!selectedMedia && !showCamera && (
        <div className="space-y-3 animate-fade-in">
          {/* Big Option 1: Upload from Phone */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-4 rounded-2xl bg-white border-2 border-slate-200 hover:border-[#FF4800] text-left flex items-center space-x-3.5 shadow-sm hover:shadow-md transition-all active:scale-[0.98] group"
          >
            <div className="w-12 h-12 rounded-xl bg-orange-100 text-[#FF4800] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Upload className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-sm sm:text-base font-black text-slate-900 block">
                Choose Video or Photo from Phone
              </span>
              <span className="text-xs text-slate-500 block mt-0.5">
                Select from your phone gallery or files (MP4, MOV, JPG, PNG)
              </span>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-[#FF4800] group-hover:translate-x-0.5 transition-all shrink-0" />
          </button>

          {/* Big Option 2: Record with Camera */}
          <button
            onClick={startCamera}
            className="w-full p-4 rounded-2xl bg-white border-2 border-slate-200 hover:border-[#FF4800] text-left flex items-center space-x-3.5 shadow-sm hover:shadow-md transition-all active:scale-[0.98] group"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Camera className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-sm sm:text-base font-black text-slate-900 block">
                Record with Camera
              </span>
              <span className="text-xs text-slate-500 block mt-0.5">
                Record live gym footage right now
              </span>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-[#FF4800] group-hover:translate-x-0.5 transition-all shrink-0" />
          </button>

          {/* Quick Gym Samples */}
          <div className="pt-1.5">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#FF4800]" />
                <span>Or Test Instantly with Gym Video</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {SAMPLE_CREATOR_MEDIA.slice(0, 2).map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => onMediaSelected(sample)}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-[#FF4800] text-left flex items-center space-x-2.5 shadow-sm active:scale-95 transition-all"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={sample.thumbnail}
                    alt={sample.name}
                    className="w-11 h-11 rounded-lg object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-black text-slate-900 truncate block">
                      {sample.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold block">
                      {sample.duration}s Video
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STATE 2: MEDIA IS SELECTED (All selection options REMOVED, Only Video/Image Shown with Replace Option) */}
      {selectedMedia && !showCamera && (
        <div className="space-y-3.5 animate-fade-in">
          {/* Selected Media View Card */}
          <div className="bg-white border-2 border-emerald-500/40 rounded-2xl p-3 sm:p-4 shadow-md space-y-3">
            {/* Top Bar with Ready Indicator & REPLACE Button */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Ready for Studio</span>
              </span>

              {/* REPLACE OPTION: Lets user replace the video/photo immediately */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-[#FF4800] border border-orange-200 text-xs font-extrabold transition-all active:scale-95"
                title="Replace with another video or photo"
              >
                <RefreshCw className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Replace Video / Photo</span>
              </button>
            </div>

            {/* The Selected Video or Image (Shown instead of selection options) */}
            <div className="relative aspect-[9/16] h-[280px] sm:h-[340px] mx-auto bg-slate-950 rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
              {selectedMedia.type === 'video' ? (
                <video
                  key={selectedMedia.url}
                  src={selectedMedia.url}
                  controls
                  autoPlay
                  loop
                  muted
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
            </div>

            {/* Media Metadata & Replace shortcut row */}
            <div className="flex items-center justify-between text-xs text-slate-500 px-1 pt-0.5">
              <span className="font-semibold text-slate-800 truncate max-w-[200px]">
                {selectedMedia.name}
              </span>

              <button
                onClick={() => startCamera()}
                className="text-[11px] font-bold text-slate-500 hover:text-[#FF4800] underline"
              >
                or re-record camera
              </button>
            </div>
          </div>

          {/* Primary Action Button: Proceed to Product Studio */}
          <button
            onClick={onProceedToStudio}
            className="w-full py-4 rounded-xl bg-[#FF4800] hover:bg-[#E63E00] text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-orange-500/25 transition-all active:scale-95 flex items-center justify-center space-x-2"
          >
            <span>Next: Place Allmax Product</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      )}
    </div>
  );
};
