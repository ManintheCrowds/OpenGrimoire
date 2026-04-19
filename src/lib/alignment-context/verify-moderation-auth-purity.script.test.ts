import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(here, '..', '..', '..');
const script = path.join(repoRoot, 'scripts', 'verify-moderation-auth-purity.mjs');

describe('verify-moderation-auth-purity.mjs', () => {
  it('exits 0 and prints ok marker', () => {
    const stdout = execFileSync(process.execPath, [script], {
      cwd: repoRoot,
      encoding: 'utf8',
    });
    expect(stdout).toContain('verify-moderation-auth-purity: ok');
  });
});
