import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { env } from './env.js';

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    // Ensure data directory exists
    const dbDir = path.dirname(path.resolve(env.DATABASE_PATH));
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    db = new Database(path.resolve(env.DATABASE_PATH));

    // Enable WAL mode for better concurrent read performance
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    console.log(`[DB] Connected to SQLite: ${env.DATABASE_PATH}`);
  }
  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
    console.log('[DB] Connection closed');
  }
}
