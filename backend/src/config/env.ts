import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3100),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  DATABASE_PATH: z.string().default('./data/ypym-appraisal.db'),

  // Google Ads API (optional - mock mode if empty)
  GOOGLE_ADS_DEVELOPER_TOKEN: z.string().default(''),
  GOOGLE_ADS_CLIENT_ID: z.string().default(''),
  GOOGLE_ADS_CLIENT_SECRET: z.string().default(''),
  GOOGLE_ADS_REFRESH_TOKEN: z.string().default(''),
  GOOGLE_ADS_LOGIN_CUSTOMER_ID: z.string().default(''),

  // DataForSEO (optional - mock mode if empty)
  DATAFORSEO_LOGIN: z.string().default(''),
  DATAFORSEO_PASSWORD: z.string().default(''),

  // Exchange Rate
  FX_RATE_API_KEY: z.string().default(''),

  // Defaults
  DEFAULT_CURRENCY_BASE: z.string().default('USD'),
  DEFAULT_LOCALE_COUNTRY: z.string().default('ID'),
  DEFAULT_LOCALE_LANGUAGE: z.string().default('id'),

  // Pipeline limits
  MAX_KEYWORDS_PER_RUN: z.coerce.number().default(500),
  AUTOCOMPLETE_DELAY_MIN_MS: z.coerce.number().default(300),
  AUTOCOMPLETE_DELAY_MAX_MS: z.coerce.number().default(800),
});

export const env = envSchema.parse(process.env);

/** Check if Google Ads API is configured */
export const isGoogleAdsConfigured = (): boolean =>
  !!(env.GOOGLE_ADS_DEVELOPER_TOKEN && env.GOOGLE_ADS_CLIENT_ID && env.GOOGLE_ADS_REFRESH_TOKEN);

/** Check if DataForSEO is configured */
export const isDataForSEOConfigured = (): boolean =>
  !!(env.DATAFORSEO_LOGIN && env.DATAFORSEO_PASSWORD);
