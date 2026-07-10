import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const configPath = resolve(process.cwd(), '.gitleaks.toml');

function allowlistPathPatterns(): RegExp[] {
  const config = readFileSync(configPath, 'utf8');
  const pathsBlock = config.match(/paths\s*=\s*\[([\s\S]*?)\]/)?.[1] ?? '';
  return Array.from(pathsBlock.matchAll(/'''([^']+)'''/g), ([, pattern]) => new RegExp(pattern));
}

describe('Gitleaks allowlist', () => {
  it('does not skip Markdown files from secret scanning', () => {
    const pathPatterns = allowlistPathPatterns();

    expect(pathPatterns.some((pattern) => pattern.test('README.md'))).toBe(false);
    expect(pathPatterns.some((pattern) => pattern.test('docs/security/runbook.md'))).toBe(false);
  });
});
