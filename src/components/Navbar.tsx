'use client';

import React from 'react';
import { ChevronLeft, Smartphone } from 'lucide-react';

interface NavbarProps {
  currentStep: 1 | 2 | 3;
  onStepClick: (step: 1 | 2 | 3) => void;
  canNavigateToStep2: boolean;
  canNavigateToStep3: boolean;
  onReset: () => void;
  onOpenMobileModal: () => void;
  onNext?: () => void;
  nextLabel?: string;
  isNextDisabled?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentStep,
  onStepClick,
  canNavigateToStep2,
  canNavigateToStep3,
  onReset,
  onOpenMobileModal,
  onNext,
  nextLabel = 'Next',
  isNextDisabled = false,
}) => {
  const getHeaderTitle = () => {
    switch (currentStep) {
      case 1:
        return 'New Post';
      case 2:
        return 'Edit Mockup';
      case 3:
        return 'Share';
    }
  };

  return (
    <header className="shrink-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-lg mx-auto px-3 h-12 flex items-center justify-between">
        {/* Left Action: Brand Logo / Back Button */}
        <div className="flex items-center min-w-[70px]">
          {currentStep === 1 ? (
            <div className="flex items-center space-x-1.5">
              <div className="w-6 h-6 rounded-lg bg-[#FF4800] flex items-center justify-center font-black text-[10px] text-white shadow-sm">
                AM
              </div>
              <span className="font-black text-slate-900 tracking-tight text-xs uppercase">
                Allmax
              </span>
            </div>
          ) : (
            <button
              onClick={() => onStepClick((currentStep - 1) as 1 | 2)}
              className="flex items-center space-x-0.5 text-xs font-black text-slate-800 hover:text-[#FF4800] active:scale-95 py-1 px-1 rounded-md"
            >
              <ChevronLeft className="w-4 h-4 stroke-[3]" />
              <span>Back</span>
            </button>
          )}
        </div>

        {/* Center Step Title (Instagram Reel Style) */}
        <div className="text-center flex-1">
          <span className="font-black text-xs sm:text-sm text-slate-900 tracking-tight block">
            {getHeaderTitle()}
          </span>
          <span className="text-[9px] text-slate-400 font-bold block -mt-0.5">
            Step {currentStep} of 3
          </span>
        </div>

        {/* Right Action: Next Button / Android APK Modal Trigger */}
        <div className="flex items-center justify-end min-w-[70px] space-x-1">
          {currentStep === 1 && (
            <>
              <button
                onClick={onOpenMobileModal}
                className="p-1 text-slate-400 hover:text-[#FF4800] rounded-md transition-colors"
                title="Download APK"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onNext}
                disabled={isNextDisabled || !canNavigateToStep2}
                className={`text-xs font-black uppercase tracking-wider px-2 py-1 rounded-md transition-all ${
                  canNavigateToStep2 && !isNextDisabled
                    ? 'text-[#FF4800] hover:text-[#E63E00] active:scale-95'
                    : 'text-slate-300 opacity-40 cursor-not-allowed'
                }`}
              >
                Next →
              </button>
            </>
          )}

          {currentStep === 2 && (
            <button
              onClick={onNext}
              disabled={isNextDisabled}
              className="text-xs font-black uppercase tracking-wider text-[#FF4800] hover:text-[#E63E00] px-2 py-1 rounded-md transition-all active:scale-95 disabled:opacity-40"
            >
              {nextLabel} →
            </button>
          )}

          {currentStep === 3 && (
            <button
              onClick={onReset}
              className="text-xs font-black uppercase tracking-wider text-slate-700 hover:text-slate-900 px-2 py-1"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
