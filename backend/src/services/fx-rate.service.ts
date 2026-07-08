import axios from 'axios';
import { retryWithBackoff } from '../utils/retry.js';

/**
 * Fetch real-time FX rate from open.er-api.com (free, no key required).
 * Spec section 4.8: dual currency handling.
 */
export async function fetchFxRate(
  baseCurrency: string = 'USD',
  targetCurrency: string = 'IDR'
): Promise<{ rate: number; source: string; fetchedAt: string }> {
  try {
    const result = await retryWithBackoff(
      async () => {
        const response = await axios.get(
          `https://open.er-api.com/v6/latest/${baseCurrency}`,
          { timeout: 5000 }
        );

        if (response.data?.result === 'success' && response.data?.rates?.[targetCurrency]) {
          return {
            rate: response.data.rates[targetCurrency],
            source: 'open.er-api.com',
            fetchedAt: new Date().toISOString(),
          };
        }
        throw new Error('Invalid FX API response');
      },
      { maxRetries: 3, baseDelay: 1000, label: 'fx-rate' }
    );

    return result;
  } catch (error) {
    console.warn('[FX] Failed to fetch live rate, using default 16,400');
    return {
      rate: 16400,
      source: 'fallback-default',
      fetchedAt: new Date().toISOString(),
    };
  }
}
