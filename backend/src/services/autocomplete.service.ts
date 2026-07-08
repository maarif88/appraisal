import axios from 'axios';
import { env } from '../config/env.js';
import { retryWithBackoff, randomDelay, getRandomUserAgent, CircuitBreaker } from '../utils/retry.js';

const circuitBreaker = new CircuitBreaker(5, 60000);

interface AutocompleteResult {
  keyword: string;
  source: 'autocomplete';
}

/**
 * Expand a seed keyword via Google Autocomplete.
 * Spec section 2, step [2]: multi-permutation expansion.
 */
export async function expandAutocomplete(
  seedKeyword: string,
  language: string = 'id',
  country: string = 'ID'
): Promise<AutocompleteResult[]> {
  const results: AutocompleteResult[] = [];
  const seen = new Set<string>();

  // Permutation prefixes (Indonesian + English)
  const prefixes = [
    '', // bare seed
    ...('abcdefghijklmnopqrstuvwxyz'.split('')).map(c => `${seedKeyword} ${c}`),
    ...'0123456789'.split('').map(n => `${seedKeyword} ${n}`),
    `cara ${seedKeyword}`,
    `bagaimana ${seedKeyword}`,
    `apa itu ${seedKeyword}`,
    `berapa ${seedKeyword}`,
    `kenapa ${seedKeyword}`,
    `${seedKeyword} terbaik`,
    `${seedKeyword} murah`,
    `${seedKeyword} terdekat`,
    `jasa ${seedKeyword}`,
    `harga ${seedKeyword}`,
    `how to ${seedKeyword}`,
    `what is ${seedKeyword}`,
    `best ${seedKeyword}`,
    `${seedKeyword} price`,
    `${seedKeyword} review`,
  ];

  // Only use bare seed if short prefix list
  const queriesToRun = prefixes.length > 50 ? prefixes.slice(0, 50) : prefixes;

  for (const query of queriesToRun) {
    if (circuitBreaker.isOpen()) {
      console.warn('[Autocomplete] Circuit breaker open, stopping expansion');
      break;
    }

    try {
      const suggestions = await retryWithBackoff(
        () => fetchAutocomplete(query || seedKeyword, language, country),
        { maxRetries: 2, baseDelay: 500, label: `autocomplete:${query}` }
      );

      for (const suggestion of suggestions) {
        const normalized = suggestion.toLowerCase().trim();
        if (!seen.has(normalized) && normalized !== seedKeyword.toLowerCase()) {
          seen.add(normalized);
          results.push({ keyword: normalized, source: 'autocomplete' });
        }
      }

      circuitBreaker.recordSuccess();
    } catch (error) {
      circuitBreaker.recordFailure();
      console.warn(`[Autocomplete] Failed for query "${query}", continuing...`);
    }

    // Random delay per spec: 300-800ms
    await randomDelay(env.AUTOCOMPLETE_DELAY_MIN_MS, env.AUTOCOMPLETE_DELAY_MAX_MS);
  }

  console.log(`[Autocomplete] Expanded "${seedKeyword}" → ${results.length} suggestions`);
  return results;
}

async function fetchAutocomplete(query: string, language: string, country: string): Promise<string[]> {
  const url = `https://www.google.com/complete/search`;
  const response = await axios.get(url, {
    params: {
      client: 'chrome',
      q: query,
      hl: language,
      gl: country,
    },
    headers: {
      'User-Agent': getRandomUserAgent(),
      'Accept': 'application/json',
    },
    timeout: 5000,
  });

  // Response format: [query, [suggestions], ...]
  if (Array.isArray(response.data) && Array.isArray(response.data[1])) {
    return response.data[1].filter((s: unknown) => typeof s === 'string');
  }

  return [];
}

/**
 * Generate mock autocomplete data for development.
 */
export function generateMockAutocomplete(seedKeyword: string): AutocompleteResult[] {
  const mockSuffixes = [
    'terbaik', 'murah', 'terdekat', 'profesional', 'berkualitas',
    'jakarta', 'surabaya', 'bandung', 'bali', 'indonesia',
    'harga', 'biaya', 'paket', 'jasa', 'layanan',
    'cara', 'tips', 'strategi', 'teknik', 'panduan',
    'untuk umkm', 'untuk bisnis', 'untuk website', 'untuk toko online',
    'gratis', 'premium', 'enterprise', 'agensi',
    'on page', 'off page', 'backlink', 'audit',
    'google', 'ranking', 'keyword', 'content',
  ];

  return mockSuffixes.map(suffix => ({
    keyword: `${seedKeyword} ${suffix}`.toLowerCase(),
    source: 'autocomplete' as const,
  }));
}
