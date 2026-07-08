import os
import sys
import re
import csv
import json
import asyncio
import datetime
import urllib.parse
import pandas as pd
import requests
from playwright.async_api import async_playwright

import argparse

# Configuration
DEFAULT_KEYWORDS = ["executive search", "employer of record", "seo services"]
PORT = 9222  # Remote debugging port for Chrome
TEMP_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "temp_downloads")

# Helper mappings for Google Trends parameters
def get_trends_geo_code(geo_name):
    g_lower = geo_name.lower().strip()
    if g_lower in ["global", "worldwide", "all", ""]:
        return ""
    mapping = {
        "indonesia": "ID",
        "indonesian": "ID",
        "united states": "US",
        "us": "US",
        "united kingdom": "GB",
        "uk": "GB",
        "singapore": "SG",
        "sg": "SG",
        "malaysia": "MY",
        "my": "MY",
        "australia": "AU",
        "au": "AU",
        "germany": "DE",
        "de": "DE",
        "france": "FR",
        "fr": "FR",
        "japan": "JP",
        "jp": "JP"
    }
    return mapping.get(g_lower, geo_name.upper())

def get_trends_gprop(gprop_val):
    gp_lower = gprop_val.lower().strip()
    if gp_lower in ["web", "web search", "all", ""]:
        return ""
    mapping = {
        "image": "images",
        "images": "images",
        "image search": "images",
        "news": "news",
        "news search": "news",
        "shopping": "froogle",
        "shopping search": "froogle",
        "shopping category": "froogle",
        "youtube": "youtube",
        "youtube search": "youtube"
    }
    return mapping.get(gp_lower, gp_lower)

def get_trends_timeframe(tf_val):
    tf_lower = tf_val.lower().strip()
    mapping = {
        "past 5 years": "today 5-y",
        "5 years": "today 5-y",
        "past 12 months": "today 12-m",
        "12 months": "today 12-m",
        "past 30 days": "today 1-m",
        "30 days": "today 1-m",
        "past 90 days": "today 3-m",
        "90 days": "today 3-m"
    }
    return mapping.get(tf_lower, tf_val)

# Helper functions to load and save crawled keywords history (crawled_keywords.md)
def load_crawled_history(history_path):
    crawled = set()
    if not os.path.exists(history_path):
        return crawled
    try:
        with open(history_path, 'r', encoding='utf-8') as f:
            content = f.read()
        matches = re.findall(r"-\s*[`]?([^`\n\r]+)[`]?", content)
        for m in matches:
            crawled.add(m.strip().lower())
    except Exception as e:
        print(f"[!] Error loading history file: {e}")
    return crawled

def save_crawled_history(history_path, keywords_list, sector="General"):
    existed = os.path.exists(history_path)
    try:
        with open(history_path, 'a', encoding='utf-8') as f:
            if not existed:
                f.write("# Crawled Keywords History\n\n")
                f.write("Daftar kata kunci yang pernah di-crawl oleh skrip otomatisasi.\n\n")
            f.write(f"\n## Sector: {sector} (Date: {datetime.date.today().isoformat()})\n")
            for kw in keywords_list:
                f.write(f"- `{kw}`\n")
        print(f"[SUCCESS] Updated crawling history tracker at: {history_path}")
    except Exception as e:
        print(f"[!] Error saving history file: {e}")

# Configure argument parser
parser = argparse.ArgumentParser(description="YPYM Automated SEO Data Collector & Scraper")
parser.add_argument("keywords", nargs="*", help="Seed keywords to crawl (comma-separated or multiple positional args)")
parser.add_argument("--lang", "-l", default="Indonesian", help="Language code or name (e.g. Indonesian, English, ID, EN)")
parser.add_argument("--geo", "-g", default="ID", help="Location code or name (e.g. ID, US, global, worldwide)")
parser.add_argument("--timeframe", "-t", default="today 5-y", help="Trends timeframe (e.g. today 5-y, today 12-m)")
parser.add_argument("--gprop", "-p", default="web", help="Trends search category/property (e.g. web, news, images, youtube)")
parser.add_argument("--sector", "-s", default="General", help="Industry sector/grouping (e.g. Banking, Insurance)")

