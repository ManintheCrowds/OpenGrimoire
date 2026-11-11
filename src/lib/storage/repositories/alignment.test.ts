import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';

const ORIGINAL_DB_PATH = process.env.OPENGRIMOIRE_DB_PATH;
let tempDir: string | null = null;

vi.mock('server-only', () => ({}));

afterEach(() => {
  if (ORIGINAL_DB_PATH === undefined) {
    delete process.env.OPENGRIMOIRE_DB_PATH;
  } else {
    process.env.OPENGRIMOIRE_DB_PATH = ORIGINAL_DB_PATH;
  }
  if (tempDir) {
    fs.rmSync(tempDir, { recursive: true, force: true });
    tempDir = null;
  }
  vi.resetModules();
});

async function loadAlignment() {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'opengrimoire-alignment-'));
  vi.resetModules();
  process.env.OPENGRIMOIRE_DB_PATH = path.join(tempDir, 'opengrimoire.sqlite');
  const [{ getSqlite }, alignment] = await Promise.all([import('@/db/client'), import('./alignment')]);
  return { getSqlite, ...alignment };
}

function item(title: string, linked: string | null, status: 'draft' | 'active' | 'archived' = 'active') {
  return {
    title,
    body: null,
    tags: ['grokbot'],
    priority: null,
    status,
    linked_node_id: linked,
    attendee_id: null,
    source: 'api' as const,
    created_by: null,
  };
}

describe('listAlignmentContextItems linkedNodeId filter', () => {
  it('returns only items linked to the requested node', async () => {
    const { getSqlite, insertAlignmentContextItem, listAlignmentContextItems } = await loadAlignment();
    insertAlignmentContextItem(item('A', 'bot:agent-a'));
    insertAlignmentContextItem(item('B', 'bot:agent-b'));
    insertAlignmentContextItem(item('A old', 'bot:agent-a', 'archived'));
    insertAlignmentContextItem(item('none', null));

    const a = listAlignmentContextItems({ statusFilter: null, linkedNodeId: 'bot:agent-a', limit: 100 });
    expect(a.error).toBeNull();
    expect(a.data?.map((r) => r.title).sort()).toEqual(['A', 'A old']);

    const aActive = listAlignmentContextItems({ statusFilter: 'active', linkedNodeId: 'bot:agent-a', limit: 100 });
    expect(aActive.data?.map((r) => r.title)).toEqual(['A']);

    const all = listAlignmentContextItems({ statusFilter: null, limit: 100 });
    expect(all.data).toHaveLength(4);

    getSqlite().close();
  });

  it('is an exact match, not a prefix or LIKE match', async () => {
    const { getSqlite, insertAlignmentContextItem, listAlignmentContextItems } = await loadAlignment();
    insertAlignmentContextItem(item('A', 'bot:agent-a'));
    insertAlignmentContextItem(item('A2', 'bot:agent-a2'));

    for (const probe of ['bot:agent-', 'bot:agent-%', 'BOT:AGENT-A']) {
      const r = listAlignmentContextItems({ statusFilter: null, linkedNodeId: probe, limit: 100 });
      expect(r.data).toEqual([]);
    }
    const exact = listAlignmentContextItems({ statusFilter: null, linkedNodeId: 'bot:agent-a', limit: 100 });
    expect(exact.data?.map((r) => r.title)).toEqual(['A']);

    getSqlite().close();
  });
});
