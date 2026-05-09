import Database from 'better-sqlite3';
import { existsSync, mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import path from 'path';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const tempDirs: string[] = [];

afterEach(() => {
  delete process.env.OPENGRIMOIRE_DB_PATH;
  vi.resetModules();
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe('backupDatabaseFile', () => {
  it('backs up committed writes that are still in the WAL file', async () => {
    const tempDir = mkdtempSync(path.join(tmpdir(), 'opengrimoire-backup-'));
    tempDirs.push(tempDir);
    process.env.OPENGRIMOIRE_DB_PATH = path.join(tempDir, 'opengrimoire.sqlite');

    const { getSqlite } = await import('@/db/client');
    const { backupDatabaseFile } = await import('./data-lifecycle');
    const sqlite = getSqlite();
    sqlite.pragma('wal_autocheckpoint = 0');
    sqlite.exec(`
      CREATE TABLE wal_probe (value TEXT NOT NULL);
      INSERT INTO wal_probe (value) VALUES ('committed in wal');
    `);

    expect(existsSync(`${process.env.OPENGRIMOIRE_DB_PATH}-wal`)).toBe(true);

    const backupPath = await backupDatabaseFile();
    const backup = new Database(backupPath, { readonly: true, fileMustExist: true });
    try {
      expect(backup.prepare('SELECT value FROM wal_probe').pluck().get()).toBe('committed in wal');
    } finally {
      backup.close();
      sqlite.close();
    }
  });
});
