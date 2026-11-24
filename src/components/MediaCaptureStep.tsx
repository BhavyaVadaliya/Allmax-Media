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
    <div className="w-full max-w-5xl mx-auto space-y-8 py-6">
      {/* Title */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Select Your Workout Video or Photo
        </h1>
        <p className="text-sm text-slate-600">
          Upload your gym footage, record directly with your camera, or pick a sample below to overlay Allmax products.
        </p>
      </div>

      {/* Main Mode Switcher */}
      <div className="flex justify-center">
        <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 inline-flex space-x-1">
          <button
            onClick={() => {
              stopCameraStream();
              setActiveTab('upload');
            }}
            className={`flex items-center space-x-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
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
            className={`flex items-center space-x-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
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
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Side: Upload Box or Camera (7 cols) */}
        <div className="md:col-span-7 space-y-5">
          {activeTab === 'upload' ? (
            /* Simple Clean Upload Card */
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
              className={`bg-white border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
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

              <div className="w-14 h-14 rounded-2xl bg-orange-100 text-[#FF4800] mx-auto flex items-center justify-center mb-3">
                <Upload className="w-6 h-6 stroke-[2.2]" />
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-1">
                Drop your video or photo here
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Supports MP4, MOV, WebM, JPG, PNG (up to 100MB)
              </p>

              <button
                type="button"
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <span>Browse Files</span>
              </button>
            </div>
          ) : (
            /* Clean Camera Viewfinder */
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                <span className="flex items-center space-x-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isRecording ? 'bg-red-500 animate-ping' : isCameraActive ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  />
                  <span>{isRecording ? `Recording (${recordingSeconds}s)` : 'Camera Ready'}</span>
                </span>
              </div>

              <div className="relative aspect-video bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center">
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
                      className="px-4 py-2 bg-[#FF4800] text-white text-xs font-semibold rounded-lg"
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
                      className="flex items-center space-x-2 px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-white" />
                      <span>Start Video</span>
                    </button>
                  ) : (
                    <button
                      onClick={stopRecording}
                      className="flex items-center space-x-2 px-5 py-2.5 rounded-full bg-slate-900 text-white font-bold text-xs uppercase tracking-wider shadow-sm"
                    >
                      <Square className="w-3 h-3 fill-red-500 text-red-500" />
                      <span>Stop & Use Video</span>
                    </button>
                  )}

                  <button
                    onClick={snapPhoto}
                    className="px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-all"
                  >
                    Take Photo
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Clean 1-Click Samples Section */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Or Try with Instant Gym Samples
              </span>
              <span className="text-[11px] text-slate-400">1-click test</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SAMPLE_CREATOR_MEDIA.slice(0, 3).map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => {
                    stopCameraStream();
                    onMediaSelected(sample);
                  }}
                  className={`group relative rounded-xl overflow-hidden border text-left transition-all aspect-[4/3] bg-slate-100 ${
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-2.5 flex flex-col justify-end">
                    <span className="text-[11px] font-bold text-white line-clamp-1 leading-tight">
                      {sample.name}
                    </span>
                    <span className="text-[9px] text-slate-300 uppercase flex items-center space-x-1 mt-0.5">
                      {sample.type === 'video' ? (
                        <>
                          <Video className="w-2.5 h-2.5 text-orange-400" />
                          <span>Video ({sample.duration}s)</span>
                        </>
                      ) : (
                        <>
                          <FileImage className="w-2.5 h-2.5 text-blue-300" />
                          <span>Photo</span>
                        </>
                      )}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Selected Media Preview (5 cols) */}
        <div className="md:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Selected Preview
            </h3>
            {selectedMedia && (
              <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <Check className="w-3 h-3" />
                <span>Ready</span>
              </span>
            )}
          </div>

          {selectedMedia ? (
            <div className="space-y-4">
              {/* Media Preview Box */}
              <div className="relative aspect-[9/16] max-h-[380px] mx-auto bg-slate-950 rounded-xl overflow-hidden shadow-md flex items-center justify-center">
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
                    alt="Selected media"
                    className="w-full h-full object-cover"
                  />
                )}

                <div className="absolute top-2.5 left-2.5 bg-black/75 px-2 py-0.5 rounded text-[10px] font-semibold text-white flex items-center space-x-1">
                  {selectedMedia.type === 'video' ? (
                    <FileVideo className="w-3 h-3 text-orange-400" />
                  ) : (
                    <FileImage className="w-3 h-3 text-blue-400" />
                  )}
                  <span className="uppercase">{selectedMedia.type}</span>
                </div>
              </div>

              {/* File Info */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">File:</span>
                  <span className="text-slate-900 font-semibold truncate max-w-[180px]">
                    {selectedMedia.name}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="aspect-[4/5] max-h-[380px] rounded-xl border border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-2">
              <Video className="w-8 h-8 text-slate-400" />
              <p className="text-xs text-slate-500">No media chosen yet</p>
              <p className="text-[11px] text-slate-400">
                Pick a gym sample or upload a file on the left.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
