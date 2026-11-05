import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
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

async function loadHarnessModules(dbPath: string) {
  vi.resetModules();
  process.env.OPENGRIMOIRE_DB_PATH = dbPath;
  const [{ getSqlite }, harness] = await Promise.all([
    import('@/db/client'),
    import('./harness-profiles'),
  ]);
  return { getSqlite, ...harness };
}

describe('updateHarnessProfile', () => {
  it('does not clear the existing default when promoting a missing profile id', async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'opengrimoire-harness-'));
    const dbPath = path.join(tempDir, 'opengrimoire.sqlite');
    const { getSqlite, listHarnessProfiles, updateHarnessProfile } = await loadHarnessModules(dbPath);

    const sqlite = getSqlite();
    const before = listHarnessProfiles();
    const currentDefault = before.find((item) => item.is_default);
    expect(currentDefault).toBeTruthy();

    const missingId = '99999999-9999-4999-8999-999999999999';
    const updated = updateHarnessProfile(missingId, { is_default: true });
    expect(updated).toBeNull();

    const after = listHarnessProfiles();
    const defaults = after.filter((item) => item.is_default);
    expect(defaults).toHaveLength(1);
    expect(defaults[0]?.id).toBe(currentDefault!.id);

    sqlite.close();
  });

  it('promotes a real profile to default without leaving zero defaults', async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'opengrimoire-harness-ok-'));
    const dbPath = path.join(tempDir, 'opengrimoire.sqlite');
    const { getSqlite, listHarnessProfiles, updateHarnessProfile } = await loadHarnessModules(dbPath);

    const sqlite = getSqlite();
    const profiles = listHarnessProfiles();
    const nonDefault = profiles.find((item) => !item.is_default);
    expect(nonDefault).toBeTruthy();

    const updated = updateHarnessProfile(nonDefault!.id, { is_default: true });
    expect(updated?.is_default).toBe(true);

    const defaults = listHarnessProfiles().filter((item) => item.is_default);
    expect(defaults).toHaveLength(1);
    expect(defaults[0]?.id).toBe(nonDefault!.id);

    sqlite.close();
  });
});

describe('harness profile import/export path sandbox', () => {
  it('rejects sibling-prefix escapes that bypass startsWith(dir) checks', async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'opengrimoire-harness-path-'));
    const dbPath = path.join(tempDir, 'opengrimoire.sqlite');
    const { getSqlite, exportHarnessProfilesToFile, importHarnessProfilesFromFile } =
      await loadHarnessModules(dbPath);
    const sqlite = getSqlite();

    const dataDir = path.join(process.cwd(), 'data');
    fs.mkdirSync(dataDir, { recursive: true });
    const siblingPath = path.join(dataDir, 'harness-profiles.sqlite');
    const sentinel = `do-not-overwrite-${Date.now()}`;
    fs.writeFileSync(siblingPath, sentinel, 'utf8');

    try {
      expect(() => exportHarnessProfilesToFile('../harness-profiles.sqlite')).toThrow(/Invalid file path/);
      expect(() => importHarnessProfilesFromFile('../harness-profiles.sqlite')).toThrow(/Invalid file path/);
      expect(() => exportHarnessProfilesToFile('..\\harness-profiles.sqlite')).toThrow(/Invalid file path/);
      expect(() => exportHarnessProfilesToFile('../opengrimoire.sqlite')).toThrow(/Invalid file path/);
      expect(fs.readFileSync(siblingPath, 'utf8')).toBe(sentinel);
    } finally {
      fs.rmSync(siblingPath, { force: true });
      sqlite.close();
    }
  });

  it('allows in-directory relative export paths', async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'opengrimoire-harness-path-ok-'));
    const dbPath = path.join(tempDir, 'opengrimoire.sqlite');
    const { getSqlite, exportHarnessProfilesToFile } = await loadHarnessModules(dbPath);
    const sqlite = getSqlite();

    const result = exportHarnessProfilesToFile('ok-profiles.json');
    const abs = path.resolve(process.cwd(), result.file);
    const root = path.join(process.cwd(), 'data', 'harness-profiles');
    const rel = path.relative(root, abs);
    expect(rel.startsWith('..') || path.isAbsolute(rel)).toBe(false);
    expect(fs.existsSync(abs)).toBe(true);
    expect(result.count).toBeGreaterThan(0);

    fs.rmSync(abs, { force: true });
    sqlite.close();
  });
});
