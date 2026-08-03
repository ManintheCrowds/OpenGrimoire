import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { getSqlite } from '@/db/client';

type ManagedTable = 'survey_responses' | 'clarification_requests' | 'study_reviews';

export type RetentionPolicy = Record<ManagedTable, number>;

const DEFAULT_RETENTION_DAYS: RetentionPolicy = {
  survey_responses: 365,
  clarification_requests: 180,
  study_reviews: 365,
};

function envInt(name: string, fallback: number): number {
  const raw = process.env[name];
  const parsed = raw ? Number.parseInt(raw, 10) : Number.NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function getRetentionPolicy(): RetentionPolicy {
  return {
    survey_responses: envInt('OPENGRIMOIRE_RETENTION_SURVEY_DAYS', DEFAULT_RETENTION_DAYS.survey_responses),
    clarification_requests: envInt(
      'OPENGRIMOIRE_RETENTION_CLARIFICATION_DAYS',
      DEFAULT_RETENTION_DAYS.clarification_requests
    ),
    study_reviews: envInt('OPENGRIMOIRE_RETENTION_STUDY_DAYS', DEFAULT_RETENTION_DAYS.study_reviews),
  };
}

function cutoffIso(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

export function pruneManagedTables(policy: RetentionPolicy = getRetentionPolicy()): Record<ManagedTable, number> {
  const sqlite = getSqlite();
  const tx = sqlite.transaction(() => {
    const surveyDeleted = sqlite
      .prepare(`DELETE FROM survey_responses WHERE created_at < ?`)
      .run(cutoffIso(policy.survey_responses)).changes;
    // Prefer resolved_at so a long-lived request resolved inside the retention
    // window is kept; fall back to created_at for still-pending / unresolved rows.
    const clarificationDeleted = sqlite
      .prepare(
        `DELETE FROM clarification_requests WHERE COALESCE(resolved_at, created_at) < ?`
      )
      .run(cutoffIso(policy.clarification_requests)).changes;
    const studyDeleted = sqlite
      .prepare(`DELETE FROM study_reviews WHERE reviewed_at < ?`)
      .run(cutoffIso(policy.study_reviews)).changes;

    return {
      survey_responses: surveyDeleted,
      clarification_requests: clarificationDeleted,
      study_reviews: studyDeleted,
    };
  });

  return tx();
}

export type SurveyResponseExportRow = Record<string, unknown> & {
  intent_categories: Array<{
    id: string;
    response_id: string;
    category: string;
    content: string;
    created_at: string;
    updated_at: string;
  }>;
  moderation: Array<{
    id: string;
    response_id: string;
    field_name: string;
    status: string;
    moderator_id: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
  }>;
};

/**
 * Export a managed table for operator archival.
 *
 * `survey_responses` nests side tables that CASCADE-delete on prune:
 * - `intent_categories` (Sync Session v2 answers)
 * - `moderation` (decision status, moderator id, notes)
 * Bare `SELECT * FROM survey_responses` silently drops both from the archive.
 */
export function exportManagedTable(table: ManagedTable) {
  const sqlite = getSqlite();
  if (table === 'study_reviews') {
    return sqlite.prepare(`SELECT * FROM ${table} ORDER BY reviewed_at DESC`).all();
  }
  if (table === 'survey_responses') {
    const rows = sqlite
      .prepare(`SELECT * FROM survey_responses ORDER BY created_at DESC`)
      .all() as Record<string, unknown>[];
    const categoriesForResponse = sqlite.prepare(
      `SELECT id, response_id, category, content, created_at, updated_at
       FROM survey_response_intent_categories
       WHERE response_id = ?
       ORDER BY category ASC`
    );
    const moderationForResponse = sqlite.prepare(
      `SELECT id, response_id, field_name, status, moderator_id, notes, created_at, updated_at
       FROM moderation
       WHERE response_id = ?
       ORDER BY field_name ASC`
    );
    return rows.map(
      (row): SurveyResponseExportRow => ({
        ...row,
        intent_categories: categoriesForResponse.all(
          String(row.id)
        ) as SurveyResponseExportRow['intent_categories'],
        moderation: moderationForResponse.all(
          String(row.id)
        ) as SurveyResponseExportRow['moderation'],
      })
    );
  }
  return sqlite.prepare(`SELECT * FROM ${table} ORDER BY created_at DESC`).all();
}

/**
 * Snapshot the live SQLite database, including committed pages that may still
 * live only in the WAL. A raw copy of the main `*.sqlite` file can omit those
 * writes under WAL mode (`journal_mode = WAL` in src/db/client.ts).
 */
export async function backupDatabaseFile(): Promise<string> {
  const dbPath = process.env.OPENGRIMOIRE_DB_PATH ?? path.join(process.cwd(), 'data', 'opengrimoire.sqlite');
  const backupDir = path.join(path.dirname(dbPath), 'backups');
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outPath = path.join(backupDir, `opengrimoire-${stamp}.sqlite`);
  // Open a dedicated connection so backup does not bootstrap/migrate via getSqlite().
  const sqlite = new Database(dbPath, { readonly: true, fileMustExist: true });
  try {
    await sqlite.backup(outPath);
  } finally {
    sqlite.close();
  }
  return outPath;
}
