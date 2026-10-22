import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * CVE-2025-29927 (GHSA-f82v-jwr5-mffw): Next.js < 14.2.25 skips middleware when the
 * client sends `x-middleware-subrequest`, which served `public/brain-map-graph.json`
 * and disabled login/survey rate limits. The skip is absent from the 14.2.25+ sandbox.
 */

type PackageJson = {
  version?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

function readJson(filePath: string): PackageJson {
  return JSON.parse(readFileSync(filePath, 'utf8')) as PackageJson;
}

function assertPatched14(version: string): void {
  const [major, minor, patch] = version.replace(/^[^0-9]*/, '').split('.').map((part) => Number.parseInt(part, 10));
  expect(major).toBe(14);
  expect(minor).toBeGreaterThanOrEqual(2);
  if (minor === 2) {
    expect(patch).toBeGreaterThanOrEqual(25);
  }
}

describe('Next.js middleware bypass pin (CVE-2025-29927)', () => {
  it('pins next and eslint-config-next to the same patched 14.x release', () => {
    const root = process.cwd();
    const pkg = readJson(path.join(root, 'package.json'));
    const nextSpec = pkg.dependencies?.next ?? '';
    const eslintSpec = pkg.devDependencies?.['eslint-config-next'] ?? '';
    assertPatched14(nextSpec);
    assertPatched14(eslintSpec);
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
});
