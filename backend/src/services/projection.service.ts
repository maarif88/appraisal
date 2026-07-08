import { IntentType, getConversionMultiplier } from './intent.service.js';
import type { Assumptions } from '../utils/validators.js';

export interface KeywordProjectionInput {
  keyword: string;
  avg_monthly_sv: number;
  is_cluster_primary: boolean;
  cluster_id: string;
  intent: IntentType;
  capture_rate_effective: number; // already adjusted by difficulty
  difficulty_score: number;
}

export interface ProjectionResult {
  horizon_months: number;
  total_leads: number;
  total_conversions: number;
  revenue_usd: number;
  revenue_idr: number;
  recommended_service_fee_usd: number;
  recommended_service_fee_idr: number;
  net_margin_usd: number;
  monthly_breakdown: Array<{
    month: number;
    capture_pct: number;
    traffic: number;
    leads: number;
    conversions: number;
  }>;
}

/**
 * S-curve ramp-up model.
 * Spec section 4.6: logistic curve for capture rate growth.
 *
 * capture_at_month(m) = capture_rate_effective / (1 + e^(-0.8 * (m - ramp/2)))
 */
function captureAtMonth(
  month: number,
  captureRateEffective: number,
  rampUpMonths: number
): number {
  const midpoint = rampUpMonths / 2;
  const exponent = -0.8 * (month - midpoint);
  return captureRateEffective / (1 + Math.exp(exponent));
}

/**
 * Calculate projection for a set of keywords at a given horizon.
 * Spec sections 4.6, 4.7: ramp-up curve + leads/conversion/revenue.
 *
 * Per spec: "Jangan kalikan SV bulanan x 12 atau x 24 dengan capture% flat.
 * Sebaliknya, jumlahkan traffic tertangkap per bulan."
 */
export function calculateProjection(
  keywords: KeywordProjectionInput[],
  assumptions: Assumptions,
  horizonMonths: number,
  fxRateUsdIdr: number,
  totalOperationalCostUsd: number,
  overlapDiscountFactor: number
): ProjectionResult {
  const monthlyBreakdown: Array<{
    month: number;
    capture_pct: number;
    traffic: number;
    leads: number;
    conversions: number;
  }> = [];

  let totalLeads = 0;
  let totalConversions = 0;

  // Group keywords by cluster for effective SV calculation
  const clusters = new Map<string, KeywordProjectionInput[]>();
  for (const kw of keywords) {
    const existing = clusters.get(kw.cluster_id) || [];
    existing.push(kw);
    clusters.set(kw.cluster_id, existing);
  }

  // Calculate effective monthly SV per cluster (using overlap discount)
  const clusterEffectiveSV = new Map<string, number>();
  for (const [clusterId, members] of clusters) {
    members.sort((a, b) => b.avg_monthly_sv - a.avg_monthly_sv);
    const primarySV = members[0]?.avg_monthly_sv || 0;
    const othersSV = members.slice(1).reduce((sum, kw) => sum + kw.avg_monthly_sv, 0);
    clusterEffectiveSV.set(clusterId, primarySV + (othersSV * overlapDiscountFactor));
  }

  // For each month, calculate total captured traffic using S-curve per keyword
  for (let m = 1; m <= horizonMonths; m++) {
    let monthTraffic = 0;
    let monthConversions = 0;
    let avgCapture = 0;
    let kwCount = 0;

    // Iterate per cluster primary (effective SV)
    for (const [clusterId, members] of clusters) {
      const primary = members.find(kw => kw.is_cluster_primary) || members[0];
      if (!primary) continue;

      const effectiveSV = clusterEffectiveSV.get(clusterId) || 0;
      const capturePct = captureAtMonth(m, primary.capture_rate_effective, assumptions.ramp_up_months_to_target);
      const capturedTraffic = effectiveSV * (capturePct / 100);

      // Conversion per keyword uses intent-specific rate
      const conversionMultiplier = getConversionMultiplier(
        primary.intent,
        assumptions.conversion_rate_multiplier
      );
      const conversionRate = assumptions.conversion_rate_pct * conversionMultiplier / 100;
      const conversions = capturedTraffic * conversionRate;

      monthTraffic += capturedTraffic;
      monthConversions += conversions;
      avgCapture += capturePct;
      kwCount++;
    }

    totalLeads += monthTraffic;
    totalConversions += monthConversions;

    monthlyBreakdown.push({
      month: m,
      capture_pct: kwCount > 0 ? Math.round((avgCapture / kwCount) * 100) / 100 : 0,
      traffic: Math.round(monthTraffic),
      leads: Math.round(monthTraffic),
      conversions: Math.round(monthConversions * 100) / 100,
    });
  }

  // Revenue calculation
  const valuePerSale = assumptions.value_per_sale.amount;
  const revenueUsd = totalConversions * valuePerSale;
  const revenueIdr = revenueUsd * fxRateUsdIdr;

  // Service fee and margin (spec section 4.9)
  const serviceFeeUsd = revenueUsd * (assumptions.service_fee_pct / 100);
  const serviceFeeIdr = serviceFeeUsd * fxRateUsdIdr;
  const netMarginUsd = serviceFeeUsd - totalOperationalCostUsd;

  return {
    horizon_months: horizonMonths,
    total_leads: Math.round(totalLeads),
    total_conversions: Math.round(totalConversions * 100) / 100,
    revenue_usd: Math.round(revenueUsd * 100) / 100,
    revenue_idr: Math.round(revenueIdr),
    recommended_service_fee_usd: Math.round(serviceFeeUsd * 100) / 100,
    recommended_service_fee_idr: Math.round(serviceFeeIdr),
    net_margin_usd: Math.round(netMarginUsd * 100) / 100,
    monthly_breakdown: monthlyBreakdown,
  };
}
