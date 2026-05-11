import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import Database from 'better-sqlite3';
import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { getSqlite } from '@/db/client';
import { backupDatabaseFile } from './data-lifecycle';

describe('backupDatabaseFile', () => {
  it('captures committed WAL-mode writes in the backup file', async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'opengrimoire-backup-'));
    process.env.OPENGRIMOIRE_DB_PATH = path.join(tempDir, 'opengrimoire.sqlite');

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
    }
  });
});
