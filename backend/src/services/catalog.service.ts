import fs from 'node:fs';
import path from 'node:path';
let cached: any;
let modified = -1;
let checkedAt = 0;
/** Trusted server-owned catalog; never accepts a visitor-controlled path or URL. */
export function getCatalog(): any {
  if (cached && Date.now() - checkedAt < 30000) return cached;
  const file = path.resolve('./data/crawled_database.json');
  if (!fs.existsSync(file)) return {ads:[],suggestions:[],trends_top:[],trends_rising:[]};
  const stat = fs.statSync(file);
  if (stat.size > 100 * 1024 * 1024) throw new Error('Catalog exceeds configured size limit');
  if (!cached || stat.mtimeMs !== modified) {
    cached = JSON.parse(fs.readFileSync(file,'utf8'));
    modified = stat.mtimeMs;
  }
  checkedAt = Date.now();
  return cached;
}
