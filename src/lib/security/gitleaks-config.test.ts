import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const config = readFileSync(resolve(process.cwd(), '.gitleaks.toml'), 'utf8');

describe('gitleaks configuration', () => {
  it('extends the built-in detector rules', () => {
    expect(config).toMatch(/^\[extend\]\s+useDefault\s*=\s*true/m);
  });

  it('does not globally skip common text secret locations', () => {
    const disallowedPathAllowlists = [
      String.raw`.*\.md$`,
      String.raw`.*\.lock$`,
      String.raw`.*\.svg$`,
      String.raw`.*\.min\.js$`,
      String.raw`.*\.map$`,
      String.raw`\.env\.local$`,
      String.raw`\.env\..*\.local$`,
    ];

    for (const pathAllowlist of disallowedPathAllowlists) {
      expect(config).not.toContain(`'''${pathAllowlist}'''`);
    }
  });
});
