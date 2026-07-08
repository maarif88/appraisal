import { env, isGoogleAdsConfigured } from '../config/env.js';

export interface KeywordIdeaResult {
  keyword: string;
  avg_monthly_sv: number;
  sv_is_range_estimate: boolean;
  sv_range_low: number;
  sv_range_high: number;
  competition: string;
  competition_index: number;
  low_bid_micros: number;
  high_bid_micros: number;
}

/**
 * Enrich keywords with search volume and competition data.
 * Spec section 2, step [3]: Google Ads API KeywordPlanIdeaService.
 * 
 * When API is not configured, returns mock data for development.
 */
export async function enrichKeywords(
  seedKeyword: string,
  keywordList: string[],
  country: string = 'ID',
  language: string = 'id'
): Promise<KeywordIdeaResult[]> {
  if (!isGoogleAdsConfigured()) {
    console.log('[GoogleAds] Not configured, using mock data');
    return generateMockKeywordData(seedKeyword, keywordList);
  }

  // TODO: Implement real Google Ads API integration
  // For now, return mock data even if configured
  console.log('[GoogleAds] API integration pending, using mock data');
  return generateMockKeywordData(seedKeyword, keywordList);
}

/**
 * Generate realistic mock keyword data for development.
 * Mimics Google Ads API response format.
 */
function generateMockKeywordData(seedKeyword: string, keywords: string[]): KeywordIdeaResult[] {
  const allKeywords = [seedKeyword, ...keywords];
  
  return allKeywords.map(kw => {
    // Generate somewhat realistic SV based on keyword length/type
    const wordCount = kw.split(/\s+/).length;
    const baseSV = wordCount <= 2 ? 5000 : wordCount <= 3 ? 2000 : 800;
    const variation = Math.random() * 0.8 + 0.2; // 0.2 to 1.0
    const sv = Math.round(baseSV * variation);

    // Competition index based on commercial intent signals
    const hasCommercialWord = /harga|beli|jasa|murah|price|buy|hire|best/i.test(kw);
    const compIdx = hasCommercialWord
      ? Math.round(60 + Math.random() * 40) // 60-100
      : Math.round(10 + Math.random() * 50); // 10-60

    const competition = compIdx >= 66 ? 'HIGH' : compIdx >= 33 ? 'MEDIUM' : 'LOW';

    // CPC bids in micros (1 USD = 1,000,000 micros)
    const lowBid = Math.round((0.1 + Math.random() * 2) * 1_000_000);
    const highBid = Math.round(lowBid * (1.5 + Math.random()));

    return {
      keyword: kw,
      avg_monthly_sv: sv,
      sv_is_range_estimate: false,
      sv_range_low: Math.round(sv * 0.7),
      sv_range_high: Math.round(sv * 1.3),
      competition,
      competition_index: compIdx,
      low_bid_micros: lowBid,
      high_bid_micros: highBid,
    };
  });
}
