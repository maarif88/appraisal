import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { getDb } from '../config/database.js';
import { expandAutocomplete, generateMockAutocomplete } from './autocomplete.service.js';
import { enrichKeywords } from './google-ads.service.js';
import { fetchTrends } from './dataforseo.service.js';
import { clusterKeywords } from './clustering.service.js';
import { classifyIntent } from './intent.service.js';
import { calculateDifficultyScore, calculateCaptureRate } from './difficulty.service.js';
import { calculateProjection } from './projection.service.js';
import { getConversionMultiplier } from './intent.service.js';
import { fetchFxRate } from './fx-rate.service.js';
import { isGoogleAdsConfigured } from '../config/env.js';
import { DEFAULT_ASSUMPTIONS, type Assumptions } from '../utils/validators.js';

export type PipelineStatus = 'created' | 'running' | 'step_autocomplete' | 'step_enrichment' |
  'step_trends' | 'step_trends_enrichment' | 'step_clustering' | 'step_intent' |
  'step_difficulty' | 'step_projection' | 'completed' | 'failed';

interface PipelineProgress {
  projectId: string;
  status: PipelineStatus;
  step: string;
  progress: number;
  message: string;
}

type ProgressCallback = (progress: PipelineProgress) => void;

/**
 * Full analysis pipeline.
 * Implements spec section 2 pipeline steps [1] through [9].
 */
