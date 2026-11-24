import { AllmaxProduct } from '@/types';

// Helper to generate crisp, high-fidelity SVG tub graphics for canvas overlays
function createTubSvg(
  name: string,
  subName: string,
  badge: string,
  spec1: string,
  spec2: string,
  primaryColor: string,
  secondaryColor: string,
  accentColor: string,
  tubColor: string = '#121620'
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 520" width="400" height="520">
    <defs>
      <linearGradient id="lidGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#2a2e39"/>
        <stop offset="30%" stop-color="#4a5263"/>
        <stop offset="60%" stop-color="#1f232b"/>
        <stop offset="100%" stop-color="#0e1117"/>
      </linearGradient>
      <linearGradient id="tubGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${tubColor}"/>
        <stop offset="25%" stop-color="#222838"/>
        <stop offset="50%" stop-color="${tubColor}"/>
        <stop offset="85%" stop-color="#0a0d14"/>
        <stop offset="100%" stop-color="#04060a"/>
      </linearGradient>
      <linearGradient id="labelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${primaryColor}"/>
        <stop offset="100%" stop-color="${secondaryColor}"/>
      </linearGradient>
      <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${accentColor}"/>
        <stop offset="100%" stop-color="#ffffff"/>
      </linearGradient>
      <linearGradient id="glossHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35"/>
        <stop offset="40%" stop-color="#ffffff" stop-opacity="0.05"/>
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
      </linearGradient>
      <filter id="tubShadow" x="-10%" y="-10%" width="120%" height="130%">
        <feDropShadow dx="0" dy="16" stdDeviation="14" flood-color="#000000" flood-opacity="0.6"/>
      </filter>
    </defs>

    <!-- Tub Body with shadow -->
    <g filter="url(#tubShadow)">
      <!-- Lid -->
      <path d="M 120 40 L 280 40 Q 295 40 295 55 L 295 85 Q 295 95 280 95 L 120 95 Q 105 95 105 85 L 105 55 Q 105 40 120 40 Z" fill="url(#lidGrad)"/>
      <!-- Lid Ridges -->
      <line x1="130" y1="52" x2="130" y2="82" stroke="#64748b" stroke-width="2" stroke-linecap="round"/>
      <line x1="150" y1="52" x2="150" y2="82" stroke="#64748b" stroke-width="2" stroke-linecap="round"/>
      <line x1="170" y1="52" x2="170" y2="82" stroke="#64748b" stroke-width="2" stroke-linecap="round"/>
      <line x1="230" y1="52" x2="230" y2="82" stroke="#64748b" stroke-width="2" stroke-linecap="round"/>
      <line x1="250" y1="52" x2="250" y2="82" stroke="#64748b" stroke-width="2" stroke-linecap="round"/>
      <line x1="270" y1="52" x2="270" y2="82" stroke="#64748b" stroke-width="2" stroke-linecap="round"/>

      <!-- Neck -->
      <path d="M 115 95 L 285 95 L 295 125 L 105 125 Z" fill="#1e2430"/>

      <!-- Main Tub Silhouette -->
      <path d="M 85 130 Q 80 145 75 220 L 75 420 Q 75 470 125 475 L 275 475 Q 325 470 325 420 L 325 220 Q 320 145 315 130 Z" fill="url(#tubGrad)"/>

      <!-- Label Background -->
      <path d="M 76 160 Q 75 200 75 390 L 325 390 Q 325 200 324 160 Z" fill="url(#labelGrad)"/>

      <!-- Gloss light reflection down left side -->
      <path d="M 85 135 L 125 135 L 115 465 L 85 460 Z" fill="url(#glossHighlight)"/>

      <!-- Allmax Official Banner at Top of Label -->
      <rect x="75" y="160" width="250" height="34" fill="#0b0f19" opacity="0.95"/>
      <!-- ALLMAX Logo Text -->
      <text x="200" y="184" font-family="Arial, sans-serif" font-weight="900" font-size="20" fill="#ffffff" text-anchor="middle" letter-spacing="3">
        ALLMAX
      </text>
      <circle cx="270" cy="174" r="3" fill="${accentColor}"/>

      <!-- Subtitle category -->
      <text x="200" y="212" font-family="Arial, sans-serif" font-weight="700" font-size="11" fill="${accentColor}" text-anchor="middle" letter-spacing="2">
        PROFESSIONAL GRADE SUPPLEMENTS
      </text>

      <!-- Main Product Title -->
      <text x="200" y="260" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-size="34" fill="#ffffff" text-anchor="middle" letter-spacing="1">
        ${name}
      </text>

      <!-- Sub-label / Description -->
      <text x="200" y="286" font-family="Arial, sans-serif" font-weight="800" font-size="13" fill="#e2e8f0" text-anchor="middle" letter-spacing="1">
        ${subName.toUpperCase()}
      </text>

      <!-- Badge Strip -->
      <rect x="95" y="302" width="210" height="26" rx="13" fill="#090d16" stroke="${accentColor}" stroke-width="1.5"/>
      <text x="200" y="320" font-family="Arial, sans-serif" font-weight="800" font-size="11" fill="${accentColor}" text-anchor="middle" letter-spacing="1">
        ★ ${badge.toUpperCase()} ★
      </text>

      <!-- Key Specs Pill 1 -->
      <rect x="95" y="338" width="98" height="36" rx="6" fill="#000000" opacity="0.6"/>
      <text x="144" y="354" font-family="Arial, sans-serif" font-weight="900" font-size="14" fill="#ffffff" text-anchor="middle">
        ${spec1}
      </text>
      <text x="144" y="367" font-family="Arial, sans-serif" font-weight="700" font-size="8" fill="#94a3b8" text-anchor="middle">
        PURITY VERIFIED
      </text>

      <!-- Key Specs Pill 2 -->
      <rect x="207" y="338" width="98" height="36" rx="6" fill="#000000" opacity="0.6"/>
      <text x="256" y="354" font-family="Arial, sans-serif" font-weight="900" font-size="14" fill="${accentColor}" text-anchor="middle">
        ${spec2}
      </text>
      <text x="256" y="367" font-family="Arial, sans-serif" font-weight="700" font-size="8" fill="#94a3b8" text-anchor="middle">
        LAB TESTED
      </text>

      <!-- Bottom Quality Seals -->
      <rect x="75" y="390" width="250" height="24" fill="#0b0f19" opacity="0.9"/>
      <text x="200" y="406" font-family="Arial, sans-serif" font-weight="700" font-size="9" fill="#94a3b8" text-anchor="middle" letter-spacing="1.5">
        INFORMED-CHOICE • CGMP CERTIFIED
      </text>

      <!-- Tub Bottom Rim -->
      <ellipse cx="200" cy="470" rx="95" ry="12" fill="#0e121a"/>
      <ellipse cx="200" cy="466" rx="90" ry="8" fill="#1b212f" opacity="0.6"/>
    </g>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const ALLMAX_PRODUCTS: AllmaxProduct[] = [
  {
    id: 'isoflex',
    name: 'ISOFLEX',
    shortName: 'ISOFLEX Whey Isolate',
    category: 'Protein',
    tagline: '100% Pure Whey Protein Isolate',
    heroBadge: '27G PROTEIN • 0G SUGAR',
    description: 'The pinnacle of pure whey protein. Cold-filtered ion-exchange isolate delivering 27g protein with zero fat, zero sugar, and fast digestive absorption.',
    specs: [
      { label: 'Protein', value: '27g' },
      { label: 'Sugar', value: '0g' },
      { label: 'Yield', value: '90%' },
      { label: 'Calories', value: '115' },
    ],
    primaryColor: '#0047BA',
    secondaryColor: '#002B7A',
    accentColor: '#38BDF8',
    defaultScale: 0.38,
    allmaxUrl: 'https://www.allmaxnutrition.com/products/isoflex-whey-protein-isolate',
    svgGraphic: createTubSvg(
      'ISOFLEX',
      '100% Pure Whey Isolate',
      '27G PROTEIN • 0G SUGAR',
      '27g PROTEIN',
      '0g SUGAR',
      '#0038A8',
      '#001C5E',
      '#38BDF8',
      '#0f1422'
    ),
  },
  {
    id: 'allwhey-gold',
    name: 'ALLWHEY GOLD',
    shortName: 'ALLWHEY Gold Matrix',
    category: 'Protein',
    tagline: '100% Whey Protein Blend',
    heroBadge: '24G PROTEIN • PREMIUM WHEY',
    description: 'An elite multi-stage whey protein matrix blending cross-flow microfiltered whey isolate and whey concentrate for unmatched taste and recovery.',
    specs: [
      { label: 'Protein', value: '24g' },
      { label: 'BCAAs', value: '5.5g' },
      { label: 'Enzymes', value: 'Digestive+' },
      { label: 'Taste', value: 'Gourmet' },
    ],
    primaryColor: '#171C26',
    secondaryColor: '#090C12',
    accentColor: '#F59E0B',
    defaultScale: 0.38,
    allmaxUrl: 'https://www.allmaxnutrition.com/products/allwhey-gold',
    svgGraphic: createTubSvg(
      'ALLWHEY GOLD',
      '100% Whey Protein Matrix',
      '24G PROTEIN • 5.5G BCAAS',
      '24g PROTEIN',
      'GOLD SERIES',
      '#1a1f2c',
      '#0b0e14',
      '#F59E0B',
      '#0a0d13'
    ),
  },
  {
    id: 'impact-igniter',
    name: 'IMPACT IGNITER',
    shortName: 'Impact Igniter Pre-Workout',
    category: 'Pre-Workout',
    tagline: 'Explosive Energy & Skin-Splitting Pumps',
    heroBadge: 'CLINICAL DOSES • INTENSE ENERGY',
    description: 'Engineered for extreme performance. Packed with 6000mg L-Citrulline, Beta-Alanine, and sustained caffeine matrix for raw power and focus.',
    specs: [
      { label: 'Citrulline', value: '6000mg' },
      { label: 'Beta-Alanine', value: '3200mg' },
      { label: 'Caffeine', value: '400mg' },
      { label: 'Focus', value: 'Lion’s Mane' },
    ],
    primaryColor: '#DC2626',
    secondaryColor: '#7F1D1D',
    accentColor: '#FBBF24',
    defaultScale: 0.35,
    allmaxUrl: 'https://www.allmaxnutrition.com/products/impact-igniter-xtreme',
    svgGraphic: createTubSvg(
      'IMPACT IGNITER',
      'Explosive Pre-Workout',
      '6G CITRULLINE • RAW PUMP',
      '6000mg PUMP',
      'MAX ENERGY',
      '#B91C1C',
      '#450A0A',
      '#FBBF24',
      '#12080a'
    ),
  },
  {
    id: 'creatine-monohydrate',
    name: 'CREATINE',
    shortName: '100% Pure Micronized Creatine',
    category: 'Creatine & Performance',
    tagline: 'Pharmaceutical Grade Micronized Creatine',
    heroBadge: '5G CREATINE • CLINICALLY PROVEN',
    description: 'Pure German-standard micronized creatine monohydrate. Increases cellular ATP output, muscle volume, and peak explosive power.',
    specs: [
      { label: 'Creatine', value: '5000mg' },
      { label: 'Purity', value: '100%' },
      { label: 'Particle Size', value: 'Micronized' },
      { label: 'Servings', value: '80+' },
    ],
    primaryColor: '#0284C7',
    secondaryColor: '#0369A1',
    accentColor: '#E0F2FE',
    defaultScale: 0.35,
    allmaxUrl: 'https://www.allmaxnutrition.com/products/creatine-monohydrate',
    svgGraphic: createTubSvg(
      'CREATINE',
      '100% Pure Micronized',
      '5G CREATINE • MAX ATP',
      '5000mg CREATINE',
      '100% PURE',
      '#0369A1',
      '#082F49',
      '#38BDF8',
      '#101726'
    ),
  },
  {
    id: 'aminocore',
    name: 'AMINOCORE',
    shortName: 'AMINOCORE Instantized BCAAs',
    category: 'Creatine & Performance',
    tagline: '8,180mg Pure Intra-Workout BCAA Matrix',
    heroBadge: '45:30:25 RATIO • ZERO SUGAR',
    description: 'Features a clinically researched 45:30:25 BCAA ratio with fortified B-vitamins for enhanced intra-workout muscle preservation and fatigue reduction.',
    specs: [
      { label: 'BCAAs', value: '8,180mg' },
      { label: 'Leucine', value: '3,681mg' },
      { label: 'Sugar', value: '0g' },
      { label: 'Vitamins', value: 'B6, B9, B12' },
    ],
    primaryColor: '#059669',
    secondaryColor: '#064E3B',
    accentColor: '#34D399',
    defaultScale: 0.35,
    allmaxUrl: 'https://www.allmaxnutrition.com/products/aminocore',
    svgGraphic: createTubSvg(
      'AMINOCORE',
      'Instantized BCAA 8.18g',
      '45:30:25 RATIO • 0G SUGAR',
      '8,180mg BCAA',
      'ANTI-CATABOLIC',
      '#047857',
      '#064E3B',
      '#34D399',
      '#0b1612'
    ),
  },
  {
    id: 'quickmass',
    name: 'QUICKMASS',
    shortName: 'QUICKMASS Rapid Mass Gainer',
    category: 'Mass Gainer',
    tagline: 'The Heavyweight Athletic Mass Gainer',
    heroBadge: '1010 CALORIES • 60G PROTEIN',
    description: 'Designed for serious athletes and hard-gainers. Delivers 1,010 clean calories, 60g 8-stage Octapro protein, and complex Carb-10 for rapid, lean muscle gains.',
    specs: [
      { label: 'Calories', value: '1,010' },
      { label: 'Protein', value: '60g' },
      { label: 'Carbs', value: 'Carb-10' },
      { label: 'Sugar', value: 'Only 3g' },
    ],
    primaryColor: '#18181B',
    secondaryColor: '#09090B',
    accentColor: '#EAB308',
    defaultScale: 0.42,
    allmaxUrl: 'https://www.allmaxnutrition.com/products/quickmass',
    svgGraphic: createTubSvg(
      'QUICKMASS',
      'Rapid Mass Gainer',
      '1010 CALORIES • 60G PROTEIN',
      '1010 KCAL',
      '60g PROTEIN',
      '#18181b',
      '#09090b',
      '#EAB308',
      '#070709'
    ),
  },
  {
    id: 'vitastack',
    name: 'VITASTACK',
    shortName: 'VITASTACK Multi-Pack',
    category: 'Health & Essentials',
    tagline: 'High-Potency Athletic Performance Foundation',
    heroBadge: '9 ACTIVE PILLS • OVER 100 NUTRIENTS',
    description: 'The complete daily pack for elite athletes: high-potency multivitamins, omega fatty acids, joint support, digestive enzymes, and antioxidant complexes.',
    specs: [
      { label: 'Pills/Pack', value: '9 Pills' },
      { label: 'Joint Matrix', value: 'Glucosamine' },
      { label: 'Omega-3', value: 'High Potency' },
      { label: 'Antioxidants', value: 'High-ORAC' },
    ],
    primaryColor: '#475569',
    secondaryColor: '#1E293B',
    accentColor: '#38BDF8',
    defaultScale: 0.36,
    allmaxUrl: 'https://www.allmaxnutrition.com/products/vitastack',
    svgGraphic: createTubSvg(
      'VITASTACK',
      'Athletic Multi-Pack',
      '9 PILLS • 100+ NUTRIENTS',
      'COMPLETE PACK',
      'JOINT & IMMUNITY',
      '#334155',
      '#0f172a',
      '#38BDF8',
      '#0f172a'
    ),
  },
  {
    id: 'glutamine',
    name: 'GLUTAMINE',
    shortName: '100% Fermented L-Glutamine',
    category: 'Creatine & Performance',
    tagline: 'Japanese Grade Fermented L-Glutamine',
    heroBadge: '5G GLUTAMINE • IMMUNE & GUT',
    description: 'Naturally fermented plant-based L-Glutamine. Accelerates muscle tissue repair, promotes intestinal integrity, and minimizes exercise-induced catabolism.',
    specs: [
      { label: 'L-Glutamine', value: '5000mg' },
      { label: 'Source', value: '100% Fermented' },
      { label: 'Allergens', value: 'Zero' },
      { label: 'Purity', value: 'USP Grade' },
    ],
    primaryColor: '#0284C7',
    secondaryColor: '#075985',
    accentColor: '#7DD3FC',
    defaultScale: 0.35,
    allmaxUrl: 'https://www.allmaxnutrition.com/products/glutamine',
    svgGraphic: createTubSvg(
      'GLUTAMINE',
      '100% Fermented USP Grade',
      '5G L-GLUTAMINE • RECOVERY',
      '5000mg GLUTAMINE',
      'GUT & RECOVERY',
      '#0284C7',
      '#0c4a6e',
      '#7DD3FC',
      '#0e1726'
    ),
  },
];

// Curated Gym / Creator sample media for instant testing without camera or file upload
export const SAMPLE_CREATOR_MEDIA = [
  {
    id: 'sample-1',
    name: 'Barbell Bench Press Workout',
    type: 'video' as const,
    sourceType: 'sample' as const,
    url: '/samples/workout1.mp4',
    thumbnail: '/samples/thumb1.jpg',
    description: 'Real gym athlete barbell bench press video',
    duration: 6,
  },
  {
    id: 'sample-2',
    name: 'Barbell Squat Heavy Session',
    type: 'video' as const,
    sourceType: 'sample' as const,
    url: '/samples/workout2.mp4',
    thumbnail: '/samples/thumb2.jpg',
    description: 'Real gym athlete squat power workout video',
    duration: 6,
  },
  {
    id: 'sample-3',
    name: 'Post-Workout Shaker Shot',
    type: 'image' as const,
    sourceType: 'sample' as const,
    url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1080&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80',
    description: 'Clean gym floor aesthetic for product overlay',
  },
  {
    id: 'sample-4',
    name: 'Fitness Training Studio',
    type: 'image' as const,
    sourceType: 'sample' as const,
    url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=1080&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=600&q=80',
    description: 'Athletic barbell & weights floor stage',
  },
];

export const BADGE_OPTIONS = [
  { id: 'allmax-athlete', label: '⚡ ALLMAX ATHLETE' },
  { id: 'pure-whey', label: '🔥 100% PURE ISOLATE' },
  { id: 'clinical', label: '🧬 CLINICALLY DOSED' },
  { id: 'promo-code', label: '🏷️ CODE: ALLMAX20 (-20%)' },
  { id: 'shop-link', label: '🛒 LINK IN BIO TO SHOP' },
  { id: 'fuel-gains', label: '💪 FUEL YOUR GAINS' },
];

export const CTA_OPTIONS = [
  { id: 'swipe-up', label: 'Tap the link in bio' },
  { id: 'use-code', label: 'Use Code ALLMAX20 at checkout' },
  { id: 'official-brand', label: 'Available on allmaxnutrition.com' },
  { id: 'dm-routine', label: 'DM "WORKOUT" for the full stack' },
];
