import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import Database from 'better-sqlite3';
import { afterEach, describe, expect, it, vi } from 'vitest';

const ORIGINAL_DB_PATH = process.env.OPENGRIMOIRE_DB_PATH;

let tempDir: string | null = null;

vi.mock('server-only', () => ({}));

afterEach(() => {
  if (ORIGINAL_DB_PATH === undefined) {
    delete process.env.OPENGRIMOIRE_DB_PATH;
  } else {
    process.env.OPENGRIMOIRE_DB_PATH = ORIGINAL_DB_PATH;
  }
  if (tempDir) {
    fs.rmSync(tempDir, { recursive: true, force: true });
    tempDir = null;
  }
  vi.resetModules();
});

async function loadStorageModules(dbPath: string) {
  vi.resetModules();
  process.env.OPENGRIMOIRE_DB_PATH = dbPath;
  const [{ getSqlite }, { backupDatabaseFile }] = await Promise.all([
    import('@/db/client'),
    import('./data-lifecycle'),
  ]);
  return { getSqlite, backupDatabaseFile };
}

async function loadLifecycleModules(dbPath: string) {
  vi.resetModules();
  process.env.OPENGRIMOIRE_DB_PATH = dbPath;
  const [
    { getSqlite },
    { createAttendee, createSurveyResponse, updateModerationStatus },
    { exportManagedTable, pruneManagedTables },
  ] = await Promise.all([
    import('@/db/client'),
    import('./survey'),
    import('./data-lifecycle'),
  ]);
  return {
    getSqlite,
    createAttendee,
    createSurveyResponse,
    updateModerationStatus,
    exportManagedTable,
    pruneManagedTables,
  };
}

describe('backupDatabaseFile', () => {
  it('includes committed writes that still live in the WAL file', async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'opengrimoire-backup-'));
    const dbPath = path.join(tempDir, 'opengrimoire.sqlite');
    const { backupDatabaseFile, getSqlite } = await loadStorageModules(dbPath);

    const sqlite = getSqlite();
    sqlite.pragma('wal_autocheckpoint = 0');
    sqlite.exec('CREATE TABLE wal_backup_probe (value TEXT NOT NULL)');
    sqlite.prepare('INSERT INTO wal_backup_probe (value) VALUES (?)').run('kept');
    expect(fs.existsSync(`${dbPath}-wal`)).toBe(true);

    const backupPath = await backupDatabaseFile();
    const backup = new Database(backupPath, { readonly: true, fileMustExist: true });
    try {
      expect(
        backup.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'wal_backup_probe'").get()
      ).toEqual({ name: 'wal_backup_probe' });
      expect(backup.prepare('SELECT value FROM wal_backup_probe').pluck().get()).toBe('kept');
    } finally {
      backup.close();
      sqlite.close();
    }
  });

  it('does not bootstrap or migrate the source database before taking a snapshot', async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'opengrimoire-backup-source-'));
    const dbPath = path.join(tempDir, 'opengrimoire.sqlite');
    const source = new Database(dbPath);
    source.exec(`
      CREATE TABLE existing_data (
        id TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
      INSERT INTO existing_data (id, value) VALUES ('existing-1', 'preserved');
    `);
    source.close();

    const { backupDatabaseFile } = await loadStorageModules(dbPath);

    const backupPath = await backupDatabaseFile();

    const sourceAfter = new Database(dbPath, { readonly: true, fileMustExist: true });
    const backup = new Database(backupPath, { readonly: true, fileMustExist: true });
    try {
      expect(
        sourceAfter.prepare(`SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'attendees'`).get()
      ).toBeUndefined();
      const row = backup.prepare(`SELECT value FROM existing_data WHERE id = ?`).get('existing-1') as
        | { value: string }
        | undefined;
      expect(row?.value).toBe('preserved');
    } finally {
      sourceAfter.close();
      backup.close();
    }
  });
});

