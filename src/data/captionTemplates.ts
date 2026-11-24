import { AllmaxProduct, CaptionTemplate } from '@/types';

export function getCaptionTemplates(product: AllmaxProduct): CaptionTemplate[] {
  return [
    {
      tone: 'gymtok',
      title: 'High-Energy GymTok & Reels',
      iconName: 'Zap',
      caption: `POV: You stopped guessing your macros and switched to professional-grade fuel 🦍🔥

If you're still drinking chalky protein with 10g of hidden carbs, watch this. Upgraded my stack with @allmaxnutrition ${product.name} and the recovery has been night & day.

${product.heroBadge}
Pure results. No fillers. 

Drop a "🔥" in the comments if you need the full split & stack!`,
      hashtags: [
        '#AllmaxNutrition',
        '#GymTok',
        '#FitTok',
        `#${product.name.replace(/\s+/g, '')}`,
        '#Bodybuilding',
        '#WorkoutMotivation',
        '#FitnessJourney',
        '#GainsCheck',
        '#FitnessCreator',
      ],
    },
    {
      tone: 'athlete',
      title: 'Athlete & Coach Breakdown',
      iconName: 'Dumbbell',
      caption: `Real talk: Quality of fuel determines output. 📊

Here is why I keep @allmaxnutrition ${product.name} locked into my protocol:
✅ ${product.specs[0]?.label || 'Specs'}: ${product.specs[0]?.value || 'Clinical'}
✅ ${product.specs[1]?.label || 'Specs'}: ${product.specs[1]?.value || 'Lab Tested'}
✅ 100% Informed-Choice & CGMP certified purity
✅ Zero proprietary blends or deceptive nitrogen spiking

Whether in off-season surplus or deep in prep, standard of excellence matters. What supplement do you refuse to compromise on?`,
      hashtags: [
        '#AllmaxAthlete',
        '#SportsNutrition',
        `#${product.name.replace(/\s+/g, '')}`,
        '#NutritionTips',
        '#EvidenceBasedFitness',
        '#PerformanceNutrition',
        '#FitnessCoach',
        '#PreWorkoutRoutine',
      ],
    },
    {
      tone: 'promo',
      title: 'Sponsorship & Discount Promo',
      iconName: 'Tag',
      caption: `Level up your stack with the best in the game ⚡️

Proud to represent @allmaxnutrition. You can grab ${product.name} (${product.tagline}) directly through the link in my bio!

🎁 Use my creator code: ALLMAX20 at checkout for an exclusive 20% off your entire order on allmaxnutrition.com.

Stock up before flavors sell out! 📦🛒`,
      hashtags: [
        '#AllmaxNutrition',
        '#AllmaxAmbassador',
        '#FitnessDiscount',
        '#SupplementReview',
        `#${product.name.replace(/\s+/g, '')}`,
        '#FitnessDeals',
        '#Sponsor',
        '#FitnessCommunity',
      ],
    },
    {
      tone: 'aesthetic',
      title: 'Aesthetic Lifestyle & Routine',
      iconName: 'Sparkles',
      caption: `Sunday resets & non-negotiables ✨

Building consistency isn’t complicated when your routine is clean. Post-session fuel powered by @allmaxnutrition ${product.name}. 

Smooth mix, unmatched taste, zero bloat. Taking care of the details so the heavy work takes care of itself. 🕊️🌿`,
      hashtags: [
        '#DailyRoutine',
        '#AestheticFitness',
        '#HealthyLifestyle',
        '#AllmaxNutrition',
        '#WellnessJourney',
        '#PostWorkoutFuel',
        '#CleanEating',
        '#GymAesthetic',
      ],
    },
  ];
}
