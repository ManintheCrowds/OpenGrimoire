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
