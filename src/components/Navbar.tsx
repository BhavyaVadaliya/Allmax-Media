'use client';

import React from 'react';
import { ChevronLeft } from 'lucide-react';

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
  nextLabel = 'NEXT',
  isNextDisabled = false,
}) => {
  const getHeaderTitle = () => {
    switch (currentStep) {
      case 1:
        return 'New Post';
      case 2:
        return 'Edit Mockup';
      case 3:
        return '';
    }
  };

  return (
    <header className="shrink-0 z-50 bg-white border-b border-slate-200">
      <div className="max-w-lg mx-auto px-4 h-12 flex items-center justify-between">
        {/* Left Action: Brand Logo (Step 1) or Back Button (Step 2 & 3) */}
        <div className="flex items-center min-w-[80px]">
          {currentStep === 1 ? (
            <div className="flex items-center space-x-1.5 cursor-pointer" onClick={onOpenMobileModal}>
              <div className="w-6 h-6 rounded-full bg-[#FF4800] flex items-center justify-center font-black text-[10px] text-white shadow-sm">
                AM
              </div>
              <span className="font-black text-slate-900 tracking-tight text-xs uppercase">
                ALLMAX
              </span>
            </div>
          ) : (
            <button
              onClick={() => onStepClick((currentStep - 1) as 1 | 2)}
              className="flex items-center space-x-0.5 text-xs font-black text-slate-900 hover:text-[#FF4800] active:scale-95 py-1"
            >
              <ChevronLeft className="w-4 h-4 stroke-[3]" />
              <span>Back</span>
            </button>
          )}
        </div>

        {/* Center Title (Instagram Style: Step title + Step indicator) */}
        {currentStep !== 3 ? (
          <div className="text-center flex-1">
            <span className="font-black text-xs sm:text-sm text-slate-900 tracking-tight block">
              {getHeaderTitle()}
            </span>
            <span className="text-[10px] text-slate-400 font-bold block -mt-0.5">
              Step {currentStep} of 3
            </span>
          </div>
        ) : (
          <div className="flex-1" />
        )}

        {/* Right Action: Next Button / DONE */}
        <div className="flex items-center justify-end min-w-[80px]">
          {currentStep === 1 && (
            canNavigateToStep2 && !isNextDisabled ? (
              <button
                onClick={onNext}
                className="text-xs font-black uppercase tracking-wider text-[#FF4800] hover:text-[#E63E00] px-2 py-1 transition-all active:scale-95 flex items-center space-x-0.5"
              >
                <span>NEXT</span>
                <span className="text-sm">→</span>
              </button>
            ) : (
              <button
                disabled
                className="text-xs font-bold bg-slate-200 text-slate-400 px-3.5 py-1 rounded-full cursor-not-allowed"
              >
                Next
              </button>
            )
          )}

          {currentStep === 2 && (
            <button
              onClick={onNext}
              disabled={isNextDisabled}
              className="text-xs font-black uppercase tracking-wider text-[#FF4800] hover:text-[#E63E00] px-2 py-1 transition-all active:scale-95 disabled:opacity-40 flex items-center space-x-0.5"
            >
              <span>{nextLabel}</span>
              <span className="text-sm">→</span>
            </button>
          )}

          {currentStep === 3 && (
            <button
              onClick={onReset}
              className="text-xs font-black uppercase tracking-wider text-slate-900 hover:text-slate-600 px-2 py-1 active:scale-95"
            >
              DONE
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
