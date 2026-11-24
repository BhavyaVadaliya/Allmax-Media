export type MediaSourceType = 'upload' | 'camera' | 'sample';
export type MediaType = 'video' | 'image';

export interface MediaItem {
  id: string;
  type: MediaType;
  sourceType: MediaSourceType;
  url: string;
  blob?: Blob;
  name: string;
  duration?: number;
  width?: number;
  height?: number;
}

export interface AllmaxProduct {
  id: string;
  name: string;
  shortName: string;
  category: 'Protein' | 'Pre-Workout' | 'Creatine & Performance' | 'Mass Gainer' | 'Health & Essentials';
  tagline: string;
  heroBadge: string;
  description: string;
  specs: {
    label: string;
    value: string;
  }[];
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  defaultScale: number;
  allmaxUrl: string;
  svgGraphic: string; // High-res SVG graphic representation of the product tub
}

export type OverlayPositionPreset = 
  | 'bottom-right'
  | 'bottom-left'
  | 'top-right'
  | 'top-left'
  | 'center'
  | 'floating-right';

export interface OverlayConfig {
  productId: string;
  // Position in percentages (0 to 100)
  x: number;
  y: number;
  scale: number; // 0.2 to 1.5
  rotation: number; // -45 to 45 degrees
  opacity: number; // 0.5 to 1.0
  hasDropShadow: boolean;
  hasGlow: boolean;
  preset: OverlayPositionPreset;
  // Optional sticker / badge
  badgeText?: string;
  showBadge: boolean;
  ctaText?: string;
  showCta: boolean;
}

export interface RenderResult {
  url: string;
  blob: Blob;
  mediaType: MediaType;
  filename: string;
  sizeBytes: number;
  durationSeconds?: number;
  originalMedia?: MediaItem;
  config?: OverlayConfig;
  aspectRatio?: '9:16' | '16:9' | '1:1';
}

export type CaptionTone = 'gymtok' | 'athlete' | 'aesthetic' | 'promo';

export interface CaptionTemplate {
  tone: CaptionTone;
  title: string;
  iconName: string;
  caption: string;
  hashtags: string[];
}
