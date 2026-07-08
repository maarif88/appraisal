import { IntentType } from './intent.service.js';

/**
 * Calculate difficulty score per keyword.
 * Spec section 4.4: proxy difficulty without SERP API.
 *
 * difficulty_score = (competition_component * 0.5) + (word_count_component * 0.2) + (intent_component * 0.3)
 */
export function calculateDifficultyScore(
  competitionIndex: number,
  wordCount: number,
  intent: IntentType
): number {
  // Competition component: directly from Google Ads API (0-100)
  const competitionComponent = Math.min(100, Math.max(0, competitionIndex));

  // Word count component: shorter keywords = harder
  // clamp(100 - (word_count - 1) * 15, 10, 100)
  const wordCountComponent = Math.max(10, Math.min(100, 100 - (wordCount - 1) * 15));

  // Intent component
  const intentValues: Record<IntentType, number> = {
    informational: 40,
    commercial: 65,
    transactional: 80,
    navigational: 90,
  };
  const intentComponent = intentValues[intent];

  // Weighted sum per spec formula
  const score = (competitionComponent * 0.5) + (wordCountComponent * 0.2) + (intentComponent * 0.3);

  return Math.round(score * 100) / 100; // 2 decimal places
}

/**
 * Calculate effective capture rate per keyword.
 * Spec section 4.4:
 * 
 * difficulty_penalty = 1 - (difficulty_score / 100 * 0.6)
 * capture_rate_effective = capture_rate_target_pct * difficulty_penalty
 */
export function calculateCaptureRate(
  captureRateTargetPct: number,
  difficultyScore: number
): number {
  // Maximum penalty is 60% at difficulty 100
  const difficultyPenalty = 1 - (difficultyScore / 100 * 0.6);
  const captureRateEffective = captureRateTargetPct * difficultyPenalty;

  return Math.round(captureRateEffective * 100) / 100; // 2 decimal places
}
