import 'server-only';
import { randomUUID } from 'crypto';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import fs from 'fs';
import path from 'path';
import * as schema from './schema';

function getDbPath(): string {
  return process.env.OPENGRIMOIRE_DB_PATH ?? path.join(process.cwd(), 'data', 'opengrimoire.sqlite');
}

let sqliteInstance: Database.Database | null = null;
let drizzleInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

function ensureDataDir(dbPath: string) {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/** Idempotent DDL + seed (no drizzle-kit required at runtime). */
function runBootstrap(sqlite: Database.Database) {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS attendees (
      id TEXT PRIMARY KEY NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT,
      email TEXT UNIQUE,
      is_anonymous INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_attendees_email ON attendees(email);
    CREATE INDEX IF NOT EXISTS idx_attendees_created_at ON attendees(created_at);

    CREATE TABLE IF NOT EXISTS survey_responses (
      id TEXT PRIMARY KEY NOT NULL,
      attendee_id TEXT NOT NULL REFERENCES attendees(id) ON DELETE CASCADE,
      tenure_years INTEGER,
      learning_style TEXT,
      shaped_by TEXT,
      peak_performance TEXT,
      motivation TEXT,
      unique_quality TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      moderated_at TEXT,
      test_data INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_survey_responses_attendee_id ON survey_responses(attendee_id);
    CREATE INDEX IF NOT EXISTS idx_survey_responses_created_at ON survey_responses(created_at);

    CREATE TABLE IF NOT EXISTS peak_performance_definitions (
      id TEXT PRIMARY KEY NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(type, title)
    );
    CREATE INDEX IF NOT EXISTS idx_peak_performance_definitions_type ON peak_performance_definitions(type);

    CREATE TABLE IF NOT EXISTS moderation (
      id TEXT PRIMARY KEY NOT NULL,
      response_id TEXT NOT NULL REFERENCES survey_responses(id) ON DELETE CASCADE,
      field_name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      moderator_id TEXT NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(response_id, field_name)
    );
    CREATE INDEX IF NOT EXISTS idx_moderation_response_id ON moderation(response_id);
    CREATE INDEX IF NOT EXISTS idx_moderation_status ON moderation(status);

    CREATE TABLE IF NOT EXISTS alignment_context_items (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      body TEXT,
      tags TEXT NOT NULL DEFAULT '[]',
      priority INTEGER,
      status TEXT NOT NULL DEFAULT 'draft',
      linked_node_id TEXT,
      attendee_id TEXT REFERENCES attendees(id) ON DELETE SET NULL,
      source TEXT NOT NULL,
      created_by TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_alignment_context_items_status ON alignment_context_items(status);
    CREATE INDEX IF NOT EXISTS idx_alignment_context_items_created_at ON alignment_context_items(created_at DESC);
  `);

  const now = new Date().toISOString();
  const seed = sqlite.prepare(
    `INSERT OR IGNORE INTO peak_performance_definitions (id, type, title, description, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  );
  const rows: [string, string, string, string][] = [
    [randomUUID(), 'individual', 'Technical Excellence', 'Demonstrating exceptional technical skills and expertise'],
    [randomUUID(), 'individual', 'Problem Solving', 'Successfully resolving complex challenges'],
    [randomUUID(), 'team', 'Collaboration', 'Achieving outstanding results through team effort'],
    [randomUUID(), 'team', 'Cross-functional Success', 'Delivering results across multiple departments'],
    [randomUUID(), 'leadership', 'Team Development', 'Successfully growing and developing team members'],
    [randomUUID(), 'leadership', 'Strategic Vision', 'Implementing successful strategic initiatives'],
    [randomUUID(), 'innovation', 'Process Improvement', 'Creating significant efficiency improvements'],
    [randomUUID(), 'innovation', 'Product Development', 'Developing successful new products or features'],
    [randomUUID(), 'crisis', 'Emergency Response', 'Successfully managing critical situations'],
    [randomUUID(), 'crisis', 'Change Management', 'Leading successful organizational change'],
  ];
  for (const [id, type, title, description] of rows) {
    seed.run(id, type, title, description, now, now);
  }
}

export function getSqlite(): Database.Database {
  if (sqliteInstance) {
    return sqliteInstance;
  }
  const dbPath = getDbPath();
  ensureDataDir(dbPath);
  const sqlite = new Database(dbPath);
  sqlite.pragma('foreign_keys = ON');
  runBootstrap(sqlite);
  sqliteInstance = sqlite;
  return sqlite;
}

export function getDb() {
  if (drizzleInstance) {
    return drizzleInstance;
  }
  const sqlite = getSqlite();
  drizzleInstance = drizzle(sqlite, { schema });
  return drizzleInstance;
}
