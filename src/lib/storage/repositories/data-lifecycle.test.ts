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

describe('backupDatabaseFile', () => {
  it('includes committed writes that still live in the WAL file', async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'opengrimoire-backup-'));
    const dbPath = path.join(tempDir, 'opengrimoire.sqlite');
    process.env.OPENGRIMOIRE_DB_PATH = dbPath;

    vi.resetModules();
    const { getSqlite } = await import('@/db/client');
    const { backupDatabaseFile } = await import('./data-lifecycle');

    const sqlite = getSqlite();
    sqlite.pragma('wal_autocheckpoint = 0');
    sqlite.exec('CREATE TABLE wal_backup_probe (value TEXT NOT NULL)');
    sqlite.prepare('INSERT INTO wal_backup_probe (value) VALUES (?)').run('kept');
    expect(fs.existsSync(`${dbPath}-wal`)).toBe(true);

    const backupPath = await backupDatabaseFile();
    const backup = new Database(backupPath, { readonly: true });
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
});
