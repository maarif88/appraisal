/**
 * Intent classification - spec section 4.5.
 * Dictionary-based, no ML model required.
 */

export type IntentType = 'transactional' | 'commercial' | 'informational' | 'navigational';

// Word lists for intent detection (ID + EN)
const INTENT_SIGNALS: Record<IntentType, RegExp[]> = {
  transactional: [
    /\bbeli\b/i, /\bharga\b/i, /\bjasa\b/i, /\border\b/i, /\bmurah\b/i,
    /\bpromo\b/i, /\bdiskon\b/i, /\bbuy\b/i, /\bprice\b/i, /\bhire\b/i,
    /\bpaket\b/i, /\blayanan\b/i, /\btarif\b/i, /\bbiaya\b/i, /\bsewa\b/i,
    /\bpesan\b/i, /\bcheap\b/i, /\bdiscount\b/i, /\baffordable\b/i, /\bcost\b/i,
    /\bquote\b/i, /\bpurchase\b/i, /\bsubscribe\b/i, /\bberlangganan\b/i,
  ],
  commercial: [
    /\bterbaik\b/i, /\breview\b/i, /\bvs\b/i, /\bperbandingan\b/i,
    /\brekomendasi\b/i, /\bbest\b/i, /\btop\b/i, /\bcompare\b/i,
    /\brecommend/i, /\brating\b/i, /\balternative\b/i, /\balternatif\b/i,
    /\bpilihan\b/i, /\bunggulan\b/i, /\bkeunggulan\b/i, /\bkelebihan\b/i,
    /\bprofessional\b/i, /\bprofesional\b/i, /\bterpercaya\b/i,
    /\bberkualitas\b/i, /\bbagus\b/i, /\bhandal\b/i,
  ],
  informational: [
    /\bapa itu\b/i, /\bcara\b/i, /\bbagaimana\b/i, /\bkenapa\b/i,
    /\btutorial\b/i, /\bhow to\b/i, /\bwhat is\b/i, /\bwhy\b/i,
    /\bpengertian\b/i, /\bmanfaat\b/i, /\bfungsi\b/i, /\btips\b/i,
    /\bpanduan\b/i, /\bguide\b/i, /\bcontoh\b/i, /\bexample\b/i,
    /\bdefinisi\b/i, /\bdefinition\b/i, /\bperbedaan\b/i, /\bdifference\b/i,
    /\bpenjelasan\b/i, /\bartikel\b/i, /\blearn\b/i, /\bbelajar\b/i,
  ],
  navigational: [
    // Brand/domain detection is added dynamically
    /\b\.com\b/i, /\b\.co\.id\b/i, /\b\.id\b/i, /\blogin\b/i, /\bmasuk\b/i,
    /\bdaftar\b/i, /\bsign up\b/i, /\bregister\b/i, /\bwebsite\b/i,
    /\bofficial\b/i, /\bresmi\b/i,
  ],
};

/**
 * Classify keyword intent.
 * Spec section 4.5: dictionary-based, default fallback = commercial.
 */
export function classifyIntent(keyword: string): IntentType {
  const kw = keyword.toLowerCase();

  // Check in priority order: transactional > commercial > informational > navigational
  for (const [intent, patterns] of Object.entries(INTENT_SIGNALS) as [IntentType, RegExp[]][]) {
    for (const pattern of patterns) {
      if (pattern.test(kw)) {
        return intent;
      }
    }
  }

  // Default fallback per spec: navigational if very short (1-2 words) without modifier
  const wordCount = kw.split(/\s+/).length;
  if (wordCount <= 2) {
    // Check if it looks like a brand/domain (no common modifiers)
    const hasModifier = Object.values(INTENT_SIGNALS)
      .flat()
      .some(pattern => pattern.test(kw));
    if (!hasModifier && wordCount === 1) {
      return 'navigational';
    }
  }

  // Default: commercial (per spec)
  return 'commercial';
}

/**
 * Get the conversion rate multiplier for an intent type.
 * Spec section 4.5.
 */
export function getConversionMultiplier(
  intent: IntentType,
  customMultipliers?: Partial<Record<IntentType, number>>
): number {
  const defaults: Record<IntentType, number> = {
    transactional: 1.0,
    commercial: 0.6,
    informational: 0.15,
    navigational: 0.8,
  };

  return customMultipliers?.[intent] ?? defaults[intent];
}
