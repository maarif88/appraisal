import { z } from 'zod';

/**
 * Default assumptions matching spec section 3.
 */
export const DEFAULT_ASSUMPTIONS = {
  capture_rate_target_pct: 10,
  conversion_rate_pct: 4,
  value_per_sale: { amount: 1000, currency: 'USD' },
  ramp_up_months_to_target: 9,
  projection_horizon_months: 24,
  service_fee_pct: 26,
  overlap_discount_factor: 0.15,
  conversion_rate_multiplier: {
    transactional: 1.0,
    commercial: 0.6,
    informational: 0.15,
    navigational: 0.8,
  },
};


// Trim before validating; text is rendered by React, never interpreted as markup.
const text = (max: number) => z.string().trim().min(1).max(max).regex(/^[^<>\x00-\x1F\x7F]*$/u, 'Use plain single-line text');
const currency = z.enum(['USD','IDR']);
const finite = (min: number, max: number) => z.number().finite().min(min).max(max);
const assumptionsSchema = z.object({
  capture_rate_target_pct: finite(0.1,100).optional(),
  conversion_rate_pct: finite(0.1,100).optional(),
  value_per_sale: z.object({amount:finite(0,1e9),currency}).strict().optional(),
  ramp_up_months_to_target: finite(1,36).int().optional(),
  projection_horizon_months: finite(1,60).int().optional(),
  service_fee_pct: finite(0,100).optional(),
  overlap_discount_factor: finite(0,1).optional(),
  conversion_rate_multiplier: z.object({
    transactional:finite(0,2).optional(), commercial:finite(0,2).optional(),
    informational:finite(0,2).optional(), navigational:finite(0,2).optional(),
  }).strict().optional(),
}).strict();
export const createProjectSchema = z.object({
  seed_keyword: text(200),
  locale_country: z.string().trim().max(6).transform(value=>value.toLowerCase()==='global'?'global':value.toUpperCase()).refine(value=>/^(?:[A-Z]{2}|global)$/.test(value),'Invalid country').default('ID'),
  locale_language: z.string().trim().regex(/^[a-z]{2,3}(?:-[A-Z]{2})?$/).max(6).default('id'),
  currency_base: currency.default('USD'),
  currency_display: z.array(currency).min(1).max(2).refine(values=>new Set(values).size===values.length).default(['USD','IDR']),
  sector: text(100).default('General'),
  assumptions: assumptionsSchema.default({}),
}).strict();
export const reprojectSchema = z.object({assumptions:assumptionsSchema}).strict();
export const keywordQuerySchema = z.object({
  sort:z.enum(['avg_monthly_sv','difficulty_score','capture_rate_effective','keyword','intent','competition_index']).default('avg_monthly_sv'),
  order:z.enum(['ASC','DESC']).default('DESC'),
  intent:z.enum(['transactional','commercial','informational','navigational']).optional(),
  source:z.enum(['seed','autocomplete','trends_top','trends_rising']).optional(),
  _t:z.string().max(20).optional(),
}).strict();
export function mergeAssumptions(base: any, next: any) {
  return {...base,...next,
    value_per_sale:{...base.value_per_sale,...next.value_per_sale},
    conversion_rate_multiplier:{...base.conversion_rate_multiplier,...next.conversion_rate_multiplier}};
}
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type ReprojectInput = z.infer<typeof reprojectSchema>;
export type Assumptions = typeof DEFAULT_ASSUMPTIONS;
