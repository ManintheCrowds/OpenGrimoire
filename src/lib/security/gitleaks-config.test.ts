import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const config = readFileSync(join(process.cwd(), '.gitleaks.toml'), 'utf8');

describe('gitleaks configuration', () => {
  it('extends the default detector rules', () => {
    expect(config).toMatch(/\[extend\][\s\S]*useDefault\s*=\s*true/);
  });

  it('does not broadly skip source-like files where secrets are commonly committed', () => {
    expect(config).not.toMatch(/'''.*\\\.md\$/);
    expect(config).not.toMatch(/'''.*\\\.lock\$/);
    expect(config).not.toMatch(/'''\\\.env\\\./);
    expect(config).not.toMatch(/'''.*\\\.min\\\.js\$/);
    expect(config).not.toMatch(/'''.*\\\.map\$/);
  });
});
