'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload,
  Camera,
  Video,
  Square,
  AlertCircle,
  FileVideo,
  FileImage,
  ArrowRight,
  Check,
  Play,
  Sparkles,
} from 'lucide-react';
import { MediaItem } from '@/types';
import { SAMPLE_CREATOR_MEDIA } from '@/data/allmaxProducts';

interface MediaCaptureStepProps {
  onMediaSelected: (media: MediaItem) => void;
  selectedMedia: MediaItem | null;
}

export const MediaCaptureStep: React.FC<MediaCaptureStepProps> = ({
  onMediaSelected,
  selectedMedia,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'camera'>('upload');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

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
    setIsCameraActive(false);
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
      setIsCameraActive(true);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('Could not access camera. Please allow camera permissions or upload a file.');
      setIsCameraActive(false);
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

  const snapPhoto = () => {
    if (!liveCameraRef.current) return;
    const video = liveCameraRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const photoMedia: MediaItem = {
        id: 'photo-' + Date.now(),
        type: 'image',
        sourceType: 'camera',
        url,
        blob,
        name: `Camera_Photo.png`,
      };
      onMediaSelected(photoMedia);
      stopCameraStream();
    }, 'image/png');
  };

  const handleFile = (file: File) => {
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
    <div className="w-full max-w-5xl mx-auto space-y-4 sm:space-y-6 py-2 sm:py-6">
      {/* Title */}
      <div className="text-center max-w-xl mx-auto space-y-1.5 px-2">
        <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Select Your Workout Video or Photo
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Upload phone footage, record with your camera, or pick a real gym sample below.
        </p>
      </div>

      {/* Main Mode Switcher */}
      <div className="flex justify-center px-2">
        <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 inline-flex space-x-1 w-full sm:w-auto max-w-xs">
          <button
            onClick={() => {
              stopCameraStream();
              setActiveTab('upload');
            }}
            className={`flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'upload'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-4 h-4 text-[#FF4800]" />
            <span>Upload File</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('camera');
              startCamera();
            }}
            className={`flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'camera'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-4 h-4 text-[#FF4800]" />
            <span>Use Camera</span>
          </button>
        </div>
      </div>

      {/* Upload & Preview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-start">
        {/* Left Side: Upload Box or Camera */}
        <div className="md:col-span-7 space-y-4">
          {activeTab === 'upload' ? (
            /* Tactile Upload Box */
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragging(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleFile(file);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`bg-white border-2 border-dashed rounded-2xl p-6 sm:p-10 text-center cursor-pointer transition-all active:scale-[0.99] ${
                isDragging
                  ? 'border-[#FF4800] bg-orange-50/50'
                  : 'border-slate-300 hover:border-[#FF4800] hover:bg-slate-50/80 shadow-sm'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*,image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />

              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-orange-100 text-[#FF4800] mx-auto flex items-center justify-center mb-2.5">
                <Upload className="w-6 h-6 stroke-[2.2]" />
              </div>

              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 mb-1">
                Choose Video or Photo from Phone
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 mb-3.5">
                MP4, MOV, WebM, JPG, PNG (vertical 9:16 recommended)
              </p>

              <button
                type="button"
                className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-[#FF4800] hover:bg-[#E63E00] text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-orange-500/20 transition-all"
              >
                <span>Browse Phone Gallery</span>
              </button>
            </div>
          ) : (
            /* Camera Viewfinder */
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3 shadow-sm">
              <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                <span className="flex items-center space-x-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isRecording ? 'bg-red-500 animate-ping' : isCameraActive ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  />
                  <span className="font-bold text-xs">{isRecording ? `Recording (${recordingSeconds}s / 30s)` : 'Camera Ready'}</span>
                </span>
              </div>

              <div className="relative aspect-video sm:aspect-square max-h-[300px] bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center">
                {isCameraActive ? (
                  <video
                    ref={liveCameraRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover -scale-x-100"
                  />
                ) : (
                  <div className="text-center p-6 space-y-2">
                    <Camera className="w-8 h-8 text-slate-500 mx-auto" />
                    <button
                      onClick={startCamera}
                      className="px-4 py-2 bg-[#FF4800] text-white text-xs font-bold rounded-xl shadow"
                    >
                      Turn On Camera
                    </button>
                  </div>
                )}
              </div>

              {cameraError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{cameraError}</span>
                </div>
              )}

              {isCameraActive && (
                <div className="flex items-center justify-center space-x-3 pt-1">
                  {!isRecording ? (
                    <button
                      onClick={startRecording}
                      className="flex items-center space-x-2 px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all active:scale-95"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-white" />
                      <span>Start Video</span>
                    </button>
                  ) : (
                    <button
                      onClick={stopRecording}
                      className="flex items-center space-x-2 px-5 py-2.5 rounded-full bg-slate-900 text-white font-bold text-xs uppercase tracking-wider shadow-sm active:scale-95"
                    >
                      <Square className="w-3 h-3 fill-red-500 text-red-500" />
                      <span>Stop Video</span>
                    </button>
                  )}

                  <button
                    onClick={snapPhoto}
                    className="px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all active:scale-95"
                  >
                    Take Photo
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Instant Gym Samples (Swipeable Carousel on Mobile) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#FF4800]" />
                <span>Instant Gym Samples</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium">1-tap test</span>
            </div>

            <div className="flex sm:grid sm:grid-cols-3 gap-2.5 overflow-x-auto pb-1 scrollbar-none snap-x">
              {SAMPLE_CREATOR_MEDIA.slice(0, 3).map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => {
                    stopCameraStream();
                    onMediaSelected(sample);
                  }}
                  className={`min-w-[130px] sm:min-w-0 group relative rounded-xl overflow-hidden border text-left transition-all aspect-[4/3] bg-slate-100 shrink-0 snap-start active:scale-95 ${
                    selectedMedia?.id === sample.id
                      ? 'border-[#FF4800] ring-2 ring-[#FF4800]/30 shadow-sm'
                      : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={sample.thumbnail}
                    alt={sample.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-2 flex flex-col justify-end">
                    <span className="text-[11px] font-bold text-white line-clamp-1 leading-tight">
                      {sample.name}
                    </span>
                    <span className="text-[9px] text-slate-300 uppercase flex items-center space-x-1 mt-0.5">
                      <Video className="w-2.5 h-2.5 text-orange-400" />
                      <span>{sample.duration}s MP4</span>
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Selected Media Preview */}
        <div className="md:col-span-5 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Selected Media Preview
            </h3>
            {selectedMedia && (
              <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <Check className="w-3 h-3 stroke-[3]" />
                <span>Ready for Studio</span>
              </span>
            )}
          </div>

          {selectedMedia ? (
            <div className="space-y-3">
              {/* Media Preview Box */}
              <div className="relative aspect-[9/16] max-h-[280px] sm:max-h-[380px] mx-auto bg-slate-950 rounded-xl overflow-hidden shadow-md flex items-center justify-center">
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
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Media Info */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Filename:</span>
                  <span className="font-bold text-slate-900 truncate max-w-[180px]">
                    {selectedMedia.name}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Type:</span>
                  <span className="capitalize font-semibold text-slate-800">{selectedMedia.type} ({selectedMedia.sourceType})</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="aspect-[9/16] max-h-[240px] sm:max-h-[320px] rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <FileVideo className="w-10 h-10 stroke-[1.5] text-slate-300 mb-2" />
              <span className="text-xs font-semibold text-slate-600">No media selected yet</span>
              <span className="text-[11px] text-slate-400 mt-0.5">Upload a video or pick a sample</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
