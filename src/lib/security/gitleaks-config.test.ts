import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.resolve(dirname, '../../../.gitleaks.toml');

describe('gitleaks config', () => {
  it('extends default detectors and avoids high-risk broad allowlists', () => {
    const config = readFileSync(configPath, 'utf8');

    expect(config).toMatch(/\[extend\]\s+useDefault\s*=\s*true/);
    expect(config).not.toContain("'''.*\\.md$'''");
    expect(config).not.toContain("'''.*\\.lock$'''");
    expect(config).not.toContain("'''.*\\.svg$'''");
    expect(config).not.toContain("'''\\.env\\.local$'''");
    expect(config).not.toContain("'''\\.env\\..*\\.local$'''");
    expect(config).not.toContain("'''/data/'''");
  });
});