args = parser.parse_args()

# Extract keywords
KEYWORDS = []
if args.keywords:
    joined_kws = " ".join(args.keywords)
    if "," in joined_kws:
        KEYWORDS = [k.strip() for k in joined_kws.split(",") if k.strip()]
    else:
        KEYWORDS = [k.strip() for k in args.keywords if k.strip()]
else:
    print("=" * 60)
    print("        YPYM AUTOMATED SEO DATA CRAWLER SETUP")
    print("=" * 60)
    print("Please enter the seed keywords you want to crawl.")
    print("You can separate multiple keywords with commas (e.g. executive search, seo services).")
    print(f"Or just press ENTER to use defaults: {DEFAULT_KEYWORDS}")
    print("-" * 60)
    user_input = input("Enter keywords: ").strip()
    if user_input:
        KEYWORDS = [k.strip() for k in user_input.split(",") if k.strip()]
    else:
        KEYWORDS = DEFAULT_KEYWORDS

ARGS_LANG = args.lang
ARGS_GEO = args.geo
ARGS_TIMEFRAME = args.timeframe
ARGS_GPROP = args.gprop
ARGS_SECTOR = args.sector

# Load history and filter duplicate keywords
HISTORY_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "crawled_keywords.md")
already_crawled = load_crawled_history(HISTORY_FILE)

active_keywords = []
skipped_keywords = []
for kw in KEYWORDS:
    if kw.lower().strip() in already_crawled:
        skipped_keywords.append(kw)
    else:
        active_keywords.append(kw.strip())

if skipped_keywords:
    print(f"\n[WARNING] The following keywords have already been crawled in previous runs and will be skipped:")
    for skw in skipped_keywords:
        print(f"  - {skw}")
    print("To force crawl, please remove them from 'crawled_keywords.md'.\n")

# Assign filtered active keywords
KEYWORDS = active_keywords

print(f"\n[*] Active keywords for crawling: {KEYWORDS}")
print(f"[*] Sector/Grouping: {ARGS_SECTOR}")
print(f"[*] Language parameter: {ARGS_LANG}")
print(f"[*] Location (GEO) parameter: {ARGS_GEO}")
print(f"[*] Google Trends Timeframe: {ARGS_TIMEFRAME}")
print(f"[*] Google Trends Property: {ARGS_GPROP}\n")

os.makedirs(TEMP_DIR, exist_ok=True)

def get_timestamp():
    return datetime.datetime.now().strftime("%Y-%m-%d at %H_%M_%S")

async def wait_for_visibility(locator, timeout_ms=5000):
    try:
        await locator.wait_for(state="visible", timeout=timeout_ms)
        return True
    except Exception:
        return False

# --- Step 1: Google Suggestion Scraper (Using Live Public Suggestion API) ---
def get_google_suggestions(keyword):
    print(f"[*] Fetching Google Suggestion Searchbox for: '{keyword}'...")
    hl_code = "id" if ARGS_LANG.lower() in ["indonesian", "indonesia", "id"] else "en"
    gl_code = get_trends_geo_code(ARGS_GEO)
    if not gl_code:
        gl_code = "US"
        
    url = f"https://suggestqueries.google.com/complete/search?client=chrome&q={urllib.parse.quote(keyword)}&hl={hl_code}&gl={gl_code.upper()}"
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            suggestions = data[1]
            rows = []
            for idx, sug in enumerate(suggestions, 1):
                rows.append({
                    "Date Request": get_timestamp(),
                    "Seed/Main Keyword": keyword,
                    "Suggestion": sug,
                    "Position": idx,
                    "Language": ARGS_LANG,
                    "Location": ARGS_GEO,
                    "Sector": ARGS_SECTOR
                })
            return rows
    except Exception as e:
        print(f"[!] Error fetching suggestions for {keyword}: {e}")
    return []

