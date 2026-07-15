# YPYM Appraisal - End-to-End SEO Data Flow Documentation

This document describes the complete flow of how SEO data is requested, collected, compiled, processed, and ultimately rendered as a unique dashboard URL on the YPYM Appraisal platform.

---

## 🔗 Project Map & Important File Links

To navigate easily across the workspace, you can use the direct links below:

### 📂 Main Directories
- 💼 **Appraisal Workspace**: [ypym-appraisal](file:///C:/Users/rochm/Documents/ypym-sandbox/ypym-appraisal)
  - 📚 **Project Index (Master Hub)**: [PROJECT_INDEX.md](file:///C:/Users/rochm/Documents/ypym-sandbox/ypym-appraisal/PROJECT_INDEX.md)
  - 🖥️ **Backend Service (Express/TS)**: [backend](file:///C:/Users/rochm/Documents/ypym-sandbox/ypym-appraisal/backend)
  - 🎨 **Frontend App (React/Vite)**: [frontend](file:///C:/Users/rochm/Documents/ypym-sandbox/ypym-appraisal/frontend)
  - 🕷️ **Crawler & Seeder Scripts**: [scripts](file:///C:/Users/rochm/Documents/ypym-sandbox/ypym-appraisal/scripts)
- 📱 **Mobile App (Flutter)**: [ypym-appraisal-app](file:///C:/Users/rochm/Documents/ypym-sandbox/ypym-appraisal-app) — YPYM Query Planner (Android + iOS)

### 📄 Documentation & Guides
- 📝 **Ecosystem Readme**: [README.md](file:///C:/Users/rochm/Documents/ypym-sandbox/ypym-appraisal/README.md)
- 📌 **Task Status Tracker**: [Task.md](file:///C:/Users/rochm/Documents/ypym-sandbox/ypym-appraisal/Task.md)
- 🗺️ **Implementation Plan**: [Implementation Plan.md](file:///C:/Users/rochm/Documents/ypym-sandbox/ypym-appraisal/Implementation%20Plan.md)
- 🔑 **API Setup & Keys Guide**: [API_SETUP_GUIDE.md](file:///C:/Users/rochm/Documents/ypym-sandbox/ypym-appraisal/API_SETUP_GUIDE.md)
- 📖 **SEO Profile & Pricing Story**: [SEO_Profile_Services_Story.md](file:///C:/Users/rochm/Documents/ypym-sandbox/ypym-appraisal/SEO_Profile_Services_Story.md)

### ⚙️ Core Codebase Files
- **Playwright Crawler**: [collect_seo_data.py](file:///C:/Users/rochm/Documents/ypym-sandbox/ypym-appraisal/scripts/collect_seo_data.py)
- **Excel JSON Compiler**: [compile_excel_to_json.py](file:///C:/Users/rochm/Documents/ypym-sandbox/ypym-appraisal/scripts/compile_excel_to_json.py)
- **Central JSON Database**: [crawled_database.json](file:///C:/Users/rochm/Documents/ypym-sandbox/ypym-appraisal/backend/data/crawled_database.json)
- **Calculations Pipeline**: [pipeline.service.ts](file:///C:/Users/rochm/Documents/ypym-sandbox/ypym-appraisal/backend/src/services/pipeline.service.ts)
- **SQLite Migrations**: [migrate.ts](file:///C:/Users/rochm/Documents/ypym-sandbox/ypym-appraisal/backend/src/config/migrate.ts)
- **Project Router API**: [project.routes.ts](file:///C:/Users/rochm/Documents/ypym-sandbox/ypym-appraisal/backend/src/routes/project.routes.ts)
- **Database Seeder script**: [seed.js](file:///C:/Users/rochm/Documents/ypym-sandbox/ypym-appraisal/backend/seed.js)
- **Frontend App Router**: [App.jsx](file:///C:/Users/rochm/Documents/ypym-sandbox/ypym-appraisal/frontend/src/App.jsx)
- **Setup Projection Page**: [NewProjectPage.jsx](file:///C:/Users/rochm/Documents/ypym-sandbox/ypym-appraisal/frontend/src/pages/NewProjectPage.jsx)
- **History List Page**: [ProjectListPage.jsx](file:///C:/Users/rochm/Documents/ypym-sandbox/ypym-appraisal/frontend/src/pages/ProjectListPage.jsx)

---

## 🗺️ Data Flow Architecture Diagram

```mermaid
flowchart TD
    subgraph Trigger & Crawl (Local Environment)
        A[User Orders AI Agent] -->|Runs Script| B[collect_seo_data.py]
        B -->|Playwright Automation| C[Google Trends Scrape]
        B -->|Browser Interaction| D[Google Ads Keyword Planner CSV]
        B -->|API Fetch| E[Google Search Autocomplete]
        C & D & E -->|Align & Map| F[Multi-Sheet Excel File]
    end

    subgraph Consolidation & Compilation
        F -->|Trigger Subprocess| G[compile_excel_to_json.py]
        G -->|Merges & Formats| H[crawled_database.json]
    end

    subgraph Backend Pipeline (Node.js & SQLite)
        I[Frontend UI Form Submit] -->|POST /api/v1/projects| J[Express Server]
        J -->|Triggers| K[pipeline.service.ts]
        H -->|Supplies Real Data| K
        K -->|Step 1-9 Calculations| L[SQLite Database]
    end

    subgraph Frontend UX & Routing (React)
        L -->|Responds with ID & Keyword| M[React Router /App.jsx]
        M -->|Dynamic Slug Formatting| N[Dashboard Page URL]
        N -->|Renders Projections| O[Dashboard Visual UI]
    end

    classDef blue fill:#0066cc,stroke:#004c99,color:#fff;
    classDef green fill:#34c759,stroke:#28a745,color:#fff;
    classDef orange fill:#ff9500,stroke:#e08200,color:#fff;
    class A,B,F blue;
    class H,L green;
    class N,O orange;
```

---

## 🔍 Detailed Phase-by-Phase Breakdown

### Phase 1: Triggering the Manual Crawl (User & AI Agent)
1. **User Action**: The user instructs the AI agent in the chat to collect SEO data for a target sector (e.g., *Banking* or *Insurance*).
2. **AI Action**: The agent invokes the Playwright crawling script with command-line arguments:
   ```bash
   python ypym-appraisal/scripts/collect_seo_data.py "bank terbaik, cash management" --geo ID --lang Indonesian --sector Banking
   ```
3. **Double-Request Filter**: The script cross-references `ypym-appraisal/scripts/crawled_history.md`. If a keyword has been successfully crawled before with the same parameters, it asks for user confirmation or skips it to prevent redundant API consumption.

---

### Phase 2: Playwright Automation & Data Capture
The script launches a Playwright automated browser instance to collect data from three distinct sources:
1. **Google Trends**:
   - Navigates to Google Trends interest-over-time pages.
   - Extracts related search queries (**Top** and **Rising** tables) and downloads raw CSVs.
2. **Google Ads (Keyword Planner)**:
   - Navigates to Google Ads Keyword Planner, signs in, and opens the "Get search volume and forecasts" tool.
   - Installs user-override prompts in non-headless mode: **The user enters target keywords, clicks search, and downloads the Keyword Stats CSV**.
   - The script detects the downloaded CSV file in the user's `C:\Users\rochm\Downloads` directory and extracts search volumes, Indexed Competition, and Low/High Bid CPC values.
3. **Google Search Autocomplete**:
   - Performs concurrent HTTP requests to Google Suggest API endpoints for autocomplete variants of each seed keyword.
4. **Keyword Mapping**:
   - For all downloaded rows, the script checks if they match a specific seed keyword (via exact phrase matching or word overlap).
   - Items that don't match any seed keyword are categorized as `"Related/Alternative"` but are preserved.
5. **Output**: Writes a compiled multi-sheet Excel workbook under:
   `ypym-appraisal/scripts/SEO_Appraisal_Dataset_[TIMESTAMP].xlsx`

---

### Phase 3: Central Database Compilation
1. At the end of the crawl script, it automatically launches the compiler:
   ```bash
   python compile_excel_to_json.py
   ```
2. The compiler scans the `scripts/` folder for all `SEO_Appraisal_Dataset_*.xlsx` workbooks.
3. It extracts and deduplicates records from all sheets (`ads`, `trends_top`, `trends_rising`, `suggestions`).
4. It writes a consolidated JSON database file at:
   `ypym-appraisal/backend/data/crawled_database.json`

---

### Phase 4: Backend Node.js Pipeline & Calculations
When a user launches a new projection on the website:
1. **API Post**: The React app sends a POST request to `/api/v1/projects` containing the target keyword, sector, and assumptions.
2. **Database Lookup**:
   - The backend opens `crawled_database.json` and locates records matching the project's `seed_keyword` (case-insensitive).
   - To build a robust projection pool, it extracts **all exact matching keywords** + **all alternative keywords belonging to the same sector** (e.g., *Banking*).
3. **Calculations (`pipeline.service.ts`)**:
   - **Autocomplete**: Loads search suggestion positions.
   - **Enrichment**: Maps Google Ads CPC bid micros and average search volumes.
   - **Trends**: Loads related top and rising trends.
   - **Intent & Difficulty**: Evaluates transaction intent rates and computes difficulty scores.
   - **ROI Projection**: Calculates traffic s-curve, leads, conversions, and target revenues for months 1, 3, 6, 8, 12, and 24.
4. **Persistence**: Saves calculated results into the local SQLite database (`projects`, `project_keywords`, `trend_data`).

---

### Phase 5: Frontend UX & SEO URL Rendering
1. **Dynamic URL Formatting**:
   Upon project creation success, the frontend maps the seed keyword into an SEO-friendly URL slug:
   ```javascript
   const kwSlug = encodeURIComponent((seed_keyword || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'));
   // Output: "bank-terbaik"
   ```
2. **React Routing (`App.jsx`)**:
   Loads the dashboard page matching the path:
   ```jsx
   <Route path="/projects/:id/:keywordSlug?" element={<DashboardPage />} />
   ```
   *Example Dynamic URL*: `http://localhost:5173/projects/c3113f12-e38f-4228-b912-f6974dab503d/bank-terbaik`
3. **Static Page Loading**:
   The dashboard retrieves pre-calculated metrics from SQLite instantly. It does not perform any heavy calculation or API requests on load, preventing server load while ensuring ultra-fast load times.

---

### Phase 6: Sector Aggregate Data Flow (App Specific)
To power the Sektor Analytics screen in the mobile app, a new aggregation flow is introduced:
1. **API Request**: The Flutter app requests `GET /api/v1/projects/sectors` on app load.
2. **Backend Processing (`project.routes.ts`)**:
   - The backend reads `crawled_database.json` and parses all sheets (`ads`, `suggestions`, `trends_top`, `trends_rising`).
   - Grouping is performed by the `"Sector"` attribute found in keyword records.
   - For each sector, the API computes the total unique keywords count, total search volumes pool, average search trends index, Google Trends query counts, autocomplete suggestion list size, and average low/high CPC bidding rates.
   - It generates 7 trend points per sector to draw smooth sparkline graphs.
3. **Flutter App Rendering**:
   - The app renders sector cards matching the **Health Metrics (Ref 6)** style with clean custom icons.
   - Micro-sparklines are plotted on the right side of each card using `fl_chart.LineChart`.
   - Expanding cards opens details displaying the 8 key metrics.

---

### Phase 7: Global Summary & Weekly Calendar Data Flow (App Specific)
To power the Noot App style Home Screen in the mobile app, a new summary and calendar aggregation flow is introduced:
1. **API Request**: The Flutter app requests `GET /api/v1/projects/summary` on app load.
2. **Backend Processing (`project.routes.ts`)**:
   - The backend aggregates stats across all sectors inside `crawled_database.json` to calculate:
     - `total_sectors`: Total unique sectors.
     - `total_keywords`: Deduplicated unique keywords pool.
     - `total_sv`: Cumulative search volume pool.
     - `avg_trends`: Global average trends interest index.
     - `avg_bidding_low` / `avg_bidding_high`: Average CPC bidding ranges.
   - For the **weekly calendar**, it queries the SQLite `projects` table for all created projects.
   - It iterates back 7 weeks, computes the start/end dates for each ISO week, and counts how many keywords were added (summing `raw_keyword_count` from projects created within that week's range).
3. **Flutter App Rendering**:
   - The app renders a horizontal scrollable row of the last 7 weeks (e.g. W24 to W30) at the top of the Home Screen (Ref 7 style).
   - Underneath, it renders a large summary statistics card showing the Search Volume pool, a circular trends indicator gauge, and three columns (Sektor, Kata Kunci, Tren) with colored underline bars matching Noot's nutrients styling.
   - Recently logged query projects are listed as timeline pills with distinct colors mapped by sector and heights determined by Search Volume size (Ref 9 style).

---

### Phase 8: Timeline-Style Query History & Sector Metrics Data Flow (App Specific)
To power the Timeline style Query History Feed on the Home Screen, we introduced the following logic:
1. **Model Extension**: The `Project` model in [models.dart](file:///c:/Users/rochm/Documents/ypym-sandbox/ypym-appraisal-app/lib/models/models.dart) was expanded to include `rawKeywordCount` and `rawSvPool` to map dynamic metrics from the backend.
2. **Visual Mapping**:
   - **Color by Sector**: Each sector carries a distinct premium color (e.g. Technology -> Blue, Banking -> Purple, Insurance -> Orange, Finance -> Teal, E-commerce -> Pink, Healthcare -> Red...).
   - **Height by Search Volume**: The height of each timeline capsule is calculated dynamically based on its `rawSvPool` (clamped between 48 and 110 pixels), creating a visual indication of market size.
   - **Continuous Line Segment**: The timeline items are rendered using an overlapping vertical line, connecting the capsules into a continuous line (Ref 9 style).
3. **Redirection & Refreshes**: Tapping any log item navigates the user to the Project Dashboard instantly.
