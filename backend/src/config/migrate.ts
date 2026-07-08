import { getDb, closeDb } from './database.js';

const SCHEMA = `
-- ═══════════════════════════════════════════════════
-- YPYM Appraisal - Database Schema
-- ═══════════════════════════════════════════════════

-- Projects table: each analysis run
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  seed_keyword TEXT NOT NULL,
  locale_country TEXT NOT NULL DEFAULT 'ID',
  locale_language TEXT NOT NULL DEFAULT 'id',
  currency_base TEXT NOT NULL DEFAULT 'USD',
  currency_display TEXT NOT NULL DEFAULT '["USD","IDR"]',
  fx_rate_usd_idr REAL DEFAULT 16400,
  fx_rate_source TEXT DEFAULT '',
  fx_rate_fetched_at TEXT DEFAULT '',
  sector TEXT DEFAULT 'General',
  
  -- User-configurable assumptions (JSON)
  assumptions TEXT NOT NULL DEFAULT '{}',
  
  -- Pipeline status
  status TEXT NOT NULL DEFAULT 'created',
  pipeline_step TEXT DEFAULT '',
  pipeline_progress INTEGER DEFAULT 0,
  error_message TEXT DEFAULT '',
  
  -- Counts (denormalized for quick display)
  raw_keyword_count INTEGER DEFAULT 0,
  clustered_keyword_count INTEGER DEFAULT 0,
  raw_sv_pool INTEGER DEFAULT 0,
  effective_sv_pool INTEGER DEFAULT 0,
  
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Keywords table: all discovered keywords per project
CREATE TABLE IF NOT EXISTS keywords (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'seed',
  cluster_id TEXT DEFAULT '',
  is_cluster_primary INTEGER DEFAULT 0,
  avg_monthly_sv INTEGER DEFAULT 0,
  three_month_change INTEGER DEFAULT 0,
  yoy_change INTEGER DEFAULT 0,
  sv_is_range_estimate INTEGER DEFAULT 0,
  sv_range_low INTEGER DEFAULT 0,
  sv_range_high INTEGER DEFAULT 0,
  competition TEXT DEFAULT '',
  competition_index INTEGER DEFAULT 0,
  low_bid_micros INTEGER DEFAULT 0,
  high_bid_micros INTEGER DEFAULT 0,
  intent TEXT DEFAULT 'commercial',
  difficulty_score REAL DEFAULT 0,
  capture_rate_effective REAL DEFAULT 0,
  conversion_rate_effective REAL DEFAULT 0,
  trend_badge TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_keywords_project ON keywords(project_id);
CREATE INDEX IF NOT EXISTS idx_keywords_cluster ON keywords(project_id, cluster_id);

-- Trend data per project
CREATE TABLE IF NOT EXISTS trend_data (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  monthly_index_5y TEXT NOT NULL DEFAULT '[]',
  top_queries TEXT NOT NULL DEFAULT '[]',
  rising_queries TEXT NOT NULL DEFAULT '[]',
  fetched_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_trend_project ON trend_data(project_id);

-- Cost ledger per project
CREATE TABLE IF NOT EXISTS cost_ledger (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  google_ads_api_requests INTEGER DEFAULT 0,
  google_ads_api_cost REAL DEFAULT 0,
  dataforseo_tasks INTEGER DEFAULT 0,
  dataforseo_cost REAL DEFAULT 0,
  fx_api_requests INTEGER DEFAULT 0,
  autocomplete_requests INTEGER DEFAULT 0,
  total_cost_usd REAL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_cost_project ON cost_ledger(project_id);

-- Projection snapshots (multiple per project - each re-run creates new)
CREATE TABLE IF NOT EXISTS projections (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  horizon_months INTEGER NOT NULL,
  total_leads REAL DEFAULT 0,
  total_conversions REAL DEFAULT 0,
  revenue_usd REAL DEFAULT 0,
  revenue_idr REAL DEFAULT 0,
  recommended_service_fee_usd REAL DEFAULT 0,
  recommended_service_fee_idr REAL DEFAULT 0,
  net_margin_usd REAL DEFAULT 0,
  assumptions_snapshot TEXT NOT NULL DEFAULT '{}',
  calculated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_projections_project ON projections(project_id);

-- Keyword cache (cross-project, TTL-based)
CREATE TABLE IF NOT EXISTS keyword_cache (
  keyword_hash TEXT PRIMARY KEY,
  keyword TEXT NOT NULL,
  data TEXT NOT NULL DEFAULT '{}',
  fetched_at TEXT NOT NULL DEFAULT (datetime('now')),
  ttl_days INTEGER DEFAULT 30
);

-- Trend cache (cross-project, TTL-based)
CREATE TABLE IF NOT EXISTS trend_cache (
  keyword_hash TEXT PRIMARY KEY,
  keyword TEXT NOT NULL,
  data TEXT NOT NULL DEFAULT '{}',
  fetched_at TEXT NOT NULL DEFAULT (datetime('now')),
  ttl_days INTEGER DEFAULT 7
);
`;

export function runMigrations(): void {
  const db = getDb();
  console.log('[Migration] Running database migrations...');
  db.exec(SCHEMA);
  
  // Try adding sector column to projects table if it doesn't exist
  try {
    db.exec("ALTER TABLE projects ADD COLUMN sector TEXT DEFAULT 'General'");
    console.log('[Migration] SQLite table updated: added sector column.');
  } catch (e) {
    // Ignore error if column already exists
  }

  // Try adding three_month_change column to keywords table if it doesn't exist
  try {
    db.exec("ALTER TABLE keywords ADD COLUMN three_month_change INTEGER DEFAULT 0");
    console.log('[Migration] SQLite table updated: added three_month_change column.');
  } catch (e) {}

  // Try adding yoy_change column to keywords table if it doesn't exist
  try {
    db.exec("ALTER TABLE keywords ADD COLUMN yoy_change INTEGER DEFAULT 0");
    console.log('[Migration] SQLite table updated: added yoy_change column.');
  } catch (e) {}
  
  console.log('[Migration] Migrations completed successfully.');
}

// Run directly if called as script
if (process.argv[1]?.endsWith('migrate.ts') || process.argv[1]?.endsWith('migrate.js')) {
  runMigrations();
  closeDb();
  console.log('[Migration] Done.');
}
