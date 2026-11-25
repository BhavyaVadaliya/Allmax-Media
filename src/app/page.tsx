'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { HomeScreen } from '@/components/HomeScreen';
import { PostHistoryScreen } from '@/components/PostHistoryScreen';
import { WorkflowOverviewScreen } from '@/components/WorkflowOverviewScreen';
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
  SearchIntentHook,
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
    productName: 'ISOFLEX',
    hookTitle: 'POST-WORKOUT RECOVERY HACK!',
    platforms: ['Instagram Reels', 'TikTok'],
    mediaType: 'video',
    createdAt: 'Nov 22, 2026',
    saves: 418,
    codeUses: 34,
  },
  {
    id: 'post-init-2',
    productName: 'IMPACT IGNITER',
    hookTitle: 'LEG DAY ENERGY & PUMP FORMULA',
    platforms: ['Instagram Reels', 'TikTok'],
    mediaType: 'video',
    createdAt: 'Nov 18, 2026',
    saves: 392,
    codeUses: 27,
  },
  {
    id: 'post-init-3',
    productName: 'AMINOCORE',
    hookTitle: 'ZERO SUGAR INTRA-WORKOUT FUEL',
    platforms: ['Instagram Reels', 'TikTok'],
    mediaType: 'image',
    createdAt: 'Nov 14, 2026',
    saves: 264,
    codeUses: 41,
  },
];

export default function HomePage() {
  const [showIntro, setShowIntro] = useState<boolean>(true);
  const [activeView, setActiveView] = useState<'home' | 'history' | 'overview' | 'studio'>('home');
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);

  const [profile, setProfile] = useState<CreatorProfile>(DEFAULT_PROFILE);
  const [postHistory, setPostHistory] = useState<PostHistoryItem[]>(DEFAULT_HISTORY);

  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<AllmaxProduct>(ALLMAX_PRODUCTS[0]);
  const [selectedHook, setSelectedHook] = useState<SearchIntentHook | null>(null);
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
      productName: product.shortName,
      hookTitle: selectedHook?.title || `${product.shortName} WORKOUT REEL`,
      caption: selectedHook?.script,
      platforms: ['Instagram Reels', 'TikTok'],
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
    setActiveView('overview');
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
          onOpenHistory={() => setActiveView('history')}
          onOpenMobileModal={() => setIsMobileModalOpen(true)}
          onReplayIntro={() => setShowIntro(true)}
        />
      ) : activeView === 'history' ? (
        <PostHistoryScreen
          profile={profile}
          postHistory={postHistory}
          onNewPost={handleStartCreatePost}
          onGoHome={() => setActiveView('home')}
        />
      ) : activeView === 'overview' ? (
        <WorkflowOverviewScreen
          profile={profile}
          onContinue={() => setActiveView('studio')}
          onGoHome={() => setActiveView('home')}
        />
      ) : (
        <>
          <Navbar
            currentStep={currentStep}
            handle={profile.handle}
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
            {/* Step 1: Media Capture or Selection (1.1 SKU -> 1.2 Hook -> 1.3 Clip) */}
            {currentStep === 1 && (
              <MediaCaptureStep
                selectedMedia={selectedMedia}
                onMediaSelected={handleMediaSelected}
                selectedProduct={selectedProduct}
                onSelectProduct={setSelectedProduct}
                selectedHook={selectedHook}
                onSelectHook={setSelectedHook}
                promoCode={profile.promoCode}
                onProceedToStudio={handleProceedToStudio}
                onGoHome={() => setActiveView('home')}
              />
            )}

            {/* Step 2: Overlay Studio & Rendering Modal */}
            {currentStep === 2 && selectedMedia && (
              <ProductOverlayStudio
                ref={studioRef}
                media={selectedMedia}
                initialProduct={selectedProduct}
                selectedHook={selectedHook}
                promoCode={profile.promoCode}
                creatorHandle={profile.handle}
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
                selectedHook={selectedHook}
                promoCode={profile.promoCode}
                creatorHandle={profile.handle}
                onGoToStep1={() => setCurrentStep(1)}
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
