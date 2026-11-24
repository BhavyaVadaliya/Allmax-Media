'use client';

import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  X,
  Copy,
  Check,
  QrCode,
  RefreshCw,
  Camera,
  Globe,
  Share2,
  PlusSquare,
  Sparkles,
} from 'lucide-react';

interface MobileAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileAppModal: React.FC<MobileAppModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'ios' | 'android'>('ios');
  const [copied, setCopied] = useState(false);

  const webAppUrl = 'https://allmaxmedia.vercel.app';
  const apkDownloadUrl = 'https://allmaxmedia.vercel.app/api/download-apk';

  if (!isOpen) return null;

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-gradient-to-r from-orange-50/70 to-slate-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF4800] text-white flex items-center justify-center shadow-md shadow-orange-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-slate-900 text-base">
                  Allmax Studio on Mobile
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-orange-100 text-[#FF4800] text-[10px] font-black uppercase">
                  Mobile App
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Run natively on your iPhone (iOS) or Android device
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Platform Selector Tabs */}
        <div className="px-5 pt-4 pb-1 border-b border-slate-100 flex space-x-2 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'ios'
                ? 'bg-black text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {/* Apple Logo Icon */}
            <svg className="w-4 h-4 fill-current" viewBox="0 0 170 170">
              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.66-7.79-11.89-14.24-5.34-8.15-9.64-17.51-12.89-28.08-3.26-10.58-4.89-20.91-4.89-30.98 0-14.24 3.56-26.06 10.67-35.46 7.12-9.4 16.03-14.21 26.74-14.42 5.01 0 10.37 1.34 16.09 4.02 5.72 2.68 9.38 4.09 10.98 4.23 1.3.14 5.25-1.37 11.86-4.54 6.6-3.17 12.5-4.5 17.68-4.02 13.59.87 24.32 5.72 32.2 14.54-11.85 7.18-17.65 17.1-17.39 29.74.27 9.89 4.06 18.06 11.37 24.51 7.31 6.45 15.93 10.15 25.86 11.1-2.17 6.42-4.89 13.06-8.15 19.92zM119.22 31.85c0-7.39 2.65-14.18 7.95-20.37 5.3-6.19 11.75-9.84 19.34-10.95.22 1.09.33 2.18.33 3.26 0 7.39-2.73 14.26-8.17 20.61-5.45 6.36-12.02 10.02-19.72 10.98-.11-1.2-.17-2.38-.17-3.53z" />
            </svg>
            <span>iPhone / iOS</span>
          </button>

          <button
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'android'
                ? 'bg-[#FF4800] text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Android (APK)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {activeTab === 'ios' ? (
            /* iOS / iPhone Section */
            <div className="space-y-4">
              {/* iOS Feature Badge */}
              <div className="p-3.5 rounded-2xl bg-orange-50 border border-orange-200/70 text-xs text-orange-950 flex items-start space-x-3">
                <Sparkles className="w-4 h-4 text-[#FF4800] mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <span className="font-bold text-[#FF4800] block">
                    Zero App Store / Xcode Needed
                  </span>
                  <p className="text-slate-700 leading-relaxed text-[11px]">
                    Apple iOS supports Progressive Web Apps natively. In just 3 taps in Safari, you can install Allmax Studio onto your iPhone home screen as a standalone full-screen app.
                  </p>
                </div>
              </div>

              {/* 3 Step Installation Guide */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 block">
                  How to install on your iPhone (10 seconds):
                </span>

                <div className="space-y-2.5 text-xs text-slate-800">
                  <div className="flex items-start space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-black text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <p className="leading-snug">
                      Open <strong className="text-[#FF4800]">allmaxmedia.vercel.app</strong> in <strong>Safari</strong> on your iPhone.
                    </p>
                  </div>

                  <div className="flex items-start space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-black text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <p className="leading-snug">
                      Tap the <strong>Share button</strong>{' '}
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-200 text-[10px] font-bold">
                        <Share2 className="w-3 h-3 inline mr-0.5" /> Share
                      </span>{' '}
                      at the bottom of Safari.
                    </p>
                  </div>

                  <div className="flex items-start space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-black text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <p className="leading-snug">
                      Scroll down and tap{' '}
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-200 text-[10px] font-bold">
                        <PlusSquare className="w-3 h-3 inline mr-0.5" /> Add to Home Screen
                      </span>
                      , then tap <strong>Add</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* QR Code and Copy Link for iPhone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div className="space-y-2">
                  <button
                    onClick={() => handleCopyLink(webAppUrl)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-black hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 text-center"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy iPhone Web Link</span>
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-slate-500 text-center">
                    Send or open this link on your iPhone
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center p-3 rounded-2xl border border-slate-200 bg-slate-50 text-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(
                      webAppUrl
                    )}`}
                    alt="Scan to open on iPhone"
                    className="w-24 h-24 rounded-xl bg-white p-1 border border-slate-200 shadow-sm"
                  />
                  <span className="text-[10px] text-slate-600 mt-1.5 font-bold flex items-center gap-1">
                    <QrCode className="w-3 h-3 text-[#FF4800]" />
                    Scan with iPhone Camera
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Android Section */
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-orange-50 border border-orange-200/70 text-xs text-orange-950 flex items-start space-x-3">
                <RefreshCw className="w-4 h-4 text-[#FF4800] mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <span className="font-bold text-[#FF4800] block">
                    Auto-Updates Without Reinstallation
                  </span>
                  <p className="text-slate-700 leading-relaxed text-[11px]">
                    Install this APK once. The app connects directly to the live cloud URL. Whenever you push updates, your mobile app updates automatically!
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div className="space-y-2">
                  <a
                    href={apkDownloadUrl}
                    download="AllmaxStudio.apk"
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-[#FF4800] hover:bg-[#E63E00] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-500/25 transition-all active:scale-95 text-center"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download APK (25 KB)</span>
                  </a>

                  <button
                    onClick={() => handleCopyLink(apkDownloadUrl)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copy APK Link</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex flex-col items-center justify-center p-3 rounded-2xl border border-slate-200 bg-slate-50 text-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(
                      apkDownloadUrl
                    )}`}
                    alt="Scan to Download APK"
                    className="w-24 h-24 rounded-xl bg-white p-1 border border-slate-200 shadow-sm"
                  />
                  <span className="text-[10px] text-slate-600 mt-1.5 font-bold flex items-center gap-1">
                    <QrCode className="w-3 h-3 text-[#FF4800]" />
                    Scan with Android Camera
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-100 text-[11px] text-slate-600 space-y-1">
                <span className="font-semibold text-slate-800">
                  Quick Tip for Currently Installed App:
                </span>
                <p>
                  If you see &ldquo;Server Not Detected&rdquo;, simply tap{' '}
                  <strong>&ldquo;CHANGE SERVER IP&rdquo;</strong> and enter:{' '}
                  <code className="text-[#FF4800] font-bold">
                    https://allmaxmedia.vercel.app
                  </code>
                </p>
              </div>
            </div>
          )}

          {/* Native Capabilities Pill Row */}
          <div className="border-t border-slate-100 pt-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center space-x-2 p-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-700">
                <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="text-[11px] font-medium">Live Cloud Sync</span>
              </div>
              <div className="flex items-center space-x-2 p-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-700">
                <Camera className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="text-[11px] font-medium">Camera &amp; Video</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