# --- Helper: Parse Google Trends CSV File ---
def parse_trends_csv(file_path, default_is_rising=False):
    print(f"[*] Parsing Google Trends CSV: {os.path.basename(file_path)}")
    top_queries = []
    rising_queries = []
    
    try:
        # Open file with UTF-8-sig to handle BOM mark if present
        with open(file_path, 'r', encoding='utf-8-sig', errors='ignore') as f:
            lines = f.readlines()
    except Exception as e:
        print(f"[!] Error reading Trends CSV {file_path}: {e}")
        return top_queries, rising_queries
        
    if not lines:
        return top_queries, rising_queries
        
    # Check if this is the combined old CSV format or separate new CSV format
    has_combined_markers = any("Top" in line or "Rising" in line for line in lines[:20])
    
    if has_combined_markers:
        print("[*] Detected combined Trends CSV format...")
        current_section = None
        for line in lines:
            line_str = line.strip()
            if not line_str:
                continue
            if "Related queries" in line_str:
                continue
            if line_str.startswith("Top"):
                current_section = "top"
                continue
            elif line_str.startswith("Rising"):
                current_section = "rising"
                continue
                
            try:
                parts = [p.strip() for p in csv.reader([line_str]).__next__()]
                if len(parts) >= 2:
                    query_val = parts[0]
                    metric_val = parts[1]
                    if query_val.lower() == "query":
                        continue
                    if current_section == "top":
                        top_queries.append({
                            "query": query_val,
                            "search interest index": metric_val,
                            "% increase": ""
                        })
                    elif current_section == "rising":
                        rising_queries.append({
                            "Query": query_val,
                            "search interest": "1",
                            "increase percent": metric_val
                        })
            except:
                continue
    else:
        print(f"[*] Detected separate Trends CSV format (is_rising={default_is_rising})...")
        data_started = False
        for line in lines:
            line_str = line.strip()
            if not line_str:
                continue
            if "Category:" in line_str or "Related queries" in line_str:
                continue
            try:
                parts = [p.strip() for p in csv.reader([line_str]).__next__()]
                if len(parts) >= 2:
                    query_val = parts[0]
                    metric_val = parts[1]
                    if query_val.lower() == "query":
                        data_started = True
                        continue
                    if data_started:
                        if default_is_rising:
                            rising_queries.append({
                                "Query": query_val,
                                "search interest": "1",
                                "increase percent": metric_val
                            })
                        else:
                            top_queries.append({
                                "query": query_val,
                                "search interest index": metric_val,
                                "% increase": ""
                            })
            except:
                continue
                
    return top_queries, rising_queries

