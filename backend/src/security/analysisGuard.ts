import type Database from "better-sqlite3";
export function createAnalysisGuard(
  db: Database.Database,
  perDay = 10,
  maxConcurrent = 1,
  perClientDay = 3,
) {
  db.exec(
    "CREATE TABLE IF NOT EXISTS analysis_claims (project_id TEXT NOT NULL, day TEXT NOT NULL, PRIMARY KEY(project_id,day))",
  );
  const columns = db.prepare('PRAGMA table_info(analysis_claims)').all() as Array<{name:string}>;
  if (!columns.some(column => column.name === 'client_hash')) db.exec("ALTER TABLE analysis_claims ADD COLUMN client_hash TEXT NOT NULL DEFAULT ''");
  let running = 0;
  const reserve = db.transaction((project: string, day: string, client: string) => {
    const count = db
      .prepare("SELECT COUNT(*) AS count FROM analysis_claims WHERE day=?")
      .get(day) as { count: number };
    if (count.count >= perDay) return false;
    if(client) {
      const used = db.prepare('SELECT COUNT(*) AS count FROM analysis_claims WHERE day=? AND client_hash=?').get(day,client) as {count:number};
      if(used.count>=perClientDay)return false;
    }
    const result = db
      .prepare(
        "INSERT OR IGNORE INTO analysis_claims(project_id,day,client_hash) VALUES(?,?,?)",
      )
      .run(project, day, client);
    return result.changes === 1;
  });
  return {
    claim(project: string, client = ''): boolean {
      if (running >= maxConcurrent) return false;
      if (!reserve.immediate(project, new Date().toISOString().slice(0, 10), client))
        return false;
      running++;
      return true;
    },
    release() {
      running = Math.max(0, running - 1);
    },
  };
}
