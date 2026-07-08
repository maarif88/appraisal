import { tokenize, jaccardSimilarity } from '../utils/stemmer.js';
import { v4 as uuidv4 } from 'uuid';

export interface KeywordWithCluster {
  keyword: string;
  avg_monthly_sv: number;
  cluster_id: string;
  is_cluster_primary: boolean;
  [key: string]: any;
}

/**
 * Cluster keywords using Jaccard token-similarity.
 * Spec section 4.2: deduplication via heuristic token-similarity.
 * 
 * - Similarity >= 0.6 → same cluster
 * - Cluster primary = highest SV keyword
 * - effective_sv = SV_primary + SUM(SV_others * overlap_discount_factor)
 */
export function clusterKeywords(
  keywords: Array<{ keyword: string; avg_monthly_sv: number; [key: string]: any }>,
  similarityThreshold: number = 0.6
): {
  clusteredKeywords: KeywordWithCluster[];
  raw_sv_pool: number;
  effective_sv_pool: number;
  cluster_count: number;
} {
  if (keywords.length === 0) {
    return { clusteredKeywords: [], raw_sv_pool: 0, effective_sv_pool: 0, cluster_count: 0 };
  }

  // Tokenize all keywords
  const tokenSets = keywords.map(kw => ({
    ...kw,
    tokens: tokenize(kw.keyword),
    cluster_id: '',
    is_cluster_primary: false,
  }));

  // Greedy clustering
  const clusters: Map<string, typeof tokenSets> = new Map();
  const assigned = new Set<number>();

  for (let i = 0; i < tokenSets.length; i++) {
    if (assigned.has(i)) continue;

    const clusterId = uuidv4().slice(0, 8);
    const cluster = [tokenSets[i]];
    tokenSets[i].cluster_id = clusterId;
    assigned.add(i);

    for (let j = i + 1; j < tokenSets.length; j++) {
      if (assigned.has(j)) continue;

      const similarity = jaccardSimilarity(tokenSets[i].tokens, tokenSets[j].tokens);
      if (similarity >= similarityThreshold) {
        tokenSets[j].cluster_id = clusterId;
        cluster.push(tokenSets[j]);
        assigned.add(j);
      }
    }

    clusters.set(clusterId, cluster);
  }

  // Assign cluster primaries (highest SV in each cluster)
  for (const [, clusterMembers] of clusters) {
    clusterMembers.sort((a, b) => b.avg_monthly_sv - a.avg_monthly_sv);
    if (clusterMembers.length > 0) {
      clusterMembers[0].is_cluster_primary = true;
    }
  }

  // Calculate SV pools
  const raw_sv_pool = keywords.reduce((sum, kw) => sum + kw.avg_monthly_sv, 0);

  // Spec formula: effective_sv per cluster = SV_primary + (SUM SV_others * 0.15)
  // overlap_discount_factor is applied at projection time from assumptions
  // Here we compute the base effective pool with default 0.15
  let effective_sv_pool = 0;
  for (const [, clusterMembers] of clusters) {
    if (clusterMembers.length === 0) continue;
    const primarySV = clusterMembers[0].avg_monthly_sv;
    const othersSV = clusterMembers.slice(1).reduce((sum, kw) => sum + kw.avg_monthly_sv, 0);
    effective_sv_pool += primarySV + (othersSV * 0.15);
  }

  const clusteredKeywords: KeywordWithCluster[] = tokenSets.map(({ tokens, ...kw }) => kw);

  return {
    clusteredKeywords,
    raw_sv_pool,
    effective_sv_pool: Math.round(effective_sv_pool),
    cluster_count: clusters.size,
  };
}

/**
 * Recalculate effective SV pool with a different overlap discount factor.
 * Used when user changes assumptions and re-runs projection.
 */
export function recalculateEffectiveSV(
  keywords: KeywordWithCluster[],
  overlapDiscountFactor: number = 0.15
): number {
  const clusters = new Map<string, KeywordWithCluster[]>();
  for (const kw of keywords) {
    const existing = clusters.get(kw.cluster_id) || [];
    existing.push(kw);
    clusters.set(kw.cluster_id, existing);
  }

  let effectiveSV = 0;
  for (const [, members] of clusters) {
    members.sort((a, b) => b.avg_monthly_sv - a.avg_monthly_sv);
    const primarySV = members[0]?.avg_monthly_sv || 0;
    const othersSV = members.slice(1).reduce((sum, kw) => sum + kw.avg_monthly_sv, 0);
    effectiveSV += primarySV + (othersSV * overlapDiscountFactor);
  }

  return Math.round(effectiveSV);
}
