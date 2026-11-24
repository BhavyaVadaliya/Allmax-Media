'use client';

import React from 'react';
import { ExternalLink, RotateCcw, Smartphone } from 'lucide-react';

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
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FF4800] flex items-center justify-center font-black text-sm text-white shadow-sm">
              AM
            </div>
            <div>
              <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg">
                ALLMAX <span className="text-[#FF4800] font-normal">STUDIO</span>
              </span>
            </div>
          </div>

          {/* Clean 3-Step Pill Bar */}
          <div className="flex items-center space-x-1 sm:space-x-2 bg-slate-100 p-1 rounded-full border border-slate-200 text-xs font-semibold">
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

          {/* Right Links & Mobile App Button */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={onOpenMobileModal}
              className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-[#FF4800] border border-orange-200 text-xs font-bold transition-all shadow-sm active:scale-95"
              title="Download Android APK"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#FF4800]" />
              <span className="hidden sm:inline">Mobile App (APK)</span>
              <span className="sm:hidden">App</span>
            </button>

            <a
              href="https://www.allmaxnutrition.com/?srsltid=AYCX9vI7dJ-kF5Gs2UXtTL8axML4QqHT9jfeXM7gU0BOYkLst3aAloCP"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center space-x-1 text-xs text-slate-600 hover:text-slate-900 font-medium"
            >
              <span>allmaxnutrition.com</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            {(canNavigateToStep2 || canNavigateToStep3) && (
              <button
                onClick={onReset}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden lg:inline">Start Over</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