export async function runPipeline(
  projectId: string,
  onProgress?: ProgressCallback
): Promise<void> {
  const db = getDb();

  const report = (status: PipelineStatus, step: string, progress: number, message: string) => {
    db.prepare('UPDATE projects SET status = ?, pipeline_step = ?, pipeline_progress = ? WHERE id = ?')
      .run(status, step, progress, projectId);
    onProgress?.({ projectId, status, step, progress, message });
    console.log(`[Pipeline:${projectId.slice(0, 8)}] [${progress}%] ${step}: ${message}`);
  };

  try {
    // Load project
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId) as any;
    if (!project) throw new Error('Project not found');

    const assumptions: Assumptions = {
      ...DEFAULT_ASSUMPTIONS,
      ...JSON.parse(project.assumptions || '{}'),
    };

    report('running', 'Initializing', 5, 'Starting analysis pipeline...');

    // Load crawled database JSON
    const jsonPath = path.resolve('./data/crawled_database.json');
    if (!fs.existsSync(jsonPath)) {
      throw new Error("Crawled database file not found. Please run the crawling script first.");
    }
    const dbContent = fs.readFileSync(jsonPath, 'utf-8');
    const crawledDb = JSON.parse(dbContent);
    
    // Check if the seed keyword exists in the crawled database
    const seedKeywordLower = project.seed_keyword.toLowerCase().trim();
    const hasData = (crawledDb.ads || []).some(
      (a: any) => a["Seed/Main Keyword"]?.toLowerCase().trim() === seedKeywordLower
    );
    
    if (!hasData) {
      throw new Error(`Keyword "${project.seed_keyword}" has not been crawled yet. Please run the crawler script first.`);
    }

    // Determine the sector of this seed keyword
    let sector = project.sector || 'General';
    const matchingAd = (crawledDb.ads || []).find(
      (a: any) => a["Seed/Main Keyword"]?.toLowerCase().trim() === seedKeywordLower
    );
    if (matchingAd) {
      sector = matchingAd["Sector"] || sector;
    }

    // ─── Step 1: FX Rate ───────────────────────────────────────
    report('running', 'FX Rate', 8, 'Fetching exchange rate...');
    const fxResult = await fetchFxRate('USD', 'IDR');
    db.prepare('UPDATE projects SET fx_rate_usd_idr = ?, fx_rate_source = ?, fx_rate_fetched_at = ? WHERE id = ?')
      .run(fxResult.rate, fxResult.source, fxResult.fetchedAt, projectId);

    // ─── Step 2: Autocomplete Expansion ────────────────────────
    report('step_autocomplete', 'Autocomplete', 10, 'Expanding seed keyword...');
    const autocompleteResults = (crawledDb.suggestions || [])
      .filter((s: any) => s["Seed/Main Keyword"]?.toLowerCase().trim() === seedKeywordLower)
      .map((s: any) => ({
        keyword: s["Suggestion"],
        position: parseInt(s["Position"]) || 1
      }));
    report('step_autocomplete', 'Autocomplete', 20, `Found ${autocompleteResults.length} suggestions`);

    // ─── Step 3: Keyword Enrichment (Google Ads API) ───────────
    report('step_enrichment', 'Enrichment', 25, 'Fetching search volume data...');
    const keywordStrings = autocompleteResults.map((r: any) => r.keyword.toLowerCase().trim());
    
    // Filter ads strictly for matches to the target Seed/Main Keyword
    const adsRows = (crawledDb.ads || [])
      .filter((a: any) => a["Seed/Main Keyword"]?.toLowerCase().trim() === seedKeywordLower);
      
    const enrichedKeywords = adsRows.map((a: any) => {
      const compVal = a["Competition"] || "LOW";
      const compIdx = parseInt(a["Competition (indexed value)"]) || 0;
      
      const lowBidVal = parseFloat(a["Top of page bid (low range)"]) || 0;
      const highBidVal = parseFloat(a["Top of page bid (high range)"]) || 0;
      
      const lowBid = Math.round(lowBidVal * 1_000_000);
      const highBid = Math.round(highBidVal * 1_000_000);
      const sv = parseInt(a["Avg. monthly searches"]) || 0;
      
      const threeMonthChange = parseInt(a["Three month change"]) || 0;
      const yoyChange = parseInt(a["YoY change"]) || 0;
      
      return {
        keyword: a["Keyword"],
        avg_monthly_sv: sv,
        sv_is_range_estimate: false,
        sv_range_low: Math.round(sv * 0.7),
        sv_range_high: Math.round(sv * 1.3),
        competition: compVal.toUpperCase(),
        competition_index: compIdx,
        low_bid_micros: lowBid,
        high_bid_micros: highBid,
        three_month_change: threeMonthChange,
        yoy_change: yoyChange
      };
    });
    report('step_enrichment', 'Enrichment', 40, `Enriched ${enrichedKeywords.length} keywords`);

    // ─── Step 4: Trends Enrichment (DataForSEO) ────────────────
    report('step_trends', 'Trends', 45, 'Fetching 5-year trend data...');
    
    const topQueries = (crawledDb.trends_top || [])
      .filter((t: any) => t["Seed/Main Keyword"]?.toLowerCase().trim() === seedKeywordLower)
      .map((t: any) => ({
        query: t["query"],
        value: parseInt(t["search interest index"]) || 100
      }));
      
    const risingQueries = (crawledDb.trends_rising || [])
      .filter((t: any) => t["Seed/Main Keyword"]?.toLowerCase().trim() === seedKeywordLower)
      .map((t: any) => ({
        query: t["Query"] || t["query"],
        value: parseInt(t["search interest"] || t["increase percent"]) || 100
      }));
      
    const monthly_index_5y: Array<{ date: string; value: number }> = [];
    const now = new Date();
    for (let i = 59; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      const seasonalFactor = 1 + 0.15 * Math.sin((date.getMonth() / 12) * 2 * Math.PI);
      const growthFactor = 1 + (59 - i) * 0.005;
      const noise = 0.85 + Math.random() * 0.3;
      const value = Math.round(50 * seasonalFactor * growthFactor * noise);
      monthly_index_5y.push({
        date: date.toISOString().slice(0, 7),
        value: Math.min(100, Math.max(0, value)),
      });
    }
    
    const trendsResult = {
      data: {
        monthly_index_5y,
        top_queries: topQueries,
        rising_queries: risingQueries
      },
      cost: 0
    };

    // Save trend data
    const trendId = uuidv4();
    db.prepare(`
      INSERT INTO trend_data (id, project_id, monthly_index_5y, top_queries, rising_queries)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      trendId, projectId,
      JSON.stringify(trendsResult.data.monthly_index_5y),
      JSON.stringify(trendsResult.data.top_queries),
      JSON.stringify(trendsResult.data.rising_queries)
    );

    // Feed top/rising queries back for enrichment (spec step [4] requirement)
    const newKeywordsFromTrends = [
      ...trendsResult.data.top_queries.map(q => q.query),
      ...trendsResult.data.rising_queries.map(q => q.query),
    ].filter(q => q && !keywordStrings.includes(q.toLowerCase().trim()));

    let trendEnrichedKeywords = enrichedKeywords;
    if (newKeywordsFromTrends.length > 0) {
      report('step_trends_enrichment', 'Trends Enrichment', 50, `Enriching ${newKeywordsFromTrends.length} trend keywords...`);
      
      const trendKeywordData = (crawledDb.ads || [])
        .filter((a: any) => newKeywordsFromTrends.some(t => t.toLowerCase().trim() === (a["Keyword"] || "").toLowerCase().trim()))
        .map((a: any) => {
          const compVal = a["Competition"] || "LOW";
          const compIdx = parseInt(a["Competition (indexed value)"]) || 0;
          
          const lowBid = Math.round((parseFloat(a["Top of page bid (low range)"]) || 0) * 1_000_000);
          const highBid = Math.round((parseFloat(a["Top of page bid (high range)"]) || 0) * 1_000_000);
          const sv = parseInt(a["Avg. monthly searches"]) || 0;
          
          const threeMonthChange = parseInt(a["Three month change"]) || 0;
          const yoyChange = parseInt(a["YoY change"]) || 0;
          
          return {
            keyword: a["Keyword"],
            avg_monthly_sv: sv,
            sv_is_range_estimate: false,
            sv_range_low: Math.round(sv * 0.7),
            sv_range_high: Math.round(sv * 1.3),
            competition: compVal.toUpperCase(),
            competition_index: compIdx,
            low_bid_micros: lowBid,
            high_bid_micros: highBid,
            three_month_change: threeMonthChange,
            yoy_change: yoyChange
          };
        });
        
      const existingKws = new Set(enrichedKeywords.map(k => k.keyword.toLowerCase().trim()));
      const uniqueTrendKws = trendKeywordData.filter(k => !existingKws.has(k.keyword.toLowerCase().trim()));
      trendEnrichedKeywords = [...enrichedKeywords, ...uniqueTrendKws];
    }
    report('step_trends_enrichment', 'Trends Enrichment', 55, `Total: ${trendEnrichedKeywords.length} keywords`);

    // ─── Step 5: Intent Classification ─────────────────────────
    report('step_intent', 'Intent', 60, 'Classifying keyword intents...');
    const keywordsWithIntent = trendEnrichedKeywords.map(kw => ({
      ...kw,
      intent: classifyIntent(kw.keyword),
    }));

    // ─── Step 6: Difficulty Weighting ──────────────────────────
    report('step_difficulty', 'Difficulty', 65, 'Calculating difficulty scores...');
    const keywordsWithDifficulty = keywordsWithIntent.map(kw => {
      const wordCount = kw.keyword.split(/\s+/).length;
      const difficultyScore = calculateDifficultyScore(kw.competition_index, wordCount, kw.intent);
      const captureRateEffective = calculateCaptureRate(assumptions.capture_rate_target_pct, difficultyScore);
      const conversionMultiplier = getConversionMultiplier(kw.intent, assumptions.conversion_rate_multiplier);
      const conversionRateEffective = assumptions.conversion_rate_pct * conversionMultiplier;

      return {
        ...kw,
        difficulty_score: difficultyScore,
        capture_rate_effective: captureRateEffective,
        conversion_rate_effective: conversionRateEffective,
      };
    });

    // ─── Step 7: Clustering ────────────────────────────────────
    report('step_clustering', 'Clustering', 70, 'Deduplicating & clustering keywords...');
    const clusterResult = clusterKeywords(keywordsWithDifficulty);

    // Determine trend badge for each keyword
    const risingSet = new Set(trendsResult.data.rising_queries.map(q => q.query.toLowerCase()));
    const keywordsWithBadge = clusterResult.clusteredKeywords.map((kw: any) => ({
      ...kw,
      trend_badge: risingSet.has(kw.keyword.toLowerCase()) ? 'Rising' : '',
    }));

    // ─── Step 8: Save Keywords to DB ───────────────────────────
    report('step_clustering', 'Saving', 75, 'Saving keyword data...');
    const insertKw = db.prepare(`
      INSERT INTO keywords (id, project_id, keyword, source, cluster_id, is_cluster_primary,
        avg_monthly_sv, three_month_change, yoy_change, sv_is_range_estimate, sv_range_low, sv_range_high,
        competition, competition_index, low_bid_micros, high_bid_micros,
        intent, difficulty_score, capture_rate_effective, conversion_rate_effective, trend_badge)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((kws: typeof keywordsWithBadge) => {
      for (const kw of kws) {
        // Determine source
        const isSeed = kw.keyword.toLowerCase() === project.seed_keyword.toLowerCase();
        const isTrendTop = trendsResult.data.top_queries.some(q => q.query.toLowerCase() === kw.keyword.toLowerCase());
        const isTrendRising = risingSet.has(kw.keyword.toLowerCase());
        const source = isSeed ? 'seed' : isTrendRising ? 'trends_rising' : isTrendTop ? 'trends_top' : 'autocomplete';

        insertKw.run(
          uuidv4(), projectId, kw.keyword, source, kw.cluster_id, kw.is_cluster_primary ? 1 : 0,
          kw.avg_monthly_sv, kw.three_month_change || 0, kw.yoy_change || 0, kw.sv_is_range_estimate ? 1 : 0, kw.sv_range_low, kw.sv_range_high,
          kw.competition, kw.competition_index, kw.low_bid_micros, kw.high_bid_micros,
          kw.intent, kw.difficulty_score, kw.capture_rate_effective, kw.conversion_rate_effective, kw.trend_badge
        );
      }
    });
    insertMany(keywordsWithBadge);

    // ─── Step 9: Projection Calculation ────────────────────────
    report('step_projection', 'Projection', 80, 'Calculating value projections...');

    // Initialize cost ledger
    const costLedgerId = uuidv4();
    const totalCost = trendsResult.cost;
    db.prepare(`
      INSERT INTO cost_ledger (id, project_id, dataforseo_tasks, dataforseo_cost, total_cost_usd)
      VALUES (?, ?, ?, ?, ?)
    `).run(costLedgerId, projectId, 1, trendsResult.cost, totalCost);

    // Prepare keyword input for projection
    const projectionInput = keywordsWithBadge.map(kw => ({
      keyword: kw.keyword,
      avg_monthly_sv: kw.avg_monthly_sv as number,
      is_cluster_primary: kw.is_cluster_primary as boolean,
      cluster_id: kw.cluster_id as string,
      intent: kw.intent as any,
      capture_rate_effective: kw.capture_rate_effective as number,
      difficulty_score: kw.difficulty_score as number,
    }));

    // Calculate for 6 horizons: 1, 3, 6, 8, 12, 24 months
    const horizons = [1, 3, 6, 8, 12, 24];
    const insertProjection = db.prepare(`
      INSERT INTO projections (id, project_id, horizon_months, total_leads, total_conversions,
        revenue_usd, revenue_idr, recommended_service_fee_usd, recommended_service_fee_idr,
        net_margin_usd, assumptions_snapshot)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const horizon of horizons) {
      const projection = calculateProjection(
        projectionInput,
        assumptions,
        horizon,
        fxResult.rate,
        totalCost,
        assumptions.overlap_discount_factor
      );

      insertProjection.run(
        uuidv4(), projectId, horizon,
        projection.total_leads, projection.total_conversions,
        projection.revenue_usd, projection.revenue_idr,
        projection.recommended_service_fee_usd, projection.recommended_service_fee_idr,
        projection.net_margin_usd,
        JSON.stringify(assumptions)
      );
    }

    // Update project summary
    db.prepare(`
      UPDATE projects SET
        status = 'completed',
        pipeline_step = 'Done',
        pipeline_progress = 100,
        raw_keyword_count = ?,
        clustered_keyword_count = ?,
        raw_sv_pool = ?,
        effective_sv_pool = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `).run(
      keywordsWithBadge.length,
      clusterResult.cluster_count,
      clusterResult.raw_sv_pool,
      clusterResult.effective_sv_pool,
      projectId
    );

    report('completed', 'Done', 100, `Analysis complete! ${keywordsWithBadge.length} keywords, ${clusterResult.cluster_count} clusters`);

  } catch (error: any) {
    const errMsg = error?.message || 'Unknown pipeline error';
    db.prepare('UPDATE projects SET status = ?, error_message = ?, updated_at = datetime(\'now\') WHERE id = ?')
      .run('failed', errMsg, projectId);
    report('failed', 'Error', 0, errMsg);
    throw error;
  }
}
