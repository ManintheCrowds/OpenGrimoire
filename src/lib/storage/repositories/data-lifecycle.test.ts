import Database from 'better-sqlite3';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { backupDatabaseFile } from './data-lifecycle';

describe('backupDatabaseFile', () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    vi.unstubAllEnvs();
    for (const dir of tempDirs.splice(0)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('includes committed WAL-mode writes in the backup', async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'opengrimoire-backup-'));
    tempDirs.push(tempDir);
    const dbPath = path.join(tempDir, 'opengrimoire.sqlite');
    vi.stubEnv('OPENGRIMOIRE_DB_PATH', dbPath);

    const sqlite = new Database(dbPath);
    try {
      sqlite.pragma('journal_mode = WAL');
      sqlite.pragma('wal_autocheckpoint = 0');
      sqlite.exec('CREATE TABLE critical_records (id INTEGER PRIMARY KEY, value TEXT NOT NULL)');
      const insert = sqlite.prepare('INSERT INTO critical_records (value) VALUES (?)');
      const writeRows = sqlite.transaction(() => {
        for (let i = 0; i < 500; i += 1) {
          insert.run(`row-${i}`);
        }
      });
      writeRows();

      expect(fs.existsSync(`${dbPath}-wal`)).toBe(true);

      const backupPath = await backupDatabaseFile(sqlite);
      const backup = new Database(backupPath, { readonly: true });
      try {
        const row = backup.prepare('SELECT COUNT(*) AS count FROM critical_records').get() as { count: number };
        expect(row.count).toBe(500);
      } finally {
        backup.close();
      }
    } finally {
      sqlite.close();
    }
  });
});
