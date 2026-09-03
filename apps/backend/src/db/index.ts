import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import * as path from 'path';
import * as fs from 'fs';

const dbPath = process.env.DATABASE_URL || './data/app.db';
const resolvedPath = path.resolve(process.cwd(), dbPath);

// Ensure directory exists
const dir = path.dirname(resolvedPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

export const sqlite = new Database(resolvedPath);

// Enable WAL mode for better performance
sqlite.pragma('journal_mode = WAL');

// Ensure schema exists automatically
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    completed INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );
`);

export const db = drizzle(sqlite, { schema });

// Seed initial items if empty
const count = sqlite.prepare('SELECT COUNT(*) as count FROM items').get() as { count: number };
if (count.count === 0) {
  const insert = sqlite.prepare(`
    INSERT INTO items (title, description, completed, created_at)
    VALUES (@title, @description, @completed, @created_at)
  `);
  insert.run({
    title: 'Explore Ivy Tendril verifications',
    description: 'Verify automated NpmLint, NpmBuild, and NpmTest execution',
    completed: 1,
    created_at: new Date().toISOString(),
  });
  insert.run({
    title: 'Test review actions from worktree',
    description: 'Launch frontend and backend on configured ports',
    completed: 0,
    created_at: new Date().toISOString(),
  });
}
