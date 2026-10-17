import { createPublicQuota, ensureVisitor, visitorHash, hashIdentity, publicProject, csvCell } from '../security/publicAccess.js';
import { getCatalog } from '../services/catalog.service.js';
import { keywordQuerySchema, mergeAssumptions } from '../utils/validators.js';
import { createAnalysisGuard } from '../security/analysisGuard.js';
import { env } from '../config/env.js';
import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { createProjectSchema } from '../utils/validators.js';
import { DEFAULT_ASSUMPTIONS } from '../utils/validators.js';
import { runPipeline } from '../services/pipeline.service.js';
import { calculateProjection } from '../services/projection.service.js';
import { calculateDifficultyScore, calculateCaptureRate } from '../services/difficulty.service.js';
import { getConversionMultiplier, type IntentType } from '../services/intent.service.js';
import { reprojectSchema } from '../utils/validators.js';

export const projectRouter = Router();
let analysisGuard:ReturnType<typeof createAnalysisGuard>|undefined;
function guard() { return analysisGuard ||= createAnalysisGuard(getDb(),env.ANALYSIS_MAX_PER_DAY,1,env.ANALYSIS_MAX_PER_CLIENT_DAY); }
let publicQuota:ReturnType<typeof createPublicQuota>|undefined;
function quota() { return publicQuota ||= createPublicQuota(getDb(),{global:env.PROJECTS_MAX_PER_DAY,perClient:env.PROJECTS_MAX_PER_CLIENT_DAY,stored:env.PROJECTS_MAX_STORED}); }
projectRouter.param('id',(req,res,next,id) => {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {res.status(400).json({error:'Invalid project ID'});return;}
  if (!['GET','HEAD','OPTIONS'].includes(req.method)) {
    const project=getDb().prepare('SELECT owner_hash,status FROM projects WHERE id=?').get(id) as any;
    if(!project){res.status(404).json({error:'Project not found'});return;}
    const owner=visitorHash(req);
    if(!owner || !project.owner_hash || owner!==project.owner_hash){res.status(403).json({error:'Only the browser that created this analysis can change it. Create your own analysis to make changes.'});return;}
    if(!['created','completed','failed'].includes(project.status)){res.status(409).json({error:'Analysis is running; please wait before making changes.'});return;}
  }
  next();
});
// Catalog aggregations are public and identical for all visitors. Bound repeated work.
const catalogResponses=new Map<string,{expires:number;body:unknown}>();
projectRouter.get(['/crawled-keywords','/sectors','/summary'],(req,res,next)=>{
  const key=req.path, cached=catalogResponses.get(key);
  if(cached && cached.expires>Date.now()){res.json(cached.body);return;}
  const send=res.json.bind(res);
  res.json=((body:unknown)=>{if(res.statusCode===200)catalogResponses.set(key,{expires:Date.now()+30000,body});return send(body);}) as typeof res.json;
  next();
});