describe('exportManagedTable(survey_responses)', () => {
  it('includes Sync Session v2 intent categories that would be lost on prune', async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'opengrimoire-export-categories-'));
    const dbPath = path.join(tempDir, 'opengrimoire.sqlite');
    const {
      getSqlite,
      createAttendee,
      createSurveyResponse,
      exportManagedTable,
      pruneManagedTables,
    } = await loadLifecycleModules(dbPath);

    const sqlite = getSqlite();
    const attendee = createAttendee({
      first_name: 'Ada',
      last_name: 'Lovelace',
      is_anonymous: true,
    });

    const response = createSurveyResponse({
      attendee_id: attendee.id,
      session_type: 'profile',
      questionnaire_version: 'v2',
      unique_quality: 'Ship carefully',
      categories: [
        { category: 'signals', content: 'Ship OG-HV' },
        { category: 'needs', content: 'Local dev only' },
        { category: 'constraints', content: 'No prod secrets' },
      ],
    });

    sqlite
      .prepare(`UPDATE survey_responses SET created_at = ?, updated_at = ? WHERE id = ?`)
      .run('2020-01-01T00:00:00.000Z', '2020-01-01T00:00:00.000Z', response.id);

    const exported = exportManagedTable('survey_responses') as Array<{
      id: string;
      intent_categories: Array<{ category: string; content: string }>;
    }>;

    expect(exported).toHaveLength(1);
    expect(exported[0]?.id).toBe(response.id);
    expect(exported[0]?.intent_categories).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ category: 'signals', content: 'Ship OG-HV' }),
        expect.objectContaining({ category: 'needs', content: 'Local dev only' }),
        expect.objectContaining({ category: 'constraints', content: 'No prod secrets' }),
      ])
    );
    expect(exported[0]?.intent_categories).toHaveLength(3);

    pruneManagedTables({
      survey_responses: 30,
      clarification_requests: 180,
      study_reviews: 365,
    });
    const categoryCount = sqlite
      .prepare(`SELECT COUNT(*) AS n FROM survey_response_intent_categories`)
      .get() as { n: number };
    expect(categoryCount.n).toBe(0);

    sqlite.close();
  });

  it('includes moderation rows that would be lost on prune', async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'opengrimoire-export-moderation-'));
    const dbPath = path.join(tempDir, 'opengrimoire.sqlite');
    const {
      getSqlite,
      createAttendee,
      createSurveyResponse,
      updateModerationStatus,
      exportManagedTable,
      pruneManagedTables,
    } = await loadLifecycleModules(dbPath);

    const sqlite = getSqlite();
    const attendee = createAttendee({
      first_name: 'Grace',
      last_name: 'Hopper',
      is_anonymous: true,
    });
    const response = createSurveyResponse({
      attendee_id: attendee.id,
      unique_quality: 'Operator notes matter',
    });

    updateModerationStatus(response.id, {
      status: 'approved',
      moderator_id: 'moderator-operator-1',
      notes: 'Keep for constellation; cite in handoff',
    });

    sqlite
      .prepare(`UPDATE survey_responses SET created_at = ?, updated_at = ? WHERE id = ?`)
      .run('2020-01-01T00:00:00.000Z', '2020-01-01T00:00:00.000Z', response.id);

    const exported = exportManagedTable('survey_responses') as Array<{
      id: string;
      moderation: Array<{
        status: string;
        moderator_id: string;
        notes: string | null;
        field_name: string;
      }>;
    }>;

    expect(exported).toHaveLength(1);
    expect(exported[0]?.id).toBe(response.id);
    expect(exported[0]?.moderation).toHaveLength(1);
    expect(exported[0]?.moderation[0]).toEqual(
      expect.objectContaining({
        status: 'approved',
        moderator_id: 'moderator-operator-1',
        notes: 'Keep for constellation; cite in handoff',
        field_name: 'unique_quality',
      })
    );

    pruneManagedTables({
      survey_responses: 30,
      clarification_requests: 180,
      study_reviews: 365,
    });
    const moderationCount = sqlite.prepare(`SELECT COUNT(*) AS n FROM moderation`).get() as {
      n: number;
    };
    expect(moderationCount.n).toBe(0);

    sqlite.close();
  });

  it('returns empty nested arrays when a response has no side rows', async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'opengrimoire-export-empty-side-'));
    const dbPath = path.join(tempDir, 'opengrimoire.sqlite');
    const { getSqlite, createAttendee, createSurveyResponse, exportManagedTable } =
      await loadLifecycleModules(dbPath);

    const sqlite = getSqlite();
    const attendee = createAttendee({
      first_name: 'Alan',
      last_name: 'Turing',
      is_anonymous: true,
    });
    const response = createSurveyResponse({
      attendee_id: attendee.id,
      unique_quality: 'v1-only',
    });

    const exported = exportManagedTable('survey_responses') as Array<{
      id: string;
      intent_categories: unknown[];
      moderation: unknown[];
    }>;
    const row = exported.find((item) => item.id === response.id);
    expect(row?.intent_categories).toEqual([]);
    expect(row?.moderation).toEqual([]);

    sqlite.close();
  });
});
