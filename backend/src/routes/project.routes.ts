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
    const assumptions = { ...DEFAULT_ASSUMPTIONS, ...input.assumptions };

    const db = getDb();
    db.prepare(`
      INSERT INTO projects (id, seed_keyword, locale_country, locale_language,
        currency_base, currency_display, assumptions, status, sector)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'created', ?)
    `).run(
      id,
      input.seed_keyword,
      input.locale_country,
      input.locale_language,
      input.currency_base,
      JSON.stringify(input.currency_display),
      JSON.stringify(assumptions),
      input.sector || 'General'
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
      SELECT id, seed_keyword, locale_country, locale_language, currency_base,
        status, pipeline_step, pipeline_progress,
        raw_keyword_count, clustered_keyword_count, raw_sv_pool, effective_sv_pool,
        created_at, updated_at, sector
      FROM projects ORDER BY created_at DESC
    `).all();

    res.json({ projects });
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
    const content = fs.readFileSync(jsonPath, 'utf-8');
    const database = JSON.parse(content);
    
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

    // Self-healing: if count is not 6, or has duplicates, recalculate all 6 horizons
    const uniqueHorizons = new Set(projections.map(p => p.horizon_months));
    if (project.status === 'completed' && (projections.length !== 6 || uniqueHorizons.size !== 6)) {
      // Delete old ones
      db.prepare('DELETE FROM projections WHERE project_id = ?').run(req.params.id);

      // Get cost
      const costLedgerRecord = db.prepare('SELECT total_cost_usd FROM cost_ledger WHERE project_id = ?').get(req.params.id) as any;
      const totalCost = costLedgerRecord?.total_cost_usd || 0;

      // Recalculate
      const baseAssumptions = { ...DEFAULT_ASSUMPTIONS, ...project.assumptions };
      const horizons = [1, 3, 6, 8, 12, 24];
      
      const updatedKeywords = keywords.map((kw: any) => ({
        keyword: kw.keyword,
        avg_monthly_sv: kw.avg_monthly_sv,
        is_cluster_primary: !!kw.is_cluster_primary,
        cluster_id: kw.cluster_id,
        intent: kw.intent,
        capture_rate_effective: kw.capture_rate_effective,
        difficulty_score: kw.difficulty_score,
      }));

      const insertProjection = db.prepare(`
        INSERT INTO projections (id, project_id, horizon_months, total_leads, total_conversions,
          revenue_usd, revenue_idr, recommended_service_fee_usd, recommended_service_fee_idr,
          net_margin_usd, assumptions_snapshot)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const horizon of horizons) {
        const p = calculateProjection(
          updatedKeywords,
          baseAssumptions,
          horizon,
          project.fx_rate_usd_idr || 16400,
          totalCost,
          baseAssumptions.overlap_discount_factor
        );

        insertProjection.run(
          uuidv4(), req.params.id, horizon,
          p.total_leads, p.total_conversions,
          p.revenue_usd, p.revenue_idr,
          p.recommended_service_fee_usd, p.recommended_service_fee_idr,
          p.net_margin_usd,
          JSON.stringify(baseAssumptions)
        );
      }

      // Fetch again
      projections = db.prepare(`
        SELECT * FROM projections WHERE project_id = ? ORDER BY horizon_months ASC
      `).all(req.params.id) as any[];
    }

    for (const p of projections as any[]) {
      p.assumptions_snapshot = JSON.parse(p.assumptions_snapshot || '{}');
    }

    // Get cost ledger
    const costLedger = db.prepare('SELECT * FROM cost_ledger WHERE project_id = ?').get(req.params.id);

    res.json({
      project,
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
  try {
    const db = getDb();
    const project = db.prepare('SELECT id, status FROM projects WHERE id = ?').get(req.params.id) as any;

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    if (project.status === 'running') {
      res.status(409).json({ error: 'Analysis already running' });
      return;
    }

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
    runPipeline(req.params.id as string).catch(err => {
      console.error(`[Pipeline] Failed for project ${req.params.id}:`, err);
    });
  } catch (error: any) {
    console.error('[API] Analyze error:', error);
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
    const { sort = 'avg_monthly_sv', order = 'DESC', intent, source } = req.query;

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

    const baseAssumptions = { ...DEFAULT_ASSUMPTIONS, ...JSON.parse(project.assumptions || '{}') };
    const newAssumptions = { ...baseAssumptions, ...parsed.data.assumptions };

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
      res.setHeader('Content-Disposition', `attachment; filename="seo-analysis-${project.seed_keyword}.json"`);
      res.json({ project, keywords, projections, cost_ledger: costLedger });
    } else if (format === 'csv') {
      const csvHeader = 'keyword,source,cluster_id,is_primary,avg_monthly_sv,intent,difficulty_score,capture_rate_effective,competition_index,trend_badge\n';
      const csvRows = (keywords as any[]).map(kw =>
        `"${kw.keyword}","${kw.source}","${kw.cluster_id}",${kw.is_cluster_primary},${kw.avg_monthly_sv},"${kw.intent}",${kw.difficulty_score},${kw.capture_rate_effective},${kw.competition_index},"${kw.trend_badge}"`
      ).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="seo-analysis-${project.seed_keyword}.csv"`);
      res.send(csvHeader + csvRows);
    }
  } catch (error: any) {
    console.error('[API] Export error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Send PDF to Email ─────────────────────────────────────
projectRouter.post('/:id/email-report', async (req: Request, res: Response) => {
  try {
    const { email, pdfBase64 } = req.body;
    if (!email || !pdfBase64) {
      res.status(400).json({ error: 'Recipient email and PDF data are required' });
      return;
    }

    const db = getDb();
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id) as any;
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(pdfBase64, 'base64');
    
    // Ensure data/sent_emails directory exists
    const dir = path.join(process.cwd(), 'data', 'sent_emails');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Filename: timestamp_email_project.pdf
    const safeEmail = email.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `${Date.now()}_${safeEmail}_${project.seed_keyword.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    const filePath = path.join(dir, filename);
    
    fs.writeFileSync(filePath, buffer);

    console.log(`[Email Service] PDF report generated and emailed to ${email}. Saved to: ${filePath}`);

    res.status(200).json({
      success: true,
      message: `Appraisal report successfully emailed to ${email}!`,
      saved_path: filePath
    });
  } catch (error: any) {
    console.error('[API] Email report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
