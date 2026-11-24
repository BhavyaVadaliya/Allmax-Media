'use client';

import React from 'react';
import { RotateCcw, Smartphone, Check } from 'lucide-react';

interface NavbarProps {
  currentStep: 1 | 2 | 3;
  onStepClick: (step: 1 | 2 | 3) => void;
  canNavigateToStep2: boolean;
  canNavigateToStep3: boolean;
  onReset: () => void;
  onOpenMobileModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentStep,
  onStepClick,
  canNavigateToStep2,
  canNavigateToStep3,
  onReset,
  onOpenMobileModal,
}) => {
  const stepTitles = {
    1: '1. Media',
    2: '2. Product',
    3: '3. Share',
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-13 sm:h-15 py-2">
          {/* Brand Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#FF4800] flex items-center justify-center font-black text-xs sm:text-sm text-white shadow-sm shrink-0">
              AM
            </div>
            <span className="font-black text-slate-900 tracking-tight text-sm sm:text-base">
              ALLMAX <span className="text-[#FF4800] font-normal">STUDIO</span>
            </span>
          </div>

          {/* Center 3-Step Pill (Desktop: Interactive Bar / Mobile: Clean Badge) */}
          <div className="hidden sm:flex items-center space-x-1 bg-slate-100 p-1 rounded-full border border-slate-200 text-xs font-bold">
            <button
              onClick={() => onStepClick(1)}
              className={`px-3 py-1 rounded-full transition-all ${
                currentStep === 1
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              1. Media
            </button>
            <button
              disabled={!canNavigateToStep2}
              onClick={() => canNavigateToStep2 && onStepClick(2)}
              className={`px-3 py-1 rounded-full transition-all ${
                currentStep === 2
                  ? 'bg-white text-slate-900 shadow-sm'
                  : canNavigateToStep2
                  ? 'text-slate-500 hover:text-slate-900'
                  : 'text-slate-400 opacity-40 cursor-not-allowed'
              }`}
            >
              2. Product
            </button>
            <button
              disabled={!canNavigateToStep3}
              onClick={() => canNavigateToStep3 && onStepClick(3)}
              className={`px-3 py-1 rounded-full transition-all ${
                currentStep === 3
                  ? 'bg-white text-slate-900 shadow-sm'
                  : canNavigateToStep3
                  ? 'text-slate-500 hover:text-slate-900'
                  : 'text-slate-400 opacity-40 cursor-not-allowed'
              }`}
            >
              3. Share
            </button>
          </div>

          {/* Mobile Single Step Indicator */}
          <div className="sm:hidden flex items-center bg-orange-50 border border-orange-200/80 px-2.5 py-1 rounded-full text-[11px] font-black text-[#FF4800]">
            <span>{stepTitles[currentStep]}</span>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <button
              onClick={onOpenMobileModal}
              className="hidden md:flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-[#FF4800] border border-orange-200 text-xs font-bold transition-all shadow-sm"
              title="Download Android APK"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>APK</span>
            </button>

            {(canNavigateToStep2 || canNavigateToStep3) && (
              <button
                onClick={onReset}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-600 transition-colors"
                title="Start Over"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
