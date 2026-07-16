import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Gitleaks configuration', () => {
  const config = readFileSync(
    path.join(process.cwd(), '.gitleaks.toml'),
    'utf8',
  );

  it('extends the built-in secret detectors', () => {
    expect(config).toMatch(/\[extend\]\s+useDefault\s*=\s*true/);
  });

  it.each([
    String.raw`.*\.md$`,
    String.raw`.*\.lock$`,
    String.raw`.*\.svg$`,
    String.raw`.*\.min\.js$`,
    String.raw`.*\.map$`,
    String.raw`\.env\.local$`,
    String.raw`\.env\..*\.local$`,
  ])('does not globally exclude secret-bearing text path %s', (pathPattern) => {
    expect(config).not.toContain(`'''${pathPattern}'''`);
  });
});
