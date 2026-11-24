'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { MediaCaptureStep } from '@/components/MediaCaptureStep';
import { ProductOverlayStudio } from '@/components/ProductOverlayStudio';
import { ExportPublishStep } from '@/components/ExportPublishStep';
import { MobileAppModal } from '@/components/MobileAppModal';
import { MediaItem, AllmaxProduct, RenderResult } from '@/types';
import { ALLMAX_PRODUCTS } from '@/data/allmaxProducts';
import { ArrowRight, Smartphone } from 'lucide-react';

export default function HomePage() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);

  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<AllmaxProduct>(ALLMAX_PRODUCTS[0]);
  const [renderResult, setRenderResult] = useState<RenderResult | null>(null);

  const handleMediaSelected = (media: MediaItem) => {
    setSelectedMedia(media);
  };

  const handleProceedToStudio = () => {
    if (selectedMedia) {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleMockupGenerated = (result: RenderResult, product: AllmaxProduct) => {
    setRenderResult(result);
    setSelectedProduct(product);
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setSelectedMedia(null);
    setRenderResult(null);
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 antialiased selection:bg-orange-100 selection:text-orange-900">
      <Navbar
        currentStep={currentStep}
        onStepClick={(step) => {
          setCurrentStep(step);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        canNavigateToStep2={!!selectedMedia}
        canNavigateToStep3={!!renderResult}
        onReset={handleReset}
        onOpenMobileModal={() => setIsMobileModalOpen(true)}
      />

      <main className="flex-1 px-3 sm:px-6 max-w-6xl mx-auto w-full pb-20 sm:pb-24">
        {/* Step 1: Media Capture or Upload */}
        {currentStep === 1 && (
          <div className="space-y-4 sm:space-y-6">
            <MediaCaptureStep
              selectedMedia={selectedMedia}
              onMediaSelected={handleMediaSelected}
            />

            {/* Bottom floating button when media is selected */}
            {selectedMedia && (
              <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white/95 backdrop-blur-md border border-slate-200 p-2 sm:p-2.5 rounded-2xl shadow-xl flex items-center space-x-2.5 max-w-md w-[92%] sm:w-auto safe-bottom">
                <div className="hidden sm:flex items-center space-x-1.5 text-xs text-slate-600 pl-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-bold truncate max-w-[150px]">{selectedMedia.name}</span>
                </div>

                <button
                  onClick={handleProceedToStudio}
                  className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-5 sm:px-6 py-3 sm:py-2.5 rounded-xl bg-[#FF4800] hover:bg-[#E63E00] text-white font-extrabold text-xs uppercase tracking-wider shadow-md shadow-orange-500/20 transition-all active:scale-95"
                >
                  <span>Continue to Product Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Product Overlay Studio */}
        {currentStep === 2 && selectedMedia && (
          <ProductOverlayStudio
            media={selectedMedia}
            onMockupGenerated={handleMockupGenerated}
            onBackToMedia={() => {
              setCurrentStep(1);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* Step 3: Export & Social Launch */}
        {currentStep === 3 && renderResult && (
          <ExportPublishStep
            renderResult={renderResult}
            product={selectedProduct}
            onTweakPosition={() => {
              setCurrentStep(2);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNewMockup={handleReset}
          />
        )}
      </main>

      {/* Clean Minimalist Footer with Mobile App Banner */}
      <footer className="border-t border-slate-200 bg-white py-4 sm:py-5 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-center sm:text-left">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-800">ALLMAX STUDIO</span>
            <span>•</span>
            <span>Video Mockup Service MVP</span>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={() => setIsMobileModalOpen(true)}
              className="flex items-center space-x-1 text-slate-600 hover:text-[#FF4800] transition-colors font-semibold"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#FF4800]" />
              <span>Android App (.apk)</span>
            </button>

            <span>•</span>

            <a
              href="https://www.allmaxnutrition.com/?srsltid=AYCX9vI7dJ-kF5Gs2UXtTL8axML4QqHT9jfeXM7gU0BOYkLst3aAloCP"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-[#FF4800] transition-colors"
            >
              allmaxnutrition.com
            </a>
          </div>
        </div>
      </footer>

      {/* Android Mobile App Modal */}
      <MobileAppModal
        isOpen={isMobileModalOpen}
        onClose={() => setIsMobileModalOpen(false)}
      />
    </div>
  );
}
