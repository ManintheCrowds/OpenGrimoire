import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const SYSTEMS_INVENTORY_PATH = path.join(
  process.cwd(),
  'docs',
  'OPENGRIMOIRE_SYSTEMS_INVENTORY.md',
);

describe('systems inventory encoding', () => {
  it('stays valid UTF-8 Markdown without embedded NUL bytes', () => {
    const contents = readFileSync(SYSTEMS_INVENTORY_PATH);
    const decoded = new TextDecoder('utf-8', { fatal: true }).decode(contents);

    expect(contents.includes(0)).toBe(false);
    expect(decoded).toContain('# OpenGrimoire — systems inventory');
  });
});