// ─── Create Project ────────────────────────────────────────
projectRouter.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = createProjectSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
      return;
    }

    const input = parsed.data;
    const id = uuidv4();
    const assumptions = mergeAssumptions(DEFAULT_ASSUMPTIONS,input.assumptions);
    const owner = ensureVisitor(req,res,env.NODE_ENV==='production');
    if (!quota().claim(owner,hashIdentity(req.ip || req.socket.remoteAddress || 'unknown'))) {res.status(429).json({error:'The project creation limit has been reached. Please try again later.'});return;}

    const db = getDb();
    db.prepare(`
      INSERT INTO projects (id, seed_keyword, locale_country, locale_language,
        currency_base, currency_display, assumptions, status, sector, owner_hash)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'created', ?, ?)
    `).run(
      id,
      input.seed_keyword,
      input.locale_country,
      input.locale_language,
      input.currency_base,
      JSON.stringify(input.currency_display),
      JSON.stringify(assumptions),
      input.sector || 'General', owner
    );

    res.status(201).json({
      id,
      seed_keyword: input.seed_keyword,
      sector: input.sector || 'General',
      status: 'created',
      message: 'Project created. POST /api/v1/projects/:id/analyze to start analysis.',
    });
  } catch (error: any) {
    console.error('[API] Create project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── List Projects ─────────────────────────────────────────
projectRouter.get('/', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const projects = db.prepare(`
      SELECT id, owner_hash, seed_keyword, locale_country, locale_language, currency_base,
        status, pipeline_step, pipeline_progress,
        raw_keyword_count, clustered_keyword_count, raw_sv_pool, effective_sv_pool,
        created_at, updated_at, sector
      FROM projects ORDER BY created_at DESC LIMIT 1000
    `).all();

    res.json({ projects:projects.map(project=>publicProject(project,req)) });
  } catch (error: any) {
    console.error('[API] List projects error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Get Crawled Keywords ─────────────────────────────────
projectRouter.get('/crawled-keywords', (req: Request, res: Response) => {
  try {
    const jsonPath = path.resolve('./data/crawled_database.json');
    if (!fs.existsSync(jsonPath)) {
      res.json({ keywords: [], sectors: [] });
      return;
    }
    const database = getCatalog();
    
    const adsList = database.ads || [];
    
    const kwMap = new Map();
    for (const item of adsList) {
      const kw = item["Seed/Main Keyword"];
      if (!kw || kw === "Related/Alternative") continue;
      
      const location = item["Location"] || "ID";
      const lang = item["Language"] || "Indonesian";
      const key = `${kw.toLowerCase().trim()}_${location.toLowerCase().trim()}_${lang.toLowerCase().trim()}`;
      
      if (!kwMap.has(key)) {
        kwMap.set(key, {
          keyword: kw,
          sector: item["Sector"] || "General",
          lang: lang,
          location: location
        });
      }
    }
    
    const keywords = Array.from(kwMap.values());
    const sectors = Array.from(new Set(keywords.map(k => k.sector)));
    
    res.json({ keywords, sectors });
  } catch (error: any) {
    console.error('[API] Get crawled keywords error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Get Sectors Aggregate Analytics ────────────────────────
projectRouter.get('/sectors', (req: Request, res: Response) => {
  try {
    const jsonPath = path.resolve('./data/crawled_database.json');
    if (!fs.existsSync(jsonPath)) {
      res.json({ sectors: [] });
      return;
    }
    const database = getCatalog();

    const ads = database.ads || [];
    const suggestions = database.suggestions || [];
    const trendsTop = database.trends_top || [];
    const trendsRising = database.trends_rising || [];

    // Group ads by Sector and collect unique keywords
    const seedToSector = new Map<string, string>();
    for (const ad of ads) {
      const seed = ad["Seed/Main Keyword"];
      const sector = ad["Sector"];
      if (seed && sector) {
        seedToSector.set(seed.toLowerCase().trim(), sector);
      }
    }

    const sectorData = new Map<string, {
      sector: string;
      totalKeywords: number;
      totalSv: number;
      totalBiddingLow: number;
      totalBiddingHigh: number;
      biddingCount: number;
      avgTrendsIndexSum: number;
      avgTrendsCount: number;
      topQueriesCount: number;
      risingQueriesCount: number;
      suggestionsCount: number;
    }>();

    const getSectorObj = (name: string) => {
      const cleanName = name || 'General';
      if (!sectorData.has(cleanName)) {
        sectorData.set(cleanName, {
          sector: cleanName,
          totalKeywords: 0,
          totalSv: 0,
          totalBiddingLow: 0,
          totalBiddingHigh: 0,
          biddingCount: 0,
          avgTrendsIndexSum: 0,
          avgTrendsCount: 0,
          topQueriesCount: 0,
          risingQueriesCount: 0,
          suggestionsCount: 0,
        });
      }
      return sectorData.get(cleanName)!;
    };

    const uniqueKeywordsPerSector = new Map<string, Set<string>>();
    for (const ad of ads) {
      const sector = ad["Sector"] || 'General';
      const obj = getSectorObj(sector);
      const kw = ad["Keyword"];

      if (kw) {
        if (!uniqueKeywordsPerSector.has(sector)) {
          uniqueKeywordsPerSector.set(sector, new Set());
        }
        const kwSet = uniqueKeywordsPerSector.get(sector)!;
        if (!kwSet.has(kw.toLowerCase().trim())) {
          kwSet.add(kw.toLowerCase().trim());
          obj.totalKeywords += 1;
        }
      }

      obj.totalSv += parseInt(ad["Avg. monthly searches"]) || 0;

      const lowBid = parseFloat(ad["Top of page bid (low range)"]);
      const highBid = parseFloat(ad["Top of page bid (high range)"]);
      if (!isNaN(lowBid) && !isNaN(highBid) && lowBid > 0 && highBid > 0) {
        obj.totalBiddingLow += lowBid;
        obj.totalBiddingHigh += highBid;
        obj.biddingCount += 1;
      }
    }

    // Process suggestions
    for (const sug of suggestions) {
      const seed = sug["Seed/Main Keyword"];
      const sector = seed ? (seedToSector.get(seed.toLowerCase().trim()) || 'General') : 'General';
      const obj = getSectorObj(sector);
      obj.suggestionsCount += 1;
    }

    // Process trends top
    for (const t of trendsTop) {
      const seed = t["Seed/Main Keyword"];
      const sector = seed ? (seedToSector.get(seed.toLowerCase().trim()) || 'General') : 'General';
      const obj = getSectorObj(sector);
      obj.topQueriesCount += 1;
      const idx = parseInt(t["search interest index"]) || 0;
      if (idx > 0) {
        obj.avgTrendsIndexSum += idx;
        obj.avgTrendsCount += 1;
      }
    }

    // Process trends rising
    for (const r of trendsRising) {
      const seed = r["Seed/Main Keyword"];
      const sector = seed ? (seedToSector.get(seed.toLowerCase().trim()) || 'General') : 'General';
      const obj = getSectorObj(sector);
      obj.risingQueriesCount += 1;
    }

    // Format final response array
    const result = Array.from(sectorData.values()).map(s => {
      const avgTrends = s.avgTrendsCount > 0 ? Math.round(s.avgTrendsIndexSum / s.avgTrendsCount) : 50;
      const avgBiddingLow = s.biddingCount > 0 ? s.totalBiddingLow / s.biddingCount : 0.0;
      const avgBiddingHigh = s.biddingCount > 0 ? s.totalBiddingHigh / s.biddingCount : 0.0;

      // Generate 7 trend points for sparkline visualization (Ref 6 style)
      const trendPoints: number[] = [];
      const base = avgTrends > 0 ? avgTrends : 60;
      for (let i = 0; i < 7; i++) {
        const variation = Math.sin(i / 1.2) * 15 + (Math.random() * 8 - 4);
        trendPoints.push(Math.round(Math.max(10, Math.min(100, base + variation))));
      }

      return {
        sector: s.sector,
        total_keywords: s.totalKeywords,
        total_sv: s.totalSv,
        average_trends: avgTrends,
        top_queries_count: s.topQueriesCount,
        rising_queries_count: s.risingQueriesCount,
        suggestions_count: s.suggestionsCount,
        avg_bidding_low: parseFloat(avgBiddingLow.toFixed(2)),
        avg_bidding_high: parseFloat(avgBiddingHigh.toFixed(2)),
        trend_points: trendPoints
      };
    });

    res.json({ sectors: result });
  } catch (error: any) {
    console.error('[API] Get sectors data error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Get Global Summary & Weekly Calendar ──────────────────
projectRouter.get('/summary', (req: Request, res: Response) => {
  try {
    const jsonPath = path.resolve('./data/crawled_database.json');
    if (!fs.existsSync(jsonPath)) {
      res.json({
        total_sectors: 0,
        total_keywords: 0,
        total_sv: 0,
        avg_trends: 0,
        avg_bidding_low: 0,
        avg_bidding_high: 0,
        weekly_calendar: []
      });
      return;
    }
    const database = getCatalog();

    const ads = database.ads || [];
    const uniqueSectors = new Set<string>();
    const uniqueKeywords = new Set<string>();
    let totalSv = 0;
    let biddingLowSum = 0;
    let biddingHighSum = 0;
    let biddingCount = 0;

    for (const ad of ads) {
      if (ad["Sector"]) uniqueSectors.add(ad["Sector"]);
      if (ad["Keyword"]) uniqueKeywords.add(ad["Keyword"].toLowerCase().trim());
      totalSv += parseInt(ad["Avg. monthly searches"]) || 0;

      const lowBid = parseFloat(ad["Top of page bid (low range)"]);
      const highBid = parseFloat(ad["Top of page bid (high range)"]);
      if (!isNaN(lowBid) && !isNaN(highBid) && lowBid > 0 && highBid > 0) {
        biddingLowSum += lowBid;
        biddingHighSum += highBid;
        biddingCount += 1;
      }
    }

    const trendsTop = database.trends_top || [];
    let trendsIndexSum = 0;
    let trendsCount = 0;
    for (const t of trendsTop) {
      const idx = parseInt(t["search interest index"]) || 0;
      if (idx > 0) {
        trendsIndexSum += idx;
        trendsCount += 1;
      }
    }

    const avgTrends = trendsCount > 0 ? Math.round(trendsIndexSum / trendsCount) : 58;
    const avgBiddingLow = biddingCount > 0 ? biddingLowSum / biddingCount : 0.85;
    const avgBiddingHigh = biddingCount > 0 ? biddingHighSum / biddingCount : 2.80;

    // Weekly Calendar calculation (Last 7 weeks)
    const db = getDb();
    const projects = db.prepare('SELECT created_at, raw_keyword_count FROM projects').all() as any[];

    const weekly_calendar: Array<{ week_label: string; keyword_count: number; is_active: boolean }> = [];
    const now = new Date();
    
    // Get start of the current week (Monday)
    const currentDay = now.getDay();
    const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
    const currentMonday = new Date(now);
    currentMonday.setDate(now.getDate() - distanceToMonday);
    currentMonday.setHours(0, 0, 0, 0);

    for (let i = 6; i >= 0; i--) {
      const weekStart = new Date(currentMonday);
      weekStart.setDate(currentMonday.getDate() - i * 7);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);

      // Get ISO Week Number
      const target = new Date(weekStart.valueOf());
      const dayNr = (weekStart.getDay() + 6) % 7;
      target.setDate(target.getDate() - dayNr + 3);
      const firstThursday = target.valueOf();
      target.setMonth(0, 1);
      if (target.getDay() !== 4) {
        target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
      }
      const weekNum = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
      const weekLabel = `W${weekNum}`;

      // Sum keyword counts from projects created in this week
      let kwCount = 0;
      for (const p of projects) {
        if (p.created_at) {
          const createdDate = new Date(p.created_at);
          if (createdDate >= weekStart && createdDate < weekEnd) {
            kwCount += p.raw_keyword_count || 15;
          }
        }
      }

      // Dynamic baseline mock data if counts are 0
      if (kwCount === 0) {
        if (weekNum === 27) kwCount = 185;
        else if (weekNum === 28) kwCount = 420;
        else if (weekNum === 29) kwCount = 280;
        else if (i === 0) kwCount = 95; // current week
      }

      weekly_calendar.push({
        week_label: weekLabel,
        keyword_count: kwCount,
        is_active: i === 0
      });
    }

    res.json({
      total_sectors: uniqueSectors.size || 15,
      total_keywords: uniqueKeywords.size || 5800,
      total_sv: totalSv || 28400000,
      avg_trends: avgTrends,
      avg_bidding_low: parseFloat(avgBiddingLow.toFixed(2)),
      avg_bidding_high: parseFloat(avgBiddingHigh.toFixed(2)),
      weekly_calendar
    });
  } catch (error: any) {
    console.error('[API] Get summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Get Project Detail ────────────────────────────────────
projectRouter.get('/:id', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id) as any;

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    // Parse JSON fields
    project.assumptions = JSON.parse(project.assumptions || '{}');
    project.currency_display = JSON.parse(project.currency_display || '["USD","IDR"]');

    // Get keywords
    const keywords = db.prepare(`
      SELECT * FROM keywords WHERE project_id = ? ORDER BY avg_monthly_sv DESC
    `).all(req.params.id);

    // Get trend data
    const trends = db.prepare('SELECT * FROM trend_data WHERE project_id = ?').get(req.params.id) as any;
    if (trends) {
      trends.monthly_index_5y = JSON.parse(trends.monthly_index_5y || '[]');
      trends.top_queries = JSON.parse(trends.top_queries || '[]');
      trends.rising_queries = JSON.parse(trends.rising_queries || '[]');
    }

    // Get projections
    let projections = db.prepare(`
      SELECT * FROM projections WHERE project_id = ? ORDER BY horizon_months ASC
    `).all(req.params.id) as any[];

    for (const p of projections as any[]) {
      p.assumptions_snapshot = JSON.parse(p.assumptions_snapshot || '{}');
    }

    // Get cost ledger
    const costLedger = db.prepare('SELECT * FROM cost_ledger WHERE project_id = ?').get(req.params.id);

    res.json({
      project:publicProject(project,req),
      keywords,
      trends,
      projections,
      cost_ledger: costLedger,
    });
  } catch (error: any) {
    console.error('[API] Get project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Delete Project ────────────────────────────────────────
projectRouter.delete('/:id', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const result = db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    res.json({ message: 'Project deleted' });
  } catch (error: any) {
    console.error('[API] Delete project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Trigger Analysis ──────────────────────────────────────
projectRouter.post('/:id/analyze', async (req: Request, res: Response) => {
  let reserved = false;
  try {
    const db = getDb();
    const project = db.prepare('SELECT id, status FROM projects WHERE id = ?').get(req.params.id) as any;

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    if (!['created','completed','failed'].includes(project.status)) {
      res.status(409).json({ error: 'Analysis already running' });
      return;
    }

    if(!guard().claim(req.params.id as string,hashIdentity(req.ip || req.socket.remoteAddress || 'unknown'))){res.status(429).json({error:'Analysis is limited to one run per project per UTC day, one concurrent run, and the daily workspace quota.'});return;}
    reserved = true;
    // Clear previous results if re-running
    db.prepare('DELETE FROM keywords WHERE project_id = ?').run(req.params.id);
    db.prepare('DELETE FROM trend_data WHERE project_id = ?').run(req.params.id);
    db.prepare('DELETE FROM projections WHERE project_id = ?').run(req.params.id);
    db.prepare('DELETE FROM cost_ledger WHERE project_id = ?').run(req.params.id);
    db.prepare("UPDATE projects SET status = 'running', pipeline_progress = 0, error_message = '' WHERE id = ?")
      .run(req.params.id);

    // Run pipeline asynchronously
    res.json({ message: 'Analysis started', status: 'running' });

    // Fire and forget
    runPipeline(req.params.id as string).catch(() => {
      console.error('[Pipeline] Analysis failed');
    }).finally(()=>guard().release());
  } catch (error: any) {
    if (reserved) guard().release();
    console.error('[API] Analyze error');
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Get Pipeline Status ───────────────────────────────────
projectRouter.get('/:id/status', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const project = db.prepare(
      'SELECT id, status, pipeline_step, pipeline_progress, error_message FROM projects WHERE id = ?'
    ).get(req.params.id) as any;

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    if(project.error_message)project.error_message='Analysis could not be completed. Please try a supported keyword later.';
    res.json(project);
  } catch (error: any) {
    console.error('[API] Status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Get Keywords ──────────────────────────────────────────
projectRouter.get('/:id/keywords', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const parsed=keywordQuerySchema.safeParse(req.query);
    if(!parsed.success){res.status(400).json({error:'Invalid keyword filters'});return;}
    const {sort,order,intent,source}=parsed.data;

    let sql = 'SELECT * FROM keywords WHERE project_id = ?';
    const params: unknown[] = [req.params.id];

    if (intent) {
      sql += ' AND intent = ?';
      params.push(intent);
    }
    if (source) {
      sql += ' AND source = ?';
      params.push(source);
    }

    // Whitelist sortable columns
    const sortableColumns = ['avg_monthly_sv', 'difficulty_score', 'capture_rate_effective', 'keyword', 'intent', 'competition_index'];
    const sortCol = sortableColumns.includes(sort as string) ? sort : 'avg_monthly_sv';
    const sortDir = order === 'ASC' ? 'ASC' : 'DESC';
    sql += ` ORDER BY ${sortCol} ${sortDir}`;

    const keywords = db.prepare(sql).all(...params);
    res.json({ keywords, total: keywords.length });
  } catch (error: any) {
    console.error('[API] Keywords error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Re-run Projection ────────────────────────────────────
projectRouter.post('/:id/reproject', async (req: Request, res: Response) => {
  try {
    const parsed = reprojectSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
      return;
    }

    const db = getDb();
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id) as any;
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const baseAssumptions = mergeAssumptions(DEFAULT_ASSUMPTIONS,JSON.parse(project.assumptions || '{}'));
    const newAssumptions = mergeAssumptions(baseAssumptions,parsed.data.assumptions);

    // Recalculate difficulty and capture for all keywords with new assumptions
    const keywords = db.prepare('SELECT * FROM keywords WHERE project_id = ?').all(req.params.id) as any[];

    const updatedKeywords = keywords.map(kw => {
      const wordCount = kw.keyword.split(/\s+/).length;
      const difficultyScore = calculateDifficultyScore(kw.competition_index, wordCount, kw.intent as IntentType);
      const captureRateEffective = calculateCaptureRate(newAssumptions.capture_rate_target_pct, difficultyScore);
      const conversionMultiplier = getConversionMultiplier(kw.intent as IntentType, newAssumptions.conversion_rate_multiplier);
      const conversionRateEffective = newAssumptions.conversion_rate_pct * conversionMultiplier;

      return {
        keyword: kw.keyword,
        avg_monthly_sv: kw.avg_monthly_sv,
        is_cluster_primary: !!kw.is_cluster_primary,
        cluster_id: kw.cluster_id,
        intent: kw.intent as IntentType,
        capture_rate_effective: captureRateEffective,
        difficulty_score: difficultyScore,
      };
    });

    // Get cost
    const costLedger = db.prepare('SELECT total_cost_usd FROM cost_ledger WHERE project_id = ?').get(req.params.id) as any;
    const totalCost = costLedger?.total_cost_usd || 0;

    // Calculate projections for all 6 horizons
    const horizons = [1, 3, 6, 8, 12, 24];
    const projections = horizons.map(horizon =>
      calculateProjection(
        updatedKeywords,
        newAssumptions,
        horizon,
        project.fx_rate_usd_idr || 16400,
        totalCost,
        newAssumptions.overlap_discount_factor
      )
    );

    // Delete previous projections to prevent duplicates
    db.prepare('DELETE FROM projections WHERE project_id = ?').run(req.params.id);

    // Save new projection snapshots
    const insertProjection = db.prepare(`
      INSERT INTO projections (id, project_id, horizon_months, total_leads, total_conversions,
        revenue_usd, revenue_idr, recommended_service_fee_usd, recommended_service_fee_idr,
        net_margin_usd, assumptions_snapshot)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const p of projections) {
      insertProjection.run(
        uuidv4(), req.params.id, p.horizon_months,
        p.total_leads, p.total_conversions,
        p.revenue_usd, p.revenue_idr,
        p.recommended_service_fee_usd, p.recommended_service_fee_idr,
        p.net_margin_usd,
        JSON.stringify(newAssumptions)
      );
    }

    // Update project assumptions
    db.prepare('UPDATE projects SET assumptions = ?, updated_at = datetime(\'now\') WHERE id = ?')
      .run(JSON.stringify(newAssumptions), req.params.id);

    res.json({
      message: 'Projection recalculated with new assumptions',
      projections,
      assumptions: newAssumptions,
    });
  } catch (error: any) {
    console.error('[API] Reproject error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Export ────────────────────────────────────────────────
projectRouter.get('/:id/export/:format', (req: Request, res: Response) => {
  try {
    const format = req.params.format as string;
    if (!['json', 'csv'].includes(format)) {
      res.status(400).json({ error: 'Supported formats: json, csv' });
      return;
    }

    const db = getDb();
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id) as any;
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const keywords = db.prepare('SELECT * FROM keywords WHERE project_id = ? ORDER BY avg_monthly_sv DESC').all(req.params.id);
    const projections = db.prepare('SELECT * FROM projections WHERE project_id = ?').all(req.params.id);
    const costLedger = db.prepare('SELECT * FROM cost_ledger WHERE project_id = ?').get(req.params.id);

    if (format === 'json') {
      res.setHeader('Content-Disposition', `attachment; filename="seo-analysis-${project.id}.json"`);
      res.json({ project:publicProject(project,req), keywords, projections, cost_ledger: costLedger });
    } else if (format === 'csv') {
      const csvHeader = 'keyword,source,cluster_id,is_primary,avg_monthly_sv,intent,difficulty_score,capture_rate_effective,competition_index,trend_badge\n';
      const csvRows = (keywords as any[]).map(kw =>
        [kw.keyword,kw.source,kw.cluster_id,kw.is_cluster_primary,kw.avg_monthly_sv,kw.intent,kw.difficulty_score,kw.capture_rate_effective,kw.competition_index,kw.trend_badge].map(csvCell).join(',')
      ).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="seo-analysis-${project.id}.csv"`);
      res.send(csvHeader + csvRows);
    }
  } catch (error: any) {
    console.error('[API] Export error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Send PDF to Email ─────────────────────────────────────
projectRouter.post('/:id/email-report', (_req:Request,res:Response) => {
 res.status(501).json({error:'Email delivery is unavailable. Please download the report instead.'});
});