# --- Main Playwright Scraper ---
async def run_scraper():
    print("=" * 60)
    print("        YPYM AUTOMATED SEO DATA COLLECTOR & SCRAPER")
    print("=" * 60)
    
    if not KEYWORDS:
        print("[*] No active keywords to crawl (all requested keywords were skipped as duplicates).")
        print("To force crawl, please remove them from 'crawled_keywords.md'.")
        print("Exiting...")
        return
        
    print(f"[*] Connecting to Google Chrome on port {PORT}...")
    print("[*] Make sure Chrome is running with debugging mode enabled:")
    print(f"    chrome.exe --remote-debugging-port={PORT}")
    print("-" * 60)
    
    # 1. Fetch suggestions first
    all_suggestions = []
    for kw in KEYWORDS:
        all_suggestions.extend(get_google_suggestions(kw))
        
    # 2. Start Playwright and connect over CDP
    try:
        pw = await async_playwright().start()
        browser = await pw.chromium.connect_over_cdp(f"http://localhost:{PORT}")
    except Exception as e:
        print(f"[ERROR] Could not connect to Chrome on port {PORT}!")
        print("Please follow these steps:")
        print("1. Close all active Google Chrome windows completely.")
        print(f"2. Launch Chrome via Command Prompt or PowerShell with remote debugging:")
        print(f"   start chrome --remote-debugging-port={PORT}")
        print("3. Log in to your Google Account (for Ads & Trends).")
        print("4. Re-run this script.")
        return
        
    context = browser.contexts[0]
    
    # Set download path for Playwright
    # (Playwright handles browser downloads automatically, but we can capture the event)
    
    all_trends_top = []
    all_trends_rising = []
    ads_csv_data = []
    
    # --- Step 2: Google Trends Scraper ---
    for kw in KEYWORDS:
        print(f"\n[*] Fetching Google Trends for: '{kw}'...")
        
        # Mapped parameters for Trends URL
        trends_geo = get_trends_geo_code(ARGS_GEO)
        trends_tf = get_trends_timeframe(ARGS_TIMEFRAME)
        trends_gprop = get_trends_gprop(ARGS_GPROP)
        
        query_params = {
            "q": kw,
            "date": trends_tf
        }
        if trends_geo:
            query_params["geo"] = trends_geo
        if trends_gprop:
            query_params["gprop"] = trends_gprop
            
        trends_url = f"https://trends.google.com/explore?{urllib.parse.urlencode(query_params)}"
        
        page = await context.new_page()
        try:
            # Use domcontentloaded for faster loading and fewer timeouts
            await page.goto(trends_url, wait_until="domcontentloaded", timeout=20000)
        except Exception as e:
            print(f"[!] Warning: Page navigation slow: {e}")
            
        print("[*] Waiting for Google Trends widgets to load (approx 8s)...")
        await page.wait_for_timeout(8000)
        
        # Locate the download button for Commonly/Related Queries (Top and Rising)
        try:
            # Locate Top Queries Download
            top_btn = page.locator("button[aria-label='Download top queries CSV']").first
            # Locate Rising Queries Download
            rising_btn = page.locator("button[aria-label='Download rising queries CSV']").first
            
            # Download Top Queries
            if await wait_for_visibility(top_btn, 5000) and not await top_btn.is_disabled():
                print("[*] Downloading Top queries CSV...")
                async with page.expect_download(timeout=10000) as download_info:
                    await top_btn.click()
                download = await download_info.value
                top_temp_path = os.path.join(TEMP_DIR, f"trends_{kw.replace(' ', '_')}_top.csv")
                await download.save_as(top_temp_path)
                top, _ = parse_trends_csv(top_temp_path, default_is_rising=False)
                
                # Add metadata columns
                for row in top:
                    row.update({
                        "Date Request": get_timestamp(),
                        "Data Timeframe": ARGS_TIMEFRAME,
                        "Location": ARGS_GEO,
                        "Category": ARGS_GPROP,
                        "Seed/Main Keyword": kw,
                        "Sector": ARGS_SECTOR
                    })
                all_trends_top.extend(top)
                print(f"[SUCCESS] Successfully captured Top Google Trends data for '{kw}'")
            else:
                print(f"[!] Top queries download button is not available or disabled (no data) for '{kw}'.")

            # Download Rising Queries
            if await wait_for_visibility(rising_btn, 5000) and not await rising_btn.is_disabled():
                print("[*] Downloading Rising queries CSV...")
                async with page.expect_download(timeout=10000) as download_info:
                    await rising_btn.click()
                download = await download_info.value
                rising_temp_path = os.path.join(TEMP_DIR, f"trends_{kw.replace(' ', '_')}_rising.csv")
                await download.save_as(rising_temp_path)
                _, rising = parse_trends_csv(rising_temp_path, default_is_rising=True)
                
                # Add metadata columns
                for row in rising:
                    row.update({
                        "Date Request": get_timestamp(),
                        "Data Timeframe": ARGS_TIMEFRAME,
                        "Location": ARGS_GEO,
                        "Category": ARGS_GPROP,
                        "Seed/Main Keyword": kw,
                        "Sector": ARGS_SECTOR
                    })
                all_trends_rising.extend(rising)
                print(f"[SUCCESS] Successfully captured Rising Google Trends data for '{kw}'")
            else:
                print(f"[!] Rising queries download button is not available or disabled (no data) for '{kw}'.")

        except Exception as e:
            # Fallback for old design / other selectors
            print(f"[!] Target selectors failed. Trying fallback related queries download selector: {e}")
            try:
                fallback_btn = page.locator("fe-related-queries div.widget-actions-item button[aria-label='Download'], fe-related-queries button.widget-actions-item").first
                if await wait_for_visibility(fallback_btn, 3000):
                    async with page.expect_download(timeout=10000) as download_info:
                        await fallback_btn.click()
                    download = await download_info.value
                    temp_path = os.path.join(TEMP_DIR, f"trends_{kw.replace(' ', '_')}.csv")
                    await download.save_as(temp_path)
                    top, rising = parse_trends_csv(temp_path)
                    # Add metadata
                    for row in top:
                        row.update({
                            "Date Request": get_timestamp(),
                            "Data Timeframe": ARGS_TIMEFRAME,
                            "Location": ARGS_GEO,
                            "Category": ARGS_GPROP,
                            "Seed/Main Keyword": kw,
                            "Sector": ARGS_SECTOR
                        })
                    for row in rising:
                        row.update({
                            "Date Request": get_timestamp(),
                            "Data Timeframe": ARGS_TIMEFRAME,
                            "Location": ARGS_GEO,
                            "Category": ARGS_GPROP,
                            "Seed/Main Keyword": kw,
                            "Sector": ARGS_SECTOR
                        })
                    all_trends_top.extend(top)
                    all_trends_rising.extend(rising)
                    print(f"[SUCCESS] Successfully captured Google Trends data via fallback for '{kw}'")
            except Exception as ex:
                print(f"[!] Warning: Could not download Google Trends CSV for '{kw}': {ex}")
                
        await page.close()

    # --- Step 3: Google Ads Keyword Planner Scraper ---
    ads_url = "https://ads.google.com/aw/keywordplanner/home?ocid=240500862&euid=248757585&__u=2028614665&uscid=240500862&__c=7392141838&authuser=0&__e=5073540066"
    print(f"\n[*] Navigating to Google Ads Keyword Planner...")
    
    page = await context.new_page()
    await page.goto(ads_url)
    
    print("[*] Please review the browser window.")
    print("[*] If you are not on the Keyword Ideas page, please do the following in Chrome:")
    print(f"    1. Input keywords: {', '.join(KEYWORDS)}")
    print("    2. Click 'Get Results' / 'Dapatkan Hasil'")
    print("    3. Wait for the keyword list table to load completely.")
    print("-" * 60)
    
    # Try to automate keyword input on Google Ads
    try:
        # Check if we are on the Home screen cards
        discover_card = page.locator("div.keyword-planner-home-card:has-text('Discover new keywords'), div.keyword-planner-home-card:has-text('Temukan kata kunci baru')").first
        if await wait_for_visibility(discover_card, 5000):
            print("[*] Automating click on 'Discover new keywords' card...")
            await discover_card.click()
            await page.wait_for_timeout(2000)
            
            # Find input textarea
            input_box = page.locator("textarea[placeholder*='Enter products'], textarea[placeholder*='Masukkan produk'], input[placeholder*='Enter products']").first
            if await input_box.is_visible():
                print("[*] Entering seed keywords...")
                keywords_str = ", ".join(KEYWORDS)
                await input_box.fill(keywords_str)
                await input_box.press("Enter")
                await page.wait_for_timeout(1000)
                
                # Click get results button
                get_results_btn = page.locator("button:has-text('Get results'), button:has-text('Dapatkan hasil')").first
                await get_results_btn.click()
                print("[*] Generating keyword ideas table...")
    except Exception as e:
        print(f"[*] Auto-filling input skipped (User can input manually if needed): {e}")

    # Guide user for downloading Google Ads CSV
    print("\n[IMPORTANT]")
    print("Because Google Ads UI is highly dynamic and sensitive to accounts, you can download the CSV yourself OR let the script try.")
    print("In Chrome, click the 'Download' arrow button at the top-right of the keywords table and select '.csv'.")
    print("Once downloaded, place the file in the script's directory OR specify the path.")
    print("Scanning for downloaded Google Ads CSV files...")
    
    # Try to automate Google Ads download button
    try:
        download_arrow = page.locator(".download-button, button[aria-label*='Download'], .keyword-planner-header-download-icon").first
        if await wait_for_visibility(download_arrow, 5000):
            print("[*] Detected Google Ads download button! Attempting click...")
            await download_arrow.click()
            await page.wait_for_timeout(2000)
            
            # Look for CSV option in menu
            csv_option = page.locator("div.menu-item:has-text('.csv'), span:has-text('.csv'), [role='menuitem']:has-text('CSV')").first
            if await csv_option.is_visible():
                async with page.expect_download(timeout=15000) as download_info:
                    await csv_option.click()
                download = await download_info.value
                
                ads_temp_path = os.path.join(TEMP_DIR, "google_ads_raw.csv")
                await download.save_as(ads_temp_path)
                print(f"[SUCCESS] Google Ads CSV downloaded successfully to {ads_temp_path}")
            else:
                print("[!] Could not find CSV option in download menu.")
    except Exception as e:
        print(f"[!] Auto-download Google Ads CSV failed: {e}")
        
    print("\n[*] Waiting for Google Ads CSV file. Checking local downloads folder...")
    
    # Fallback checking loop: look for recently downloaded csv in Temp directory or User's Downloads folder
    ads_csv_file = os.path.join(TEMP_DIR, "google_ads_raw.csv")
    
    # If not in TEMP_DIR, search in user's default Downloads folder
    downloads_path = os.path.join(os.path.expanduser("~"), "Downloads")
    
    found_file = None
    if os.path.exists(ads_csv_file):
        found_file = ads_csv_file
    else:
        # Search in Downloads folder for recent Google Ads CSV files
        print(f"[*] Searching for Google Ads CSV in: {downloads_path}...")
        csv_files = [f for f in os.listdir(downloads_path) if f.endswith(".csv") and ("Keyword Stats" in f or "Google Ads" in f or "local" in f)]
        if csv_files:
            # Get latest modified file
            csv_files.sort(key=lambda x: os.path.getmtime(os.path.join(downloads_path, x)), reverse=True)
            found_file = os.path.join(downloads_path, csv_files[0])
            print(f"[SUCCESS] Found downloaded file: {found_file}")

    if not found_file:
        print("\n[!] Google Ads Keyword Planner CSV not found automatically.")
        print(f"Please look at your Chrome window, click 'Download' -> '.csv' in the top right, and save it.")
        while True:
            val = input("Press ENTER once you have downloaded the CSV, or type 'skip' to skip Google Ads tab: ")
            if val.strip().lower() == 'skip':
                break
            # Re-check Downloads folder
            csv_files = [f for f in os.listdir(downloads_path) if f.endswith(".csv")]
            if csv_files:
                csv_files.sort(key=lambda x: os.path.getmtime(os.path.join(downloads_path, x)), reverse=True)
                found_file = os.path.join(downloads_path, csv_files[0])
                print(f"[SUCCESS] Found downloaded file: {found_file}")
                break
            print("[!] Still could not locate the CSV. Please make sure the file is in your Downloads folder.")

    # Parse Google Ads CSV
    if found_file:
        print(f"[*] Parsing Google Ads CSV: {found_file}...")
        try:
            # First, read lines to determine header index and encoding
            lines = []
            encoding = 'utf-16'
            try:
                with open(found_file, 'r', encoding='utf-16') as f:
                    lines = f.readlines()
                if not lines or len(lines[0]) < 2:
                    raise Exception("Invalid UTF-16")
            except Exception:
                encoding = 'utf-8-sig'
                with open(found_file, 'r', encoding='utf-8-sig', errors='ignore') as f:
                    lines = f.readlines()

            header_idx = 0
            for idx, line in enumerate(lines):
                if "Keyword" in line and ("Avg. monthly searches" in line or "Search Volume" in line or "Volume" in line):
                    header_idx = idx
                    break
            
            # Detect separator: check if tab character is in the header line
            delimiter = '\t' if '\t' in lines[header_idx] else ','
            print(f"[*] Reading Google Ads CSV with encoding={encoding} and separator={repr(delimiter)}...")
            
            df = pd.read_csv(found_file, skiprows=header_idx, encoding=encoding, sep=delimiter, on_bad_lines='skip')
            
            # Process columns and clean them up
            df.columns = [c.strip() for c in df.columns]
            
            # Determine start-end timeframe, language, and country from Google Ads CSV metadata if available
            timeframe_str = "June 1, 2025 - May 31, 2026"  # Default fallback
            ads_lang_str = None
            ads_geo_str = None
            
            for line in lines[:10]:
                tf_match = re.search(r"(\d{4}-\d{2}-\d{2})\s*-\s*(\d{4}-\d{2}-\d{2})", line)
                if tf_match:
                    d1 = datetime.datetime.strptime(tf_match.group(1), "%Y-%m-%d").strftime("%B %d, %Y")
                    d2 = datetime.datetime.strptime(tf_match.group(2), "%Y-%m-%d").strftime("%B %d, %Y")
                    timeframe_str = f"{d1} - {d2}"
                
                lang_match = re.search(r"Language[s]?[:\s\t]+([a-zA-Z\s\-]+)", line, re.IGNORECASE)
                if lang_match:
                    ads_lang_str = lang_match.group(1).strip()
                    
                geo_match = re.search(r"Location[s]?[:\s\t]+([a-zA-Z\s\-,]+)", line, re.IGNORECASE)
                if geo_match:
                    ads_geo_str = geo_match.group(1).strip()
            
            final_lang = ads_lang_str if ads_lang_str else ARGS_LANG
            final_geo = ads_geo_str if ads_geo_str else ARGS_GEO
            
            # Fill out the required specs rows
            for _, row in df.iterrows():
                kw_val = row.get("Keyword")
                if pd.isna(kw_val) or not str(kw_val).strip():
                    continue
                    
                # Determine which seed keyword matches (phrase matching first, then word overlap)
                matched_seed = "Related/Alternative"
                kw_lower = str(kw_val).lower()
                
                # First check for exact phrase matching
                for seed in KEYWORDS:
                    if seed.lower() in kw_lower:
                        matched_seed = seed
                        break
                
                # If no exact phrase matches, find the seed with highest word overlap
                if matched_seed == "Related/Alternative" and KEYWORDS:
                    kw_words = set(kw_lower.split())
                    best_overlap = 0
                    for seed in KEYWORDS:
                        seed_words = set(seed.lower().split())
                        overlap = len(kw_words.intersection(seed_words))
                        if overlap > best_overlap:
                            best_overlap = overlap
                            matched_seed = seed
                
                ads_csv_data.append({
                    "Data, Start-End": timeframe_str,
                    "Date Request": f"Keyword Stats {get_timestamp()}",
                    "Seed/Main Keyword": matched_seed,
                    "Keyword": kw_val,
                    "Currency": row.get("Currency", "IDR"),
                    "Avg. monthly searches": row.get("Avg. monthly searches", 0),
                    "Three month change": row.get("Three-month change", "0%"),
                    "YoY change": row.get("YoY change", "0%"),
                    "Competition": row.get("Competition", "Low"),
                    "Competition (indexed value)": row.get("Competition (indexed value)", 0),
                    "Top of page bid (low range)": row.get("Top of page bid (low range)", 0),
                    "Top of page bid (high range)": row.get("Top of page bid (high range)", 0),
                    "Language": final_lang,
                    "Location": final_geo,
                    "Sector": ARGS_SECTOR
                })
                
            print(f"[SUCCESS] Parsed {len(ads_csv_data)} keyword rows from Google Ads CSV.")
        except Exception as e:
            print(f"[!] Error parsing Google Ads CSV: {e}")
            
    # --- Step 4: Write to Multi-Tab Excel Spreadsheet ---
    excel_filename = f"SEO_Appraisal_Dataset_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    excel_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), excel_filename)
    
    print(f"\n[*] Compiling sheets and exporting to Excel: '{excel_filename}'...")
    
    df_ads = pd.DataFrame(ads_csv_data)
    df_trends_top = pd.DataFrame(all_trends_top)
    df_trends_rising = pd.DataFrame(all_trends_rising)
    df_suggestions = pd.DataFrame(all_suggestions)
    
    # If empty, create matching headers structure
    if df_ads.empty:
        df_ads = pd.DataFrame(columns=[
            "Data, Start-End", "Date Request", "Seed/Main Keyword", "Keyword", "Currency",
            "Avg. monthly searches", "Three month change", "YoY change", "Competition",
            "Competition (indexed value)", "Top of page bid (low range)", "Top of page bid (high range)",
            "Language", "Location", "Sector"
        ])
    if df_trends_top.empty:
        df_trends_top = pd.DataFrame(columns=[
            "Date Request", "Data Timeframe", "Location", "query", "search interest index", "% increase", "Category", "Seed/Main Keyword", "Sector"
        ])
    if df_trends_rising.empty:
        df_trends_rising = pd.DataFrame(columns=[
            "Date Request", "Data Timeframe", "Location", "Query", "search interest", "increase percent", "Category", "Seed/Main Keyword", "Sector"
        ])
    if df_suggestions.empty:
        df_suggestions = pd.DataFrame(columns=[
            "Date Request", "Seed/Main Keyword", "Suggestion", "Position", "Language", "Location", "Sector"
        ])
        
    with pd.ExcelWriter(excel_path, engine="openpyxl") as writer:
        df_ads.to_excel(writer, sheet_name="google ads - keyword ideas", index=False)
        df_trends_top.to_excel(writer, sheet_name="google trends - top keyword", index=False)
        df_trends_rising.to_excel(writer, sheet_name="google trends - raising keyword", index=False)
        df_suggestions.to_excel(writer, sheet_name="google suggestion", index=False)
        
    print(f"[SUCCESS] Excel file created successfully at: {excel_path}")
    
    # Save keywords list to crawled history tracker
    if KEYWORDS:
        save_crawled_history(HISTORY_FILE, KEYWORDS, sector=ARGS_SECTOR)
        
    # Compile Excel files to JSON database
    print("\n[*] Recompiling crawling results into central JSON database...")
    try:
        import subprocess
        comp_script = os.path.join(os.path.dirname(os.path.abspath(__file__)), "compile_excel_to_json.py")
        subprocess.run(["python", comp_script], check=True)
    except Exception as e:
        print(f"[!] Warning: Could not compile Excel files to JSON: {e}")
        
    print("=" * 60)
    print("                        TASK COMPLETED")
    print("=" * 60)
    
    await browser.close()
    await pw.stop()

if __name__ == "__main__":
    asyncio.run(run_scraper())
