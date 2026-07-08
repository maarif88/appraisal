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

export const createProjectSchema = z.object({
  seed_keyword: z.string().min(1).max(200).trim(),
  locale_country: z.string().length(2).default('ID'),
  locale_language: z.string().min(2).max(5).default('id'),
  currency_base: z.string().length(3).default('USD'),
  currency_display: z.array(z.string().length(3)).default(['USD', 'IDR']),
  sector: z.string().min(1).max(100).optional().default('General'),
  assumptions: z.object({
    capture_rate_target_pct: z.number().min(0.1).max(100).optional(),
    conversion_rate_pct: z.number().min(0.1).max(100).optional(),
    value_per_sale: z.object({
      amount: z.number().min(0),
      currency: z.string().length(3),
    }).optional(),
    ramp_up_months_to_target: z.number().int().min(1).max(36).optional(),
    projection_horizon_months: z.number().int().min(1).max(60).optional(),
    service_fee_pct: z.number().min(0).max(100).optional(),
    overlap_discount_factor: z.number().min(0).max(1).optional(),
    conversion_rate_multiplier: z.object({
      transactional: z.number().min(0).max(2).optional(),
      commercial: z.number().min(0).max(2).optional(),
      informational: z.number().min(0).max(2).optional(),
      navigational: z.number().min(0).max(2).optional(),
    }).optional(),
  }).optional().default({}),
});

export const reprojectSchema = z.object({
  assumptions: z.object({
    capture_rate_target_pct: z.number().min(0.1).max(100).optional(),
    conversion_rate_pct: z.number().min(0.1).max(100).optional(),
    value_per_sale: z.object({
      amount: z.number().min(0),
      currency: z.string().length(3),
    }).optional(),
    ramp_up_months_to_target: z.number().int().min(1).max(36).optional(),
    projection_horizon_months: z.number().int().min(1).max(60).optional(),
    service_fee_pct: z.number().min(0).max(100).optional(),
    overlap_discount_factor: z.number().min(0).max(1).optional(),
    conversion_rate_multiplier: z.object({
      transactional: z.number().min(0).max(2).optional(),
      commercial: z.number().min(0).max(2).optional(),
      informational: z.number().min(0).max(2).optional(),
      navigational: z.number().min(0).max(2).optional(),
    }).optional(),
  }),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type ReprojectInput = z.infer<typeof reprojectSchema>;
export type Assumptions = typeof DEFAULT_ASSUMPTIONS;
