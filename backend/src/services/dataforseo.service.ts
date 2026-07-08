import { isDataForSEOConfigured } from '../config/env.js';

export interface TrendResult {
  monthly_index_5y: Array<{ date: string; value: number }>;
  top_queries: Array<{ query: string; value: number }>;
  rising_queries: Array<{ query: string; value: number }>;
}

/**
 * Fetch Google Trends data via DataForSEO API.
 * Spec section 2, step [4]: 5-year trend data.
 * Cost: ~$0.00225/task (Standard Queue).
 */
export async function fetchTrends(
  keyword: string,
  country: string = 'ID',
  language: string = 'id'
): Promise<{ data: TrendResult; cost: number }> {
  if (!isDataForSEOConfigured()) {
    console.log('[DataForSEO] Not configured, using mock trends');
    return { data: generateMockTrends(keyword), cost: 0 };
  }

  // TODO: Implement real DataForSEO Trends API
  console.log('[DataForSEO] API integration pending, using mock trends');
  return { data: generateMockTrends(keyword), cost: 0 };
}

/**
 * Generate realistic mock trend data for development.
 */
function generateMockTrends(keyword: string): TrendResult {
  const now = new Date();
  const monthly_index_5y: Array<{ date: string; value: number }> = [];

  // Generate 60 months of trend data with realistic patterns
  for (let i = 59; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    
    // Base trend with seasonal variation and slight upward trend
    const seasonalFactor = 1 + 0.15 * Math.sin((date.getMonth() / 12) * 2 * Math.PI);
    const growthFactor = 1 + (59 - i) * 0.005; // Slight upward trend
    const noise = 0.85 + Math.random() * 0.3;
    const value = Math.round(50 * seasonalFactor * growthFactor * noise);

    monthly_index_5y.push({
      date: date.toISOString().slice(0, 7), // YYYY-MM
      value: Math.min(100, Math.max(0, value)),
    });
  }

  // Mock top queries
  const topQuerySuffixes = [
    'terbaik', 'profesional', 'jakarta', 'indonesia', 'murah',
    'berkualitas', 'terpercaya', 'agency', 'consultant', 'services',
  ];

  const top_queries = topQuerySuffixes.map((suffix, i) => ({
    query: `${keyword} ${suffix}`,
    value: Math.round(100 - i * 8 - Math.random() * 5),
  }));

  // Mock rising queries
  const risingQuerySuffixes = [
    'ai', '2026', 'untuk umkm', 'lokal', 'enterprise',
    'audit', 'content', 'backlink', 'on page', 'strategi',
  ];

  const rising_queries = risingQuerySuffixes.map((suffix, i) => ({
    query: `${keyword} ${suffix}`,
    value: Math.round(400 - i * 30 + Math.random() * 50),
  }));

  return { monthly_index_5y, top_queries, rising_queries };
}
