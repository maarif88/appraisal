import crypto from 'node:crypto';
import type Database from 'better-sqlite3';
import type { Request, Response } from 'express';

// Host prefix prevents sibling subdomains from planting a known ownership cookie.
const cookieName = process.env.NODE_ENV === 'production' ? '__Host-appraisal_visitor' : 'appraisal_visitor';
export const hashIdentity = (value: string) => crypto.createHash('sha256').update(value).digest('hex');
export function visitorHash(req: Request): string | null {
  const token = (req.headers.cookie || '').split(';').map(x => x.trim())
    .find(x => x.startsWith(cookieName + '='))?.slice(cookieName.length + 1);
  return token && /^[A-Za-z0-9_-]{43}$/.test(token) ? hashIdentity(token) : null;
}
export function ensureVisitor(req: Request, res: Response, production: boolean): string {
  const existing = visitorHash(req);
  if (existing) return existing;
  const token = crypto.randomBytes(32).toString('base64url');
  res.cookie(cookieName, token, { httpOnly: true, secure: production, sameSite: 'strict', path: '/', maxAge: 30 * 86400000 });
  return hashIdentity(token);
}
export function publicProject(project: any, req: Request) {
  const { owner_hash, ...data } = project;
  if (data.error_message) data.error_message = 'Analysis could not be completed. Please try a supported keyword later.';
  return { ...data, can_edit: !!owner_hash && owner_hash === visitorHash(req) };
}
export function createPublicQuota(db: Database.Database, limits: { global: number; perClient: number; stored: number }) {
  db.exec('CREATE TABLE IF NOT EXISTS public_daily_usage (day TEXT NOT NULL, bucket TEXT NOT NULL, count INTEGER NOT NULL, PRIMARY KEY(day,bucket))');
  const reserve = db.transaction((owner: string, client: string) => {
    const day = new Date().toISOString().slice(0, 10);
    db.prepare("DELETE FROM public_daily_usage WHERE day < date('now','-7 days')").run();
    const total = db.prepare('SELECT COUNT(*) AS count FROM projects').get() as {count: number};
    if (total.count >= limits.stored) return false;
    const buckets: Array<[string,number]> = [['create:global',limits.global],['create:ip:'+client,limits.perClient],['create:owner:'+owner,limits.perClient]];
    for (const [bucket,limit] of buckets) {
      const row = db.prepare('SELECT count FROM public_daily_usage WHERE day=? AND bucket=?').get(day,bucket) as {count:number}|undefined;
      if ((row?.count || 0) >= limit) return false;
    }
    for (const [bucket] of buckets) db.prepare('INSERT INTO public_daily_usage(day,bucket,count) VALUES(?,?,1) ON CONFLICT(day,bucket) DO UPDATE SET count=count+1').run(day,bucket);
    return true;
  });
  return { claim: (owner: string, client: string) => reserve.immediate(owner,client) };
}

// Quote every cell, escape quotes, and neutralize spreadsheet formula prefixes.
export function csvCell(value: unknown): string {
  let text = String(value ?? '');
  if (/^[\s\uFEFF]*[=+@-]/u.test(text)) text = "'" + text;
  return '"' + text.replace(/"/g,'""') + '"';
}
