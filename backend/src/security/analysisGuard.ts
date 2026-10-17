import type Database from "better-sqlite3";
export function createAnalysisGuard(
  db: Database.Database,
  perDay = 10,
  maxConcurrent = 1,
) {
  db.exec(
    "CREATE TABLE IF NOT EXISTS analysis_claims (project_id TEXT NOT NULL, day TEXT NOT NULL, PRIMARY KEY(project_id,day))",
  );
  let running = 0;
  const reserve = db.transaction((project: string, day: string) => {
    const count = db
      .prepare("SELECT COUNT(*) AS count FROM analysis_claims WHERE day=?")
      .get(day) as { count: number };
    if (count.count >= perDay) return false;
    const result = db
      .prepare(
        "INSERT OR IGNORE INTO analysis_claims(project_id,day) VALUES(?,?)",
      )
      .run(project, day);
    return result.changes === 1;
  });
  return {
    claim(project: string): boolean {
      if (running >= maxConcurrent) return false;
      if (!reserve.immediate(project, new Date().toISOString().slice(0, 10)))
        return false;
      running++;
      return true;
    },
    release() {
      running = Math.max(0, running - 1);
    },
  };
}
