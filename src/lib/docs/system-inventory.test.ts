import { readFileSync } from 'node:fs';
import path from 'node:path';
import { TextDecoder } from 'node:util';
import { describe, expect, it } from 'vitest';

const inventoryPath = path.join(process.cwd(), 'docs', 'OPENGRIMOIRE_SYSTEMS_INVENTORY.md');

describe('OpenGrimoire systems inventory', () => {
  it('is valid UTF-8 Markdown', () => {
    const bytes = readFileSync(inventoryPath);
    const markdown = new TextDecoder('utf-8', { fatal: true }).decode(bytes);

    expect(markdown).toMatch(/^# OpenGrimoire — systems inventory/);
    expect(markdown).not.toContain('\0');
  });
});
