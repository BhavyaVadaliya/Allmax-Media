'use client';

import React, { useState, useRef } from 'react';
import { Navbar } from '@/components/Navbar';
import { MediaCaptureStep } from '@/components/MediaCaptureStep';
import { ProductOverlayStudio, ProductOverlayStudioRef } from '@/components/ProductOverlayStudio';
import { ExportPublishStep } from '@/components/ExportPublishStep';
import { MobileAppModal } from '@/components/MobileAppModal';
import { MediaItem, AllmaxProduct, RenderResult } from '@/types';
import { ALLMAX_PRODUCTS } from '@/data/allmaxProducts';
import { Smartphone } from 'lucide-react';

export default function HomePage() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);

  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<AllmaxProduct>(ALLMAX_PRODUCTS[0]);
  const [renderResult, setRenderResult] = useState<RenderResult | null>(null);

  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [renderProgress, setRenderProgress] = useState<number>(0);

  const studioRef = useRef<ProductOverlayStudioRef | null>(null);

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
    setIsRendering(false);
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Header "Next" button handler according to current step
  const handleHeaderNext = () => {
    if (currentStep === 1) {
      handleProceedToStudio();
    } else if (currentStep === 2) {
      studioRef.current?.generateMockup();
    } else if (currentStep === 3) {
      handleReset();
    }
  };

  const getNextLabel = () => {
    if (currentStep === 2) {
      return isRendering ? `Rendering (${renderProgress}%)` : 'Next';
    }
    if (currentStep === 3) {
      return 'Done';
    }
    return 'Next';
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 antialiased selection:bg-orange-100 selection:text-orange-900">
      <Navbar
        currentStep={currentStep}
        onStepClick={(step) => {
          if (isRendering) return;
          setCurrentStep(step);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        canNavigateToStep2={!!selectedMedia}
        canNavigateToStep3={!!renderResult}
        onReset={handleReset}
        onOpenMobileModal={() => setIsMobileModalOpen(true)}
        onNext={handleHeaderNext}
        nextLabel={getNextLabel()}
        isNextDisabled={
          (currentStep === 1 && !selectedMedia) ||
          (currentStep === 2 && isRendering)
        }
      />

      <main className="flex-1 px-3 sm:px-4 max-w-xl mx-auto w-full pb-16 sm:pb-24">
        {/* Step 1: Media Capture or Upload (Instagram New Post) */}
        {currentStep === 1 && (
          <MediaCaptureStep
            selectedMedia={selectedMedia}
            onMediaSelected={handleMediaSelected}
            onProceedToStudio={handleProceedToStudio}
          />
        )}

        {/* Step 2: Product Overlay Studio (Instagram Story / Reel Editor) */}
        {currentStep === 2 && selectedMedia && (
          <ProductOverlayStudio
            ref={studioRef}
            media={selectedMedia}
            onMockupGenerated={handleMockupGenerated}
            onBackToMedia={() => {
              if (isRendering) return;
              setCurrentStep(1);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onRenderingChange={(rendering, progress) => {
              setIsRendering(rendering);
              setRenderProgress(progress);
            }}
          />
        )}

        {/* Step 3: Export & Social Launch (Instagram Post Share Screen) */}
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
        <div className="max-w-xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-center sm:text-left">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-800">ALLMAX STUDIO</span>
            <span>•</span>
            <span>Instagram Creator Mockup MVP</span>
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
