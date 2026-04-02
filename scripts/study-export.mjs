#!/usr/bin/env node
/**
 * Export study_cards to UTF-8 CSV for Anki import (same columns as validate_flashcards MVP).
 *
 * Usage:
 *   node scripts/study-export.mjs --output ./study-export.csv
 * Env: OPENGRIMOIRE_DB_PATH (default: ./data/opengrimoire.sqlite)
 */

import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
function parseArgs() {
  const out = { output: null };
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--output' || argv[i] === '-o') {
      out.output = argv[i + 1] ?? null;
      i++;
    }
  }
  return out;
}

function csvEscape(cell) {
  const s = String(cell ?? '');
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function main() {
  const { output } = parseArgs();
  if (!output) {
    console.error('Usage: node scripts/study-export.mjs --output <path.csv>');
    process.exit(2);
  }
  const dbPath = process.env.OPENGRIMOIRE_DB_PATH ?? path.join(process.cwd(), 'data', 'opengrimoire.sqlite');
  if (!fs.existsSync(dbPath)) {
    console.error(`Database not found: ${dbPath}`);
    process.exit(1);
  }
  const db = new Database(dbPath, { readonly: true });
  const decks = db.prepare('SELECT id, name FROM study_decks').all();
  const deckName = Object.fromEntries(decks.map((d) => [d.id, d.name]));
  const rows = db
    .prepare(
      `SELECT deck_id, front, back, source_url, repo_path FROM study_cards ORDER BY deck_id, created_at`
    )
    .all();
  const header = ['front', 'back', 'source_url', 'repo_path', 'tags', 'deck'];
  const lines = [header.map(csvEscape).join(',')];
  for (const r of rows) {
    const deck = deckName[r.deck_id] ?? r.deck_id;
    lines.push(
      [r.front, r.back, r.source_url ?? '', r.repo_path ?? '', '', deck].map(csvEscape).join(',')
    );
  }
  const outPath = path.isAbsolute(output) ? output : path.join(process.cwd(), output);
  fs.writeFileSync(outPath, lines.join('\n') + '\n', 'utf8');
  console.log(`Wrote ${rows.length} rows to ${outPath}`);
  db.close();
}

main();
