'use client';

import React, { useState, useRef } from 'react';
import { Navbar } from '@/components/Navbar';
import { MediaCaptureStep } from '@/components/MediaCaptureStep';
import { ProductOverlayStudio, ProductOverlayStudioRef } from '@/components/ProductOverlayStudio';
import { ExportPublishStep } from '@/components/ExportPublishStep';
import { MobileAppModal } from '@/components/MobileAppModal';
import { AppIntroSplash } from '@/components/AppIntroSplash';
import { MediaItem, AllmaxProduct, RenderResult } from '@/types';
import { ALLMAX_PRODUCTS } from '@/data/allmaxProducts';

export default function HomePage() {
  const [showIntro, setShowIntro] = useState<boolean>(true);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);

  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<AllmaxProduct>(ALLMAX_PRODUCTS[0]);
  const [renderResult, setRenderResult] = useState<RenderResult | null>(null);

  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [renderProgress, setRenderProgress] = useState<number>(0);

  const studioRef = useRef<ProductOverlayStudioRef | null>(null);

  const handleMediaSelected = (media: MediaItem | null) => {
    setSelectedMedia(media);
  };

  const handleProceedToStudio = () => {
    if (selectedMedia) {
      setCurrentStep(2);
    }
  };

  const handleMockupGenerated = (result: RenderResult, product: AllmaxProduct) => {
    setRenderResult(result);
    setSelectedProduct(product);
    setCurrentStep(3);
  };

  const handleReset = () => {
    setSelectedMedia(null);
    setRenderResult(null);
    setIsRendering(false);
    setCurrentStep(1);
  };

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
      return isRendering ? `${renderProgress}%` : 'NEXT';
    }
    if (currentStep === 3) {
      return 'DONE';
    }
    return 'NEXT';
  };

  return (
    <div className="h-full w-full flex flex-col bg-white text-slate-900 overflow-hidden select-none">
      {showIntro && <AppIntroSplash onComplete={() => setShowIntro(false)} />}
      <Navbar
        currentStep={currentStep}
        onStepClick={(step) => {
          if (isRendering) return;
          setCurrentStep(step);
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

      <main className="flex-1 min-h-0 w-full max-w-lg mx-auto flex flex-col overflow-hidden">
        {/* Step 1: Media Capture or Selection (Matches Phone 1 & 2) */}
        {currentStep === 1 && (
          <MediaCaptureStep
            selectedMedia={selectedMedia}
            onMediaSelected={handleMediaSelected}
            onProceedToStudio={handleProceedToStudio}
          />
        )}

        {/* Step 2: Overlay Studio & Rendering Modal (Matches Phone 3 & 4) */}
        {currentStep === 2 && selectedMedia && (
          <ProductOverlayStudio
            ref={studioRef}
            media={selectedMedia}
            onMockupGenerated={handleMockupGenerated}
            onBackToMedia={() => {
              if (isRendering) return;
              setCurrentStep(1);
            }}
            onRenderingChange={(rendering, progress) => {
              setIsRendering(rendering);
              setRenderProgress(progress);
            }}
          />
        )}

        {/* Step 3: Export & Share (Matches Phone 5) */}
        {currentStep === 3 && renderResult && (
          <ExportPublishStep
            renderResult={renderResult}
            product={selectedProduct}
            onTweakPosition={() => setCurrentStep(2)}
            onNewMockup={handleReset}
          />
        )}
      </main>

      {/* Android Mobile App Modal */}
      <MobileAppModal
        isOpen={isMobileModalOpen}
        onClose={() => setIsMobileModalOpen(false)}
      />
    </div>
  );
}
