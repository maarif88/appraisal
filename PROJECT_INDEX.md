# YPYM Appraisal & Query Planner - Project Index

> **Function (EN)**: Central documentation hub linking all project files for the YPYM Appraisal ecosystem (web + mobile app).
> **Fungsi (ID)**: Hub dokumentasi utama yang menghubungkan semua file proyek ekosistem YPYM Appraisal (web + mobile app).
> 
> **Created**: 2026-07-14 | **Last Modified**: 2026-07-15T08:50:00+07:00 (Header updates & Contact popup adjustments)

---

## 1. Product Identity

| Property | Value |
|----------|-------|
| **Product Code** | `ypym-appraisal` |
| **Web Product Name** | YPYM Appraisal |
| **App Product Name** | YPYM Query Planner |
| **Web Staging URL** | [appraisal.ypym.app](https://appraisal.ypym.app) |
| **Backend API Port** | `3100` |
| **Access Model** | Public (tanpa login) |

---

## 2. Workspace Structure

```
ypym-sandbox/
├── ypym-appraisal/               # Web platform + shared backend
│   ├── backend/                   # Node.js Express API (port 3100)
│   ├── frontend/                  # React (Vite) web client (port 5173)
│   ├── scripts/                   # Crawler & seeder scripts
│   └── [documentation files]
│
├── ypym-appraisal-app/            # Flutter mobile app (Android + iOS)
│   └── lib/                       # Dart source code
│
└── ypym-company/                  # YPYM ecosystem root
    ├── frontend/YPYM_DESIGN_SYSTEM.md
    └── YPYM_APP_STAGING.md
```

---

## 3. Documentation Map

### 📋 Project Management
| File | Deskripsi |
|------|-----------|
| 📌 [Task.md](file:///C:/Users/rochm/Documents/ypym-sandbox/ypym-appraisal/Task.md) | Task tracker (Phase 1A-1F status) |
| 📝 [README.md](file:///C:/Users/rochm/Documents/ypym-sandbox/ypym-appraisal/README.md) | Quick start guide, prerequisites, test cases |

### 🏗️ Architecture & Implementation Plans
| File | Platform | Deskripsi |
|------|----------|-----------|
| 🗺️ [Implementation Plan.md](file:///C:/Users/rochm/Documents/ypym-sandbox/ypym-appraisal/Implementation%20Plan.md) | Web + Backend | Arsitektur sistem, API endpoints, pipeline services, frontend components |
| 📱 [implementation-plan-backend.md](file:///C:/Users/rochm/Documents/ypym-sandbox/ypym-appraisal-app/implementation-plan-backend.md) | App (Flutter) | YPYM Query Planner mobile app architecture & shared backend reference |

### 📊 Data & Business Logic
| File | Deskripsi |
|------|-----------|
| 🔗 [DATA_FLOW_DOC.md](file:///C:/Users/rochm/Documents/ypym-sandbox/ypym-appraisal/DATA_FLOW_DOC.md) | End-to-end data flow dari crawl → compilation → pipeline → dashboard URL |
| 📖 [SEO_Profile_Services_Story.md](file:///C:/Users/rochm/Documents/ypym-sandbox/ypym-appraisal/SEO_Profile_Services_Story.md) | Logic story & formula perhitungan harga jasa SEO |

### 🔑 Setup & Configuration
| File | Deskripsi |
|------|-----------|
| 🔑 [API_SETUP_GUIDE.md](file:///C:/Users/rochm/Documents/ypym-sandbox/ypym-appraisal/API_SETUP_GUIDE.md) | Panduan mendapatkan Google Ads API & DataForSEO credentials |

### 🎨 Design & Ecosystem
| File | Deskripsi |
|------|-----------|
| 🎨 [YPYM_DESIGN_SYSTEM.md](file:///C:/Users/rochm/Documents/ypym-sandbox/ypym-company/frontend/YPYM_DESIGN_SYSTEM.md) | YPYM visual design system (colors, typography, buttons, callouts) |
| 🚀 [YPYM_APP_STAGING.md](file:///C:/Users/rochm/Documents/ypym-sandbox/ypym-company/YPYM_APP_STAGING.md) | Panduan staging & deployment seluruh ekosistem YPYM |

---

## 4. Core Codebase Quick Links

### Backend (Express/TypeScript)
| File | Fungsi |
|------|--------|
| [pipeline.service.ts](file:///C:/Users/rochm/Documents/ypym-sandbox/ypym-appraisal/backend/src/services/pipeline.service.ts) | Pipeline kalkulasi utama (9 steps) |
| [project.routes.ts](file:///C:/Users/rochm/Documents/ypym-sandbox/ypym-appraisal/backend/src/routes/project.routes.ts) | API CRUD projects |
| [migrate.ts](file:///C:/Users/rochm/Documents/ypym-sandbox/ypym-appraisal/backend/src/config/migrate.ts) | SQLite schema migrations |
| [seed.js](file:///C:/Users/rochm/Documents/ypym-sandbox/ypym-appraisal/backend/seed.js) | Database seeder |

### Frontend Web (React/Vite)
| File | Fungsi |
|------|--------|
| [App.jsx](file:///C:/Users/rochm/Documents/ypym-sandbox/ypym-appraisal/frontend/src/App.jsx) | React router & app shell |
| [NewProjectPage.jsx](file:///C:/Users/rochm/Documents/ypym-sandbox/ypym-appraisal/frontend/src/pages/NewProjectPage.jsx) | Form input seed keyword |
| [ProjectListPage.jsx](file:///C:/Users/rochm/Documents/ypym-sandbox/ypym-appraisal/frontend/src/pages/ProjectListPage.jsx) | History list halaman projek |

### Scripts (Python)
| File | Fungsi |
|------|--------|
| [collect_seo_data.py](file:///C:/Users/rochm/Documents/ypym-sandbox/ypym-appraisal/scripts/collect_seo_data.py) | Playwright crawler (Trends, Ads, Autocomplete) |
| [compile_excel_to_json.py](file:///C:/Users/rochm/Documents/ypym-sandbox/ypym-appraisal/scripts/compile_excel_to_json.py) | Excel → JSON compiler |

---

## 5. Technology Stack Summary

| Layer | Technology | Version |
|-------|------------|---------|
| **Backend API** | Node.js + Express + TypeScript | v20.20.0 LTS |
| **Database** | SQLite (via better-sqlite3) | - |
| **Web Frontend** | React + Vite + Vanilla CSS | Vite 5.x |
| **Mobile App** | Flutter (Dart) | Latest stable |
| **Data Crawler** | Python + Playwright | 3.x |
| **Charts** | Recharts (web) / fl_chart (app) | - |
| **Deployment** | Coolify | - |

---

## 6. API Endpoints Summary

Backend berjalan di port `3100`. Semua endpoint di-prefix dengan `/api/v1/`.

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `POST` | `/api/v1/projects` | Create project (seed keyword + params) |
| `GET` | `/api/v1/projects` | List all projects |
| `GET` | `/api/v1/projects/sectors` | Get aggregate sector metrics (app specific) |
| `GET` | `/api/v1/projects/summary` | Get global aggregate summary stats and weekly calendar |
| `GET` | `/api/v1/projects/:id` | Get project detail |
| `DELETE` | `/api/v1/projects/:id` | Delete project |
| `POST` | `/api/v1/projects/:id/analyze` | Trigger full pipeline |
| `GET` | `/api/v1/projects/:id/status` | Get pipeline progress |
| `GET` | `/api/v1/projects/:id/keywords` | Get keywords |
| `GET` | `/api/v1/projects/:id/trends` | Get trend data |
| `POST` | `/api/v1/projects/:id/reproject` | Re-run projection |
| `GET` | `/api/v1/projects/:id/projections` | Get projections |
| `GET` | `/api/v1/projects/:id/export/:format` | Export (JSON/CSV) |

---

*Project Index - YPYM Appraisal & Query Planner Ecosystem*
