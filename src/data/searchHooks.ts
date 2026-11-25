import { AllmaxProduct, SearchIntentHook } from '@/types';

/**
 * Generates compliance-checked, high-converting Search-Intent Hooks
 * tailored to the selected Allmax product SKU and creator promo code.
 */
export function getSearchHooksForProduct(
  product: AllmaxProduct,
  promoCodeRaw: string = 'ALEX15 • 20% OFF'
): SearchIntentHook[] {
  const code = promoCodeRaw.split('•')[0].trim() || 'ALEX15';
  const specSummary = product.specs
    .slice(0, 2)
    .map((s) => `${s.value} ${s.label.toLowerCase()}`)
    .join(' with ');

  switch (product.category) {
    case 'Protein':
      return [
        {
          id: `${product.id}-hook-1`,
          query: 'BEST WHEY ISOLATE FOR SENSITIVE STOMACHS',
          title: 'POST-WORKOUT RECOVERY HACK!',
          highlightPhrase: specSummary || '27g pure whey isolate with 0g sugar',
          script: `If regular protein leaves you heavy, switch to Allmax ${product.shortName}. You get ${specSummary || '27 grams of pure cold-filtered whey isolate with zero sugar'}. Use my code ${code} at checkout for 20% off your next tub.`,
        },
        {
          id: `${product.id}-hook-2`,
          query: 'CLEANEST ZERO SUGAR PROTEIN POWDER',
          title: `${product.specs[0]?.value || '27G'} PROTEIN • ${product.specs[1]?.value || '0G'} SUGAR EXPLAINED`,
          highlightPhrase: `${product.tagline}`,
          script: `Here is why I never skip Allmax ${product.shortName} right after training. Every scoop delivers ${specSummary} with zero filler. Grab yours with code ${code} and save 20%.`,
        },
        {
          id: `${product.id}-hook-3`,
          query: 'HIGH PROTEIN LOW CALORIE SHAKE RECIPE',
          title: 'STOP DRINKING CHALKY SHAKES',
          highlightPhrase: `Lab-tested ${product.shortName}`,
          script: `Stop wasting macros on cheap blends. Allmax ${product.shortName} mixes smooth in 5 seconds and gives you clean fuel for lean muscle recovery. Tap my link and use ${code}.`,
        },
      ];

    case 'Pre-Workout':
      return [
        {
          id: `${product.id}-hook-1`,
          query: 'BEST PRE WORKOUT FOR INSANE FOCUS & PUMP',
          title: 'NO-CRASH TRAINING ENERGY',
          highlightPhrase: specSummary || 'clinical doses with zero crash',
          script: `Need clean energy before heavy sets? One scoop of Allmax ${product.shortName} gives you ${specSummary} without the post-workout crash. Use code ${code} for 20% off.`,
        },
        {
          id: `${product.id}-hook-2`,
          query: 'PRE WORKOUT WITH CLINICAL DOSES',
          title: 'WHY PROS SWITCHED TO THIS FORMULA',
          highlightPhrase: `Allmax ${product.shortName}`,
          script: `Most pre-workouts hide behind proprietary blends. Allmax ${product.shortName} shows every clinical dose right on the label. Try it today with code ${code}.`,
        },
        {
          id: `${product.id}-hook-3`,
          query: 'HOW TO GET BETTER GYM PUMPS NATURALLY',
          title: 'UNLOCK NEXT-LEVEL VASCULARITY',
          highlightPhrase: 'maximum blood flow & endurance',
          script: `Want skin-splitting pumps on upper body day? Take Allmax ${product.shortName} 20 minutes before lifting and feel the difference from set one. Code ${code} saves 20%.`,
        },
      ];

    case 'Creatine & Performance':
      return [
        {
          id: `${product.id}-hook-1`,
          query: 'BEST MICRONIZED CREATINE FOR STRENGTH',
          title: 'DAILY STRENGTH & ATP UPGRADE',
          highlightPhrase: specSummary || '100% pure pharmaceutical-grade fuel',
          script: `If you want real strength gains, consistency beats everything. I take Allmax ${product.shortName} every single day—${specSummary} for pure power output. Use ${code} at checkout.`,
        },
        {
          id: `${product.id}-hook-2`,
          query: 'HOW TO RECOVER FASTER BETWEEN SETS',
          title: 'THE 1-INGREDIENT GAME CHANGER',
          highlightPhrase: `Allmax ${product.shortName}`,
          script: `This is the most researched performance staple in my gym bag: Allmax ${product.shortName}. Zero flavor, mixes instantly, lab-tested purity. Grab a tub with code ${code}.`,
        },
        {
          id: `${product.id}-hook-3`,
          query: 'BEST INTRA WORKOUT RECOVERY DRINK',
          title: 'TRAIN HARDER WITHOUT FATIGUE',
          highlightPhrase: 'sustained hydration & recovery',
          script: `Don't let fatigue cut your leg day short. Allmax ${product.shortName} keeps your muscles fueled from warm-up to your final drop set. Use code ${code} for 20% off.`,
        },
      ];

    default:
      return [
        {
          id: `${product.id}-hook-1`,
          query: `BEST ${product.name.toUpperCase()} SUPPLEMENT FOR ATHLETES`,
          title: `MY DAILY ${product.shortName.toUpperCase()} ROUTINE`,
          highlightPhrase: specSummary || product.tagline,
          script: `Here is how I fuel my hardest sessions with Allmax ${product.shortName}. You get ${specSummary || product.tagline} backed by strict lab testing. Use code ${code} for 20% off.`,
        },
        {
          id: `${product.id}-hook-2`,
          query: 'PRO ATHLETE SUPPLEMENT STACK 2026',
          title: 'UPGRADE YOUR GYM STACK',
          highlightPhrase: `Allmax ${product.shortName}`,
          script: `Quality ingredients make all the difference in your results. Allmax ${product.shortName} is a non-negotiable in my daily stack. Tap the link and use ${code}.`,
        },
        {
          id: `${product.id}-hook-3`,
          query: 'CLEANEST LAB TESTED SUPPLEMENTS',
          title: 'WHY I TRUST ALLMAX NUTRITION',
          highlightPhrase: 'Informed-Choice & cGMP certified',
          script: `No guesswork, no hidden fillers—just verified performance with Allmax ${product.shortName}. Use my creator code ${code} at allmaxnutrition.com.`,
        },
      ];
  }
}
