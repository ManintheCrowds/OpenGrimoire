/**
 * OA-6 — Automated regression for Brain Map tab semantics and keyboard activation
 * (complements optional manual SR/AT spot-check; see docs/audit/gui-2026-03-26.md §10).
 */
import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

function loadBrainMapFixture(file: string): string {
  const full = path.join(process.cwd(), 'e2e', 'fixtures', file);
  return fs.readFileSync(full, 'utf-8');
}

test.describe('Brain Map OA-6 (tabs + graph shell a11y)', () => {
  test.beforeEach(async ({ page }) => {
    const body = loadBrainMapFixture('brain-map-state-only.json');
    await page.route('**/api/brain-map/graph**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body,
      });
    });
  });

  test('tablist and view tabs expose correct roles and labels', async ({ page }) => {
    await page.goto('/context-atlas');
    await expect(page.getByText('Loading brain map')).not.toBeVisible({ timeout: 15000 });

    const tablist = page.getByRole('tablist', { name: 'View mode' });
    await expect(tablist).toBeVisible();

    const graphTab = page.getByRole('tab', { name: 'Graph' });
    const tableTab = page.getByRole('tab', { name: 'Table' });
    await expect(graphTab).toHaveAttribute('aria-selected', 'true');
    await expect(tableTab).toHaveAttribute('aria-selected', 'false');

    await expect(page.locator('#brain-map-graph-panel')).toBeVisible();
    await expect(page.locator('#brain-map-graph-panel')).toHaveAttribute('role', 'tabpanel');
    await expect(page.locator('#brain-map-graph-panel svg[aria-label="Context graph visualization"]')).toBeVisible();
  });

  test('keyboard: Space on Table tab switches to table panel', async ({ page }) => {
    await page.goto('/context-atlas');
    await expect(page.getByText('Loading brain map')).not.toBeVisible({ timeout: 15000 });

    const tableTab = page.getByRole('tab', { name: 'Table' });
    await tableTab.focus();
    await page.keyboard.press('Space');

    await expect(tableTab).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#brain-map-table-panel')).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('layer filter tabs (All / State / Vault) are present and toggle', async ({ page }) => {
    await page.goto('/context-atlas');
    await expect(page.getByText('Loading brain map')).not.toBeVisible({ timeout: 15000 });

    await expect(page.getByRole('tab', { name: 'All' })).toHaveAttribute('aria-selected', 'true');
    await page.getByRole('tab', { name: 'Vault' }).click();
    await expect(page.getByRole('tab', { name: 'Vault' })).toHaveAttribute('aria-selected', 'true');
  });

  test('Refresh graph button is reachable and exposes aria-label', async ({ page }) => {
    await page.goto('/context-atlas');
    await expect(page.getByText('Loading brain map')).not.toBeVisible({ timeout: 15000 });

    const refresh = page.getByRole('button', {
      name: /Reload context graph from server/i,
    });
    await expect(refresh).toBeVisible();
  });
});
