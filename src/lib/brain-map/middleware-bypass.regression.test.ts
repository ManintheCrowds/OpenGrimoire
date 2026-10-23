import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * CVE-2025-29927 (GHSA-f82v-jwr5-mffw): Next.js < 14.2.25 and < 15.2.3 skips middleware
 * when the client sends `x-middleware-subrequest`, which served `public/brain-map-graph.json`
 * and disabled login/survey rate limits. 15.5.28 is the floor here because
 * CVE-2026-94482 (GHSA-p3m5-59mp-jv5r) has no 14.x fix.
 */

type PackageJson = {
  version?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

function readJson(filePath: string): PackageJson {
  return JSON.parse(readFileSync(filePath, 'utf8')) as PackageJson;
}

function assertPatchedNext(version: string): void {
  const [major, minor, patch] = version.replace(/^[^0-9]*/, '').split('.').map((part) => Number.parseInt(part, 10));
  expect(major).toBe(15);
  expect(minor).toBeGreaterThanOrEqual(5);
  if (minor === 5) {
    expect(patch).toBeGreaterThanOrEqual(28);
  }
}

describe('Next.js middleware bypass pin (CVE-2025-29927)', () => {
  it('pins next and eslint-config-next to the same patched 15.5 release', () => {
    const root = process.cwd();
    const pkg = readJson(path.join(root, 'package.json'));
    const nextSpec = pkg.dependencies?.next ?? '';
    const eslintSpec = pkg.devDependencies?.['eslint-config-next'] ?? '';
    assertPatchedNext(nextSpec);
    assertPatchedNext(eslintSpec);
    expect(eslintSpec.replace(/^[^0-9]*/, '')).toBe(nextSpec.replace(/^[^0-9]*/, ''));

    const installedNext = readJson(path.join(root, 'node_modules/next/package.json')).version ?? '';
    const installedEslint =
      readJson(path.join(root, 'node_modules/eslint-config-next/package.json')).version ?? '';
    expect(installedNext).toBe(nextSpec);
    expect(installedEslint).toBe(eslintSpec);
  });

  it('installed next sandbox does not skip middleware on x-middleware-subrequest', () => {
    const sandbox = readFileSync(
      path.join(process.cwd(), 'node_modules/next/dist/server/web/sandbox/sandbox.js'),
      'utf8'
    );
    expect(sandbox).not.toContain('x-middleware-subrequest');
  });

  it('keeps the image optimizer off and sharp out of the lockfile (GHSA-2464-fhr4-w9xw)', () => {
    const root = process.cwd();
    const pkg = readJson(path.join(root, 'package.json'));
    expect(pkg.dependencies?.sharp).toBeUndefined();
    expect(pkg.devDependencies?.sharp).toBeUndefined();

    const config = readFileSync(path.join(root, 'next.config.js'), 'utf8');
    expect(config).toContain('unoptimized: true');

    const lock = readFileSync(path.join(root, 'package-lock.json'), 'utf8');
    expect(lock).not.toContain('node_modules/sharp');
    expect(lock).not.toContain('"sharp"');

    const server = readFileSync(path.join(root, 'node_modules/next/dist/server/next-server.js'), 'utf8');
    expect(server).toContain("imagesConfig.loader !== 'default' || imagesConfig.unoptimized");
  });
});
