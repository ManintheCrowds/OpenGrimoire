import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('canonical documentation encoding', () => {
  it('keeps the systems inventory as valid UTF-8 without mojibake', () => {
    const bytes = readFileSync(
      path.join(process.cwd(), 'docs', 'OPENGRIMOIRE_SYSTEMS_INVENTORY.md'),
    );
    let contents = '';

    expect(() => {
      contents = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    }).not.toThrow();
    expect(contents).toContain('# OpenGrimoire — systems inventory');
  });
});
