'use client';

import React from 'react';
import { ExternalLink, RotateCcw, Smartphone, Check } from 'lucide-react';

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
  const steps = [
    { num: 1 as const, label: 'Media', desc: 'Upload' },
    { num: 2 as const, label: 'Product', desc: 'Overlay' },
    { num: 3 as const, label: 'Export', desc: 'Share' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Brand Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#FF4800] flex items-center justify-center font-black text-xs sm:text-sm text-white shadow-sm shrink-0">
              AM
            </div>
            <div className="leading-tight">
              <span className="font-extrabold text-slate-900 tracking-tight text-sm sm:text-base">
                ALLMAX <span className="text-[#FF4800] font-normal">STUDIO</span>
              </span>
            </div>
          </div>

          {/* Desktop 3-Step Pill Bar (Hidden on Mobile) */}
          <div className="hidden md:flex items-center space-x-1 bg-slate-100 p-1 rounded-full border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => onStepClick(1)}
              className={`px-3 py-1.5 rounded-full transition-all ${
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
              className={`px-3 py-1.5 rounded-full transition-all ${
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
              className={`px-3 py-1.5 rounded-full transition-all ${
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

          {/* Right Action Icons & Controls */}
          <div className="flex items-center space-x-1.5 sm:space-x-3">
            {/* Step indicator on mobile */}
            <div className="md:hidden flex items-center bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full text-[11px] font-bold text-[#FF4800]">
              <span>Step {currentStep} of 3</span>
            </div>

            <button
              onClick={onOpenMobileModal}
              className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-[#FF4800] border border-orange-200 text-xs font-bold transition-all shadow-sm active:scale-95"
              title="Download Android APK"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#FF4800]" />
              <span>APK</span>
            </button>

            {(canNavigateToStep2 || canNavigateToStep3) && (
              <button
                onClick={onReset}
                className="flex items-center space-x-1 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors"
                title="Start Over"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile 3-Step Segmented Bar */}
        <div className="md:hidden grid grid-cols-3 gap-1.5 pb-2 pt-0.5 border-t border-slate-100">
          {steps.map((s) => {
            const isActive = currentStep === s.num;
            const isCompleted = currentStep > s.num;
            const isAccessible = s.num === 1 || (s.num === 2 && canNavigateToStep2) || (s.num === 3 && canNavigateToStep3);

            return (
              <button
                key={s.num}
                disabled={!isAccessible}
                onClick={() => isAccessible && onStepClick(s.num)}
                className={`py-1.5 px-2 rounded-lg text-center transition-all flex flex-col items-center justify-center ${
                  isActive
                    ? 'bg-[#FF4800] text-white shadow-sm'
                    : isCompleted
                    ? 'bg-orange-50 text-[#FF4800] font-semibold'
                    : 'bg-slate-100 text-slate-400 opacity-60'
                }`}
              >
                <div className="flex items-center space-x-1">
                  {isCompleted && !isActive && <Check className="w-3 h-3 stroke-[3]" />}
                  <span className="text-[11px] font-bold">{s.num}. {s.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
