import { test, expect } from '@playwright/test';

/**
 * Regression: the brain map svg used to collapse to 0px height inside the flex layout,
 * so the force graph "loaded" but nothing was visible. Serve a tiny fixture graph and
 * assert the svg has real height, nodes land inside the visible svg box, and labels
 * show node names (not raw ids).
 */
const fixture = {
  generated: new Date().toISOString(),
  sessionCount: 1,
  nodes: [
    { id: 'n-grimoire', group: 'core', accessCount: 5, path: 'vault/projects/OpenGrimoire.md' },
    { id: 'n-watchtower', group: 'research', accessCount: 3, path: 'vault/projects/moltbook_watchtower.md' },
    { id: 'n-handoff', group: 'memory', accessCount: 2, path: 'state/handoff/latest.json' },
  ],
  edges: [
    { source: 'n-grimoire', target: 'n-watchtower', weight: 2, sessionType: 'build', sessions: ['s1'] },
    { source: 'n-grimoire', target: 'n-handoff', weight: 1, sessionType: 'build', sessions: ['s1'] },
  ],
};

test('brain map draws nodes inside the visible graph area with name labels', async ({ page }) => {
  await page.route('**/api/brain-map/graph**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ...fixture, chunkIndex: 0, chunkSize: 500, hasMoreNodes: false, hasMoreEdges: false }),
    }),
  );
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/brain-map');

  const svg = page.getByTestId('brain-map-svg');
  await expect(svg).toBeVisible({ timeout: 20000 });
  const svgBox = await svg.boundingBox();
  expect(svgBox, 'svg has a layout box').not.toBeNull();
  expect(svgBox!.height).toBeGreaterThanOrEqual(300);

  const node = svg.locator('circle[data-node-id="n-grimoire"]');
  await expect(node).toHaveCount(1, { timeout: 20000 });
  // Let the force simulation settle a little before measuring.
  await page.waitForTimeout(1500);
  const nodeBox = await node.boundingBox();
  expect(nodeBox, 'node has a layout box').not.toBeNull();
  const cx = nodeBox!.x + nodeBox!.width / 2;
  const cy = nodeBox!.y + nodeBox!.height / 2;
  expect(cx).toBeGreaterThanOrEqual(svgBox!.x);
  expect(cx).toBeLessThanOrEqual(svgBox!.x + svgBox!.width);
  expect(cy).toBeGreaterThanOrEqual(svgBox!.y);
  expect(cy).toBeLessThanOrEqual(svgBox!.y + svgBox!.height);

  await expect(svg.locator('text', { hasText: /^OpenGrimoire$/ })).toHaveCount(1);
  await expect(svg.locator('text', { hasText: /^latest$/ })).toHaveCount(1);

  await page.screenshot({ path: 'test-results/brain-map-graph-visible.png', fullPage: false });
});
