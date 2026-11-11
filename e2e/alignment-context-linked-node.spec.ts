import { test, expect } from '@playwright/test';

import { E2E_ALIGNMENT_CONTEXT_API_SECRET } from './helpers/e2e-secrets';

const headers = {
  'Content-Type': 'application/json',
  'x-alignment-context-key': E2E_ALIGNMENT_CONTEXT_API_SECRET,
};

test.describe('Alignment context linked_node_id filter', () => {
  test('a collector can find its own item by linked_node_id and patch it in place', async ({ request }) => {
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const mine = `bot:e2e-agent-${suffix}`;
    const other = `bot:e2e-other-${suffix}`;

    for (const [title, linked] of [
      ['E2E mine', mine],
      ['E2E other', other],
    ]) {
      const res = await request.post('/api/alignment-context', {
        headers,
        data: JSON.stringify({ title, tags: ['e2e'], status: 'active', linked_node_id: linked }),
      });
      expect(res.status()).toBe(201);
    }

    const list = await request.get(`/api/alignment-context?linked_node_id=${encodeURIComponent(mine)}`, { headers });
    expect(list.status()).toBe(200);
    const { items } = (await list.json()) as { items: { id: string; title: string; linked_node_id: string }[] };
    expect(items).toHaveLength(1);
    expect(items[0]?.title).toBe('E2E mine');
    expect(items[0]?.linked_node_id).toBe(mine);

    const patch = await request.patch(`/api/alignment-context/${items[0]!.id}`, {
      headers,
      data: JSON.stringify({ body: 'updated in place' }),
    });
    expect(patch.status()).toBe(200);

    const again = await request.get(`/api/alignment-context?linked_node_id=${encodeURIComponent(mine)}`, { headers });
    const after = (await again.json()) as { items: { body: string | null }[] };
    expect(after.items).toHaveLength(1);
    expect(after.items[0]?.body).toBe('updated in place');
  });

  test('rejects an empty linked_node_id and still requires the key', async ({ request }) => {
    const empty = await request.get('/api/alignment-context?linked_node_id=', { headers });
    expect(empty.status()).toBe(400);

    const noKey = await request.get('/api/alignment-context?linked_node_id=bot:x');
    expect(noKey.status()).toBe(401);
  });
});
