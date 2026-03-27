import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

function loadBrainMapFixture(file: string): string {
  const full = path.join(process.cwd(), 'e2e', 'fixtures', file);
  return fs.readFileSync(full, 'utf-8');
}

test.describe('Context Atlas (Brain Map)', () => {
  test('context-atlas loads and shows graph or empty state', async ({ page }) => {
    await page.goto('/context-atlas');
    await expect(
      page.getByText(/Loading brain map|Loading context graph|Co-access|No nodes|nodes/)
    ).toBeVisible({ timeout: 10000 });
    // Graph shell is always mounted (see BrainMapGraph data-testid="brain-map-graph")
    await expect(page.getByTestId('brain-map-graph')).toBeVisible({ timeout: 15000 });
  });

  test('context-atlas heading is present', async ({ page }) => {
    await page.goto('/context-atlas');
    await expect(page.getByRole('heading', { name: /context graph/ })).toBeVisible({ timeout: 10000 });
  });

  test('mocked state-only graph: All shows table row; Vault shows empty-layer message', async ({
    page,
  }) => {
    const body = loadBrainMapFixture('brain-map-state-only.json');
    await page.route('**/api/brain-map/graph**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body,
      });
    });
    await page.goto('/context-atlas');
    await expect(page.getByText('Loading brain map')).not.toBeVisible({ timeout: 15000 });

    await page.getByRole('tab', { name: 'Table' }).click();
    await expect(page.getByRole('cell', { name: '.cursor/state/handoff_fixture.md' })).toBeVisible();
    await expect(page.getByTestId('col-trust-score')).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Trust score' })).toBeVisible();
    await expect(page.getByRole('cell', { name: '0.85' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Grimoire tags' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'fixture, opengrimoire' })).toBeVisible();

    await page.getByRole('tab', { name: 'Vault' }).click();
    await expect(
      page.getByText(/No nodes in this layer for the current filter/)
    ).toBeVisible();
  });

  test('mocked empty API with sessionCount 0: placeholder hint is visible', async ({ page }) => {
    const body = loadBrainMapFixture('brain-map-empty-session0.json');
    await page.route('**/api/brain-map/graph**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body,
      });
    });
    await page.goto('/context-atlas');
    await expect(page.getByTestId('brain-map-placeholder-hint')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('brain-map-placeholder-hint')).toContainText('Placeholder graph');
  });
});
