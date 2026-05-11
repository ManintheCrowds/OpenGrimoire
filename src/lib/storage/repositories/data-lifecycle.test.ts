import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import Database from 'better-sqlite3';
import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

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
  it('captures committed WAL-mode writes in the backup file', async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'opengrimoire-backup-'));
    const dbPath = path.join(tempDir, 'opengrimoire.sqlite');
    const { backupDatabaseFile, getSqlite } = await loadStorageModules(dbPath);

    const sqlite = getSqlite();
    sqlite.exec(`
      CREATE TABLE backup_probe (
        id TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);
    sqlite.prepare(`INSERT INTO backup_probe (id, value) VALUES (?, ?)`).run('probe-1', 'committed in wal');

    const backupPath = await backupDatabaseFile();

    const backup = new Database(backupPath, { readonly: true, fileMustExist: true });
    try {
      const row = backup.prepare(`SELECT value FROM backup_probe WHERE id = ?`).get('probe-1') as
        | { value: string }
        | undefined;
      expect(row?.value).toBe('committed in wal');
    } finally {
      backup.close();
      sqlite.close();
    }
  });

  it('does not bootstrap or migrate the source database before taking a snapshot', async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'opengrimoire-backup-source-'));
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
