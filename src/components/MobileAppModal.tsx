'use client';

import React, { useState } from 'react';
import { Smartphone, Download, X, Copy, Check, QrCode, RefreshCw, Camera, Globe } from 'lucide-react';

interface MobileAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileAppModal: React.FC<MobileAppModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const apkDownloadUrl = 'https://allmaxmedia.vercel.app/api/download-apk';

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(apkDownloadUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between bg-gradient-to-r from-orange-50/70 to-slate-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF4800] text-white flex items-center justify-center shadow-md shadow-orange-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-slate-900 text-base">Allmax Studio for Android</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Live Cloud APK
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Connected to allmaxmedia.vercel.app</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Live sync callout */}
          <div className="p-3.5 rounded-xl bg-orange-50/80 border border-orange-200/60 text-xs text-orange-950 flex items-start space-x-3">
            <RefreshCw className="w-4 h-4 text-[#FF4800] mt-0.5 shrink-0" />
            <div className="space-y-1">
              <span className="font-bold text-[#FF4800] block">Auto-Updates Without Reinstallation</span>
              <p className="text-slate-700 leading-relaxed text-[11px]">
                Install this APK once. The app connects directly to the live cloud URL. Whenever you push new code to GitHub, your mobile app reflects the updates automatically!
              </p>
            </div>
          </div>

          {/* Download Buttons and QR */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* Left: Action Buttons */}
            <div className="space-y-2.5">
              <a
                href="/api/download-apk"
                download="AllmaxStudio.apk"
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-[#FF4800] hover:bg-[#E63E00] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-orange-500/25 transition-all active:scale-95 text-center"
              >
                <Download className="w-4 h-4" />
                <span>Download APK (25 KB)</span>
              </a>

              <button
                onClick={handleCopyLink}
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
                    <span>Copy Download Link</span>
                  </>
                )}
              </button>
            </div>

            {/* Right: QR Code for Direct Scan */}
            <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 bg-slate-50 text-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(apkDownloadUrl)}`}
                alt="Scan to Download APK"
                className="w-24 h-24 rounded-lg bg-white p-1 border border-slate-200 shadow-sm"
              />
              <span className="text-[10px] text-slate-500 mt-2 font-medium flex items-center gap-1">
                <QrCode className="w-3 h-3 text-slate-400" />
                Scan with mobile camera
              </span>
            </div>
          </div>

          {/* Native Features Pills */}
          <div className="border-t border-slate-100 pt-4 space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Native Mobile Capabilities</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center space-x-2 p-2 rounded-lg bg-slate-50 border border-slate-100 text-slate-700">
                <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="text-[11px] font-medium">Live Vercel Cloud Sync</span>
              </div>
              <div className="flex items-center space-x-2 p-2 rounded-lg bg-slate-50 border border-slate-100 text-slate-700">
                <Camera className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="text-[11px] font-medium">Camera & Mic Access</span>
              </div>
            </div>
          </div>

          {/* Quick Setup Note */}
          <div className="p-3 rounded-lg bg-slate-100 text-[11px] text-slate-600 space-y-1">
            <span className="font-semibold text-slate-800">Quick Tip for Currently Installed App:</span>
            <p>If you see "Server Not Detected", simply tap <strong>"CHANGE SERVER IP"</strong> and enter: <code className="text-[#FF4800] font-bold">https://allmaxmedia.vercel.app</code></p>
          </div>
        </div>
      </div>
    </div>
  );
};
