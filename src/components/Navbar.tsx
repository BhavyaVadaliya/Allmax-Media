'use client';

import React from 'react';
import { ChevronLeft, X, Smartphone, ArrowRight } from 'lucide-react';

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
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-xl mx-auto px-4 h-13 flex items-center justify-between">
        {/* Left Action: Close / Back / Reset */}
        <div className="flex items-center min-w-[70px]">
          {currentStep === 1 ? (
            <div className="flex items-center space-x-1.5">
              <div className="w-6 h-6 rounded-md bg-[#FF4800] flex items-center justify-center font-black text-[10px] text-white">
                AM
              </div>
              <span className="font-extrabold text-slate-900 tracking-tight text-xs uppercase">
                Allmax
              </span>
            </div>
          ) : (
            <button
              onClick={() => onStepClick((currentStep - 1) as 1 | 2)}
              className="flex items-center space-x-0.5 text-xs font-bold text-slate-700 hover:text-slate-900 active:scale-95"
            >
              <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
              <span>Back</span>
            </button>
          )}
        </div>

        {/* Center Title (Instagram Style) */}
        <div className="text-center flex-1">
          <span className="font-extrabold text-sm text-slate-900 tracking-tight block">
            {getHeaderTitle()}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold block -mt-0.5">
            Step {currentStep} of 3
          </span>
        </div>

        {/* Right Action: Next Button / Download / APK */}
        <div className="flex items-center justify-end min-w-[70px] space-x-1">
          {currentStep === 1 && (
            <button
              onClick={onNext}
              disabled={isNextDisabled || !canNavigateToStep2}
              className={`text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-md transition-all ${
                canNavigateToStep2 && !isNextDisabled
                  ? 'text-[#FF4800] hover:text-[#E63E00] active:scale-95'
                  : 'text-slate-300 opacity-40 cursor-not-allowed'
              }`}
            >
              Next →
            </button>
          )}

          {currentStep === 2 && (
            <button
              onClick={onNext}
              disabled={isNextDisabled}
              className="text-xs font-black uppercase tracking-wider text-[#FF4800] hover:text-[#E63E00] px-2.5 py-1 rounded-md transition-all active:scale-95 disabled:opacity-40"
            >
              {nextLabel} →
            </button>
          )}

          {currentStep === 3 && (
            <button
              onClick={onReset}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 px-2 py-1"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
