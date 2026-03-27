#!/usr/bin/env node
/**
 * Placeholder for one-way Supabase (Postgres) → OpenGrimoire SQLite import.
 *
 * Historical schema: supabase/migrations/
 * Target file: OPENGRIMOIRE_DB_PATH or ./data/opengrimoire.sqlite
 *
 * For a manual migration: export attendees + survey_responses + alignment_context_items from Supabase
 * (SQL or CSV), then write a small script using better-sqlite3 to INSERT into the SQLite tables defined
 * in src/db/client.ts (bootstrap SQL).
 */

console.error(
  'migrate-supabase-to-sqlite: not implemented in-repo. Use pg_dump/CSV export and map columns to SQLite TEXT/INTEGER.'
);
process.exit(1);
