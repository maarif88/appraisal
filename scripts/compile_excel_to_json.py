import os
import glob
import json
import pandas as pd
import numpy as np

def clean_row(row):
    # Convert numpy types to python standard types, handle NaNs
    new_row = {}
    for k, v in row.items():
        if pd.isna(v):
            new_row[k] = None
        elif isinstance(v, (np.integer, np.int64)):
            new_row[k] = int(v)
        elif isinstance(v, (np.floating, np.float64)):
            new_row[k] = float(v)
        else:
            new_row[k] = v
    return new_row

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    xlsx_files = glob.glob(os.path.join(script_dir, "*.xlsx"))
    
    database = {
        "ads": [],
        "trends_top": [],
        "trends_rising": [],
        "suggestions": []
    }
    
    for file in xlsx_files:
        print(f"[*] Reading Excel file: {os.path.basename(file)}")
        try:
            xl = pd.ExcelFile(file)
            
            # 1. Google Ads - keyword ideas
            if "google ads - keyword ideas" in xl.sheet_names:
                df = pd.read_excel(xl, "google ads - keyword ideas")
                for _, row in df.iterrows():
                    database["ads"].append(clean_row(row.to_dict()))
                    
            # 2. Google Trends - top keyword
            if "google trends - top keyword" in xl.sheet_names:
                df = pd.read_excel(xl, "google trends - top keyword")
                for _, row in df.iterrows():
                    database["trends_top"].append(clean_row(row.to_dict()))
                    
            # 3. Google Trends - raising keyword
            if "google trends - raising keyword" in xl.sheet_names:
                df = pd.read_excel(xl, "google trends - raising keyword")
                for _, row in df.iterrows():
                    database["trends_rising"].append(clean_row(row.to_dict()))
                    
            # 4. Google suggestion
            if "google suggestion" in xl.sheet_names:
                df = pd.read_excel(xl, "google suggestion")
                for _, row in df.iterrows():
                    database["suggestions"].append(clean_row(row.to_dict()))
                    
        except Exception as e:
            print(f"[!] Error processing {file}: {e}")
            
    # Output path
    backend_data_dir = os.path.join(os.path.dirname(script_dir), "backend", "data")
    os.makedirs(backend_data_dir, exist_ok=True)
    json_path = os.path.join(backend_data_dir, "crawled_database.json")
    
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(database, f, ensure_ascii=False, indent=2)
        
    print(f"[SUCCESS] Compiled {len(xlsx_files)} Excel files to {json_path}")
    print(f"  - Ads rows: {len(database['ads'])}")
    print(f"  - Trends top: {len(database['trends_top'])}")
    print(f"  - Trends rising: {len(database['trends_rising'])}")
    print(f"  - Suggestions: {len(database['suggestions'])}")

if __name__ == "__main__":
    main()
