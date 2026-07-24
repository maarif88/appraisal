# YPYM Appraisal - Task Tracker

## Phase 1A: Backend Foundation + DB
- [x] Create project folder structure
- [x] Initialize backend (../../ypym-company/package.json, tsconfig, Express server)
- [x] Setup database config + migrations
- [x] SQLite integration (simple, robust database instead of PostgreSQL/Redis)
- [x] Environment variable config (.env.example)
- [x] Health check endpoint
- [x] Error handling middleware
- [x] CORS + rate limiting

## Phase 1B: Pipeline Services
- [x] Autocomplete expansion service
- [x] Google Ads API service (with mock fallback)
- [x] DataForSEO Trends service (with mock fallback)
- [x] Clustering service (Jaccard similarity)
- [x] Intent classification service
- [x] Difficulty weighting service
- [x] Projection service (S-curve ramp-up)
- [x] FX rate service
- [x] Cost ledger service
- [x] Pipeline orchestration job

## Phase 1C: API Endpoints
- [x] Project CRUD routes
- [x] Analysis trigger + status routes
- [x] Projection routes (re-run with new assumptions)
- [x] Export routes (JSON/CSV)

## Phase 1D: Frontend Foundation
- [x] Initialize Vite + React project
- [x] YPYM design system CSS (tokens, fonts, buttons, callouts)
- [x] Header component (YPYM-style)
- [x] Footer component (YPYM-style)
- [x] App shell + routing

## Phase 1E: Frontend Dashboard
- [x] Landing page
- [x] New project page (seed keyword form + parameters)
- [x] Dashboard page (full results)
  - [x] Summary cards
  - [x] Keyword table (interactive sorting & filtering)
  - [x] Trend chart (5-year LineChart with Recharts)
  - [x] Projection cards (1/12/24 months, dual currency)
  - [x] Cost ledger display
  - [x] Assumption panel (editable + instant re-run)
  - [x] Export buttons (JSON & CSV)
- [x] Project list page

## Phase 1F: Polish + Hardening
- [x] Error handling (API fallbacks per spec section 8)
- [x] Caching tables in schema
- [x] Integrate JSON compilation into collect_seo_data.py
- [/] Update migrate.ts to add SQLite sector column
- [x] Rate limiting & user agent rotations
- [x] Real-time pipeline status long-polling
- [x] Tracking tags (GA4, Clarity, Ahrefs)
