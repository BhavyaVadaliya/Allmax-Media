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

  const liveCameraRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Default to the first sample if nothing selected so user sees live preview immediately
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
      setCameraError('Could not open camera. Please allow camera permissions or choose from gallery.');
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
          name: `Camera_Clip.mp4`,
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
      alert('Please select a valid video or photo.');
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
    <div className="w-full max-w-md mx-auto flex flex-col h-[calc(100vh-60px)] sm:h-auto sm:space-y-4">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*,image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* TOP VIEWPORT: Instagram Media Preview Stage */}
      <div className="relative aspect-square sm:aspect-[4/5] sm:max-h-[380px] w-full bg-black overflow-hidden shrink-0 select-none">
        {showCamera ? (
          <div className="relative w-full h-full flex flex-col justify-between p-3">
            <video
              ref={liveCameraRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover -scale-x-100"
            />
            <div className="relative z-10 flex items-center justify-between text-xs font-bold text-white bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <span className="flex items-center space-x-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isRecording ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`} />
                <span>{isRecording ? `Recording (${recordingSeconds}s)` : 'Camera Ready'}</span>
              </span>
              <button onClick={stopCameraStream} className="text-white hover:text-slate-300">
                Cancel
              </button>
            </div>

            <div className="relative z-10 flex justify-center pb-2">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="w-14 h-14 rounded-full border-4 border-white flex items-center justify-center bg-red-600 shadow-xl active:scale-95"
                >
                  <div className="w-10 h-10 rounded-full bg-red-600" />
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="w-14 h-14 rounded-full border-4 border-white flex items-center justify-center bg-black/60 shadow-xl active:scale-95"
                >
                  <Square className="w-5 h-5 fill-red-500 text-red-500" />
                </button>
              )}
            </div>
          </div>
        ) : selectedMedia ? (
          <div className="relative w-full h-full">
            {selectedMedia.type === 'video' ? (
              <video
                key={selectedMedia.url}
                src={selectedMedia.url}
                controls={false}
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
                alt="Selected"
                className="w-full h-full object-cover"
              />
            )}

            {/* Sound toggle pill */}
            {selectedMedia.type === 'video' && (
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm p-1.5 rounded-full text-white"
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
            )}

            {/* Selected Badge */}
            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-black text-white flex items-center space-x-1">
              <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
              <span>Ready</span>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
            <Video className="w-12 h-12 stroke-[1.5] text-slate-600 mb-2" />
            <span className="text-xs font-bold text-slate-300">Choose a video below</span>
          </div>
        )}
      </div>

      {/* BOTTOM SECTION: Instagram Gallery & Sources Tray */}
      <div className="flex-1 bg-white flex flex-col overflow-hidden">
        {/* Instagram Header Bar: Recents dropdown & Quick Action Buttons */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 shrink-0">
          <div className="flex items-center space-x-1 text-slate-900 font-extrabold text-xs">
            <span>Recents</span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Gallery Upload Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all active:scale-95"
            >
              <FolderOpen className="w-3.5 h-3.5 text-slate-600" />
              <span>Gallery</span>
            </button>

            {/* Camera Record Button */}
            <button
              onClick={startCamera}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all active:scale-95"
            >
              <Camera className="w-3.5 h-3.5 text-slate-600" />
              <span>Camera</span>
            </button>
          </div>
        </div>

        {/* Instagram 4-Grid Thumbnail Selector */}
        <div className="flex-1 p-2 grid grid-cols-3 gap-1.5 overflow-y-auto">
          {/* Tile 1: Device Gallery Picker Tile */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square bg-slate-100 hover:bg-slate-200 rounded-lg flex flex-col items-center justify-center text-center p-2 text-slate-700 transition-all active:scale-95 border border-slate-200"
          >
            <Upload className="w-6 h-6 text-[#FF4800] mb-1" />
            <span className="text-[10px] font-black uppercase">Device File</span>
          </button>

          {/* Tile 2: Live Camera Tile */}
          <button
            onClick={startCamera}
            className="aspect-square bg-slate-100 hover:bg-slate-200 rounded-lg flex flex-col items-center justify-center text-center p-2 text-slate-700 transition-all active:scale-95 border border-slate-200"
          >
            <Camera className="w-6 h-6 text-slate-700 mb-1" />
            <span className="text-[10px] font-black uppercase">Camera</span>
          </button>

          {/* Sample Gym Footage Tiles (Instant 1-Tap Select) */}
          {SAMPLE_CREATOR_MEDIA.map((sample) => {
            const isSelected = selectedMedia?.id === sample.id;
            return (
              <button
                key={sample.id}
                onClick={() => {
                  stopCameraStream();
                  onMediaSelected(sample);
                }}
                className={`relative aspect-square rounded-lg overflow-hidden border transition-all active:scale-95 ${
                  isSelected
                    ? 'border-[#FF4800] ring-2 ring-[#FF4800]'
                    : 'border-slate-200'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sample.thumbnail}
                  alt={sample.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1">
                  <span className="text-[9px] font-black text-white truncate">
                    {sample.duration}s Gym
                  </span>
                </div>
                {isSelected && (
                  <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#FF4800] text-white flex items-center justify-center text-[10px] font-black">
                    ✓
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Primary Bottom Bar: Instagram Next Button */}
        <div className="p-3 border-t border-slate-100 bg-white">
          <button
            onClick={onProceedToStudio}
            disabled={!selectedMedia}
            className="w-full py-3.5 rounded-xl bg-[#FF4800] hover:bg-[#E63E00] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-500/25 transition-all active:scale-95 disabled:opacity-40 flex items-center justify-center space-x-1.5"
          >
            <span>Next: Add Allmax Supplement →</span>
          </button>
        </div>
      </div>
    </div>
  );
};
