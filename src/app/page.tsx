'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { HomeScreen } from '@/components/HomeScreen';
import { MediaCaptureStep } from '@/components/MediaCaptureStep';
import { ProductOverlayStudio, ProductOverlayStudioRef } from '@/components/ProductOverlayStudio';
import { ExportPublishStep } from '@/components/ExportPublishStep';
import { MobileAppModal } from '@/components/MobileAppModal';
import { AppIntroSplash } from '@/components/AppIntroSplash';
import {
  MediaItem,
  AllmaxProduct,
  RenderResult,
  CreatorProfile,
  PostHistoryItem,
} from '@/types';
import { ALLMAX_PRODUCTS } from '@/data/allmaxProducts';

const DEFAULT_PROFILE: CreatorProfile = {
  studioName: "Alex's Studio",
  handle: '@alex_lifts_allmax',
  promoCode: 'ALEX15 • 20% OFF',
};

const DEFAULT_HISTORY: PostHistoryItem[] = [
  {
    id: 'post-init-1',
    productName: 'ISOFLEX Whey Isolate',
    mediaType: 'video',
    createdAt: '2 days ago',
    saves: 482,
    codeUses: 47,
  },
  {
    id: 'post-init-2',
    productName: 'IMPACT IGNITER Pre',
    mediaType: 'video',
    createdAt: '5 days ago',
    saves: 364,
    codeUses: 33,
  },
  {
    id: 'post-init-3',
    productName: 'AMINOCORE BCAA',
    mediaType: 'image',
    createdAt: '1 week ago',
    saves: 228,
    codeUses: 22,
  },
];

export default function HomePage() {
  const [showIntro, setShowIntro] = useState<boolean>(true);
  const [activeView, setActiveView] = useState<'home' | 'studio'>('home');
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);

  const [profile, setProfile] = useState<CreatorProfile>(DEFAULT_PROFILE);
  const [postHistory, setPostHistory] = useState<PostHistoryItem[]>(DEFAULT_HISTORY);

  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<AllmaxProduct>(ALLMAX_PRODUCTS[0]);
  const [renderResult, setRenderResult] = useState<RenderResult | null>(null);

  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [renderProgress, setRenderProgress] = useState<number>(0);

  const studioRef = useRef<ProductOverlayStudioRef | null>(null);

  // Hydrate creator profile & post history from localStorage
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('allmax_creator_profile');
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }
      const savedHistory = localStorage.getItem('allmax_post_history');
      if (savedHistory) {
        setPostHistory(JSON.parse(savedHistory));
      }
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }, []);

  const handleUpdateProfile = (nextProfile: CreatorProfile) => {
    setProfile(nextProfile);
    try {
      localStorage.setItem('allmax_creator_profile', JSON.stringify(nextProfile));
    } catch {
      // Ignore
    }
  };

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

    // Record newly generated post in Post History
    const newItem: PostHistoryItem = {
      id: 'post-' + Date.now(),
      productName: product.name,
      mediaType: result.mediaType,
      createdAt: 'Just now',
      saves: 0,
      codeUses: 0,
    };
    setPostHistory((prev) => {
      const next = [newItem, ...prev];
      try {
        localStorage.setItem('allmax_post_history', JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  const handleResetToHome = () => {
    setSelectedMedia(null);
    setRenderResult(null);
    setIsRendering(false);
    setCurrentStep(1);
    setActiveView('home');
  };

  const handleStartCreatePost = () => {
    setSelectedMedia(null);
    setRenderResult(null);
    setIsRendering(false);
    setCurrentStep(1);
    setActiveView('studio');
  };

  const handleHeaderNext = () => {
    if (currentStep === 1) {
      handleProceedToStudio();
    } else if (currentStep === 2) {
      studioRef.current?.generateMockup();
    } else if (currentStep === 3) {
      handleResetToHome();
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

      {activeView === 'home' ? (
        <HomeScreen
          profile={profile}
          onUpdateProfile={handleUpdateProfile}
          postHistory={postHistory}
          onCreatePost={handleStartCreatePost}
          onOpenMobileModal={() => setIsMobileModalOpen(true)}
          onReplayIntro={() => setShowIntro(true)}
        />
      ) : (
        <>
          <Navbar
            currentStep={currentStep}
            onStepClick={(step) => {
              if (isRendering) return;
              setCurrentStep(step);
            }}
            canNavigateToStep2={!!selectedMedia}
            canNavigateToStep3={!!renderResult}
            onReset={handleResetToHome}
            onGoHome={() => {
              if (isRendering) return;
              setActiveView('home');
            }}
            onOpenMobileModal={() => setIsMobileModalOpen(true)}
            onNext={handleHeaderNext}
            nextLabel={getNextLabel()}
            isNextDisabled={
              (currentStep === 1 && !selectedMedia) ||
              (currentStep === 2 && isRendering)
            }
          />

          <main className="flex-1 min-h-0 w-full max-w-lg mx-auto flex flex-col overflow-hidden">
            {/* Step 1: Media Capture or Selection */}
            {currentStep === 1 && (
              <MediaCaptureStep
                selectedMedia={selectedMedia}
                onMediaSelected={handleMediaSelected}
                onProceedToStudio={handleProceedToStudio}
              />
            )}

            {/* Step 2: Overlay Studio & Rendering Modal */}
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

            {/* Step 3: Export & Share */}
            {currentStep === 3 && renderResult && (
              <ExportPublishStep
                renderResult={renderResult}
                product={selectedProduct}
                onTweakPosition={() => setCurrentStep(2)}
                onNewMockup={handleResetToHome}
              />
            )}
          </main>
        </>
      )}

      {/* Mobile App Modal (iOS & Android) */}
      <MobileAppModal
        isOpen={isMobileModalOpen}
        onClose={() => setIsMobileModalOpen(false)}
      />
    </div>
  );
}
