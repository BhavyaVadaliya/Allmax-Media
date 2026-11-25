'use client';

import React from 'react';
import { Flame, Lock, Home } from 'lucide-react';

interface NavbarProps {
  currentStep: 1 | 2 | 3;
  handle?: string;
  onStepClick?: (step: 1 | 2 | 3) => void;
  canNavigateToStep2?: boolean;
  canNavigateToStep3?: boolean;
  onReset?: () => void;
  onGoHome?: () => void;
  onOpenMobileModal: () => void;
  onNext?: () => void;
  nextLabel?: string;
  isNextDisabled?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  handle = '@alex_lifts_allmax',
  onGoHome,
  onOpenMobileModal,
}) => {
  return (
    <header className="shrink-0 z-50 bg-white border-b border-slate-200 safe-top">
      <div className="px-4 py-3 flex items-center justify-between max-w-lg w-full mx-auto">
        {/* Left: Unified Brand Header (Matches Home & Overview Screens) */}
        <div
          className="flex items-center space-x-2.5 cursor-pointer active:scale-95 transition-transform"
          onClick={onOpenMobileModal}
          title="Allmax Studio Mobile App"
        >
          <div className="w-9 h-9 rounded-full bg-[#FF4800] flex items-center justify-center shadow-md shadow-orange-500/25">
            <Flame className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1 text-sm font-black tracking-wide uppercase">
              <span className="text-slate-900">ALLMAX</span>
              <span className="text-[#FF4800]">STUDIO</span>
            </div>
            <div className="flex items-center space-x-1 text-[11px] font-mono text-slate-500">
              <Lock className="w-3 h-3 text-emerald-600" />
              <span className="truncate max-w-[160px]">{handle}</span>
            </div>
          </div>
        </div>

        {/* Right: Home Pill Button */}
        <div className="flex items-center justify-end">
          {onGoHome && (
            <button
              onClick={onGoHome}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-800 active:scale-95 transition-all"
              title="Back to Home"
            >
              <Home className="w-3.5 h-3.5 text-[#FF4800]" />
              <span>Home</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
