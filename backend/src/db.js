import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');
fs.mkdirSync(dataDir, { recursive: true });

export const db = new Database(path.join(dataDir, 'beauty-ritual.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    streak INTEGER NOT NULL DEFAULT 0,
    last_draw_date TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS draws (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(id),
    date TEXT NOT NULL,
    card_index INTEGER NOT NULL,
    claimed INTEGER NOT NULL DEFAULT 0,
    ghost_id TEXT,
    is_rare INTEGER NOT NULL DEFAULT 0,
    repeat_card INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (user_id, date)
  );

  CREATE TABLE IF NOT EXISTS collection (
    user_id TEXT NOT NULL REFERENCES users(id),
    ghost_id TEXT NOT NULL,
    first_obtained_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, ghost_id)
  );

  CREATE TABLE IF NOT EXISTS ritual_log (
    user_id TEXT NOT NULL REFERENCES users(id),
    date TEXT NOT NULL,
    steps_json TEXT NOT NULL DEFAULT '[false,false,false]',
    PRIMARY KEY (user_id, date)
  );

  CREATE TABLE IF NOT EXISTS seen_cards (
    user_id TEXT NOT NULL REFERENCES users(id),
    card_index INTEGER NOT NULL,
    PRIMARY KEY (user_id, card_index)
  );
`);

export function ensureUser(id) {
  db.prepare('INSERT OR IGNORE INTO users (id) VALUES (?)').run(id);
}

/** 本地日历日 YYYY-MM-DD，与前端 toLocaleDateString('en-CA') 一致 */
export function today() {
  return new Date().toLocaleDateString('en-CA');
}

export function previousDay(dateStr) {
  const d = new Date(`${dateStr}T12:00:00`);
  d.setDate(d.getDate() - 1);
  return d.toLocaleDateString('en-CA');
}
