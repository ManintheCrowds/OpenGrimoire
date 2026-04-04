import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

function loadBrainMapFixture(file: string): string {
  const full = path.join(process.cwd(), 'e2e', 'fixtures', file);
  return fs.readFileSync(full, 'utf-8');
}

/** OA-7: no horizontal overflow on the document root (1px tolerance for subpixel). */
async function assertDocumentFitsViewportWidth(page: import('@playwright/test').Page) {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(
    scrollWidth,
    `expected documentElement scrollWidth (${scrollWidth}) <= clientWidth (${clientWidth}) + 1`
  ).toBeLessThanOrEqual(clientWidth + 1);
}

test.describe('OA-7 responsive (narrow viewports)', () => {
  test('context-atlas at 375px: heading, graph shell, refresh control; no horizontal document scroll', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    const body = loadBrainMapFixture('brain-map-state-only.json');
    await page.route('**/api/brain-map/graph**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body,
      });
    });
    await page.goto('/context-atlas');
    await expect(page.getByRole('heading', { name: /context graph/ })).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('brain-map-graph')).toBeVisible();
    await expect(
      page.getByRole('button', { name: /Reload context graph from server/ })
    ).toBeVisible();
    await assertDocumentFitsViewportWidth(page);
  });

  test('context-atlas at 720px: mocked graph; no horizontal document scroll', async ({ page }) => {
    await page.setViewportSize({ width: 720, height: 800 });
    const body = loadBrainMapFixture('brain-map-state-only.json');
    await page.route('**/api/brain-map/graph**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body,
      });
    });
    await page.goto('/context-atlas');
    await expect(page.getByRole('heading', { name: /context graph/ })).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('brain-map-graph')).toBeVisible();
    await assertDocumentFitsViewportWidth(page);
  });

  test('visualization at 375px: diagram mounts; no horizontal document scroll', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/visualization');
    await expect(
      page.getByTestId('alluvial-diagram').or(page.getByTestId('chord-diagram'))
    ).toBeVisible({ timeout: 15000 });
    await assertDocumentFitsViewportWidth(page);
  });
});
