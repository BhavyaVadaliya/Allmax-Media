'use client';

import React from 'react';

interface NavbarProps {
  currentStep: 1 | 2 | 3;
  onStepClick?: (step: 1 | 2 | 3) => void;
  canNavigateToStep2?: boolean;
  canNavigateToStep3?: boolean;
  onReset?: () => void;
  onOpenMobileModal: () => void;
  onNext?: () => void;
  nextLabel?: string;
  isNextDisabled?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentStep,
  onOpenMobileModal,
}) => {
  const getHeaderTitle = () => {
    switch (currentStep) {
      case 1:
        return 'New Post';
      case 2:
        return 'Edit Mockup';
      case 3:
        return 'New Post';
    }
  };

  return (
    <header className="shrink-0 z-50 bg-white border-b border-slate-200 safe-top">
      <div className="max-w-lg mx-auto px-4 h-12 flex items-center justify-between">
        {/* Left Action: Brand Logo with AM mark across all screens */}
        <div className="flex items-center min-w-[80px]">
          <div
            className="flex items-center space-x-1.5 cursor-pointer active:scale-95 transition-transform"
            onClick={onOpenMobileModal}
            title="Allmax Studio Mobile App"
          >
            <div className="w-6 h-6 rounded-full bg-[#FF4800] flex items-center justify-center font-black text-[10px] text-white shadow-sm">
              AM
            </div>
            <span className="font-black text-slate-900 tracking-tight text-xs uppercase">
              ALLMAX
            </span>
          </div>
        </div>

        {/* Center Title (Instagram Style: Step title + Step indicator) */}
        <div className="text-center flex-1">
          <span className="font-black text-xs sm:text-sm text-slate-900 tracking-tight block">
            {getHeaderTitle()}
          </span>
          <span className="text-[10px] text-slate-400 font-bold block -mt-0.5">
            Step {currentStep} of 3
          </span>
        </div>

        {/* Right Action: Clean balanced space across all screens */}
        <div className="flex items-center justify-end min-w-[80px]" />
      </div>
    </header>
  );
};
