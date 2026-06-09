/**
 * OGAN-15 Phase 2b — keyboard reachability for constellation demo controls and
 * visualization tablist. WebGL canvas is out of scope (axe excludes canvas in
 * visualization-constellation-a11y.spec.ts); Three scene focus remains product/AT.
 */
import { test, expect, type Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

function loadConstellationFixture(): string {
  return fs.readFileSync(
    path.join(process.cwd(), 'e2e', 'fixtures', 'constellation-keyboard-viz.json'),
    'utf-8'
  );
}

async function waitForConstellationControls(page: Page) {
  await page.goto('/constellation');
  await expect(page.getByTestId('opengrimoire-viz-constellation-route-loading')).not.toBeVisible({
    timeout: 30000,
  });
  await expect(page.getByTestId('opengrimoire-viz-constellation-root')).toBeVisible({ timeout: 30000 });
  await expect(page.getByTestId('opengrimoire-viz-constellation-cluster-controls')).toBeVisible({
    timeout: 20000,
  });
}

test.describe('Constellation keyboard reachability (OGAN-15)', () => {
  test.beforeEach(async ({ page }) => {
    const body = loadConstellationFixture();
    await page.route('**/api/survey/visualization**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body,
      });
    });
  });

  test('cluster attribute buttons are focusable and activate with Enter', async ({ page }) => {
    await waitForConstellationControls(page);

    const secondCluster = page.getByTestId('opengrimoire-viz-constellation-cluster-shaped_by');
    await secondCluster.focus();
    await expect(secondCluster).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(secondCluster).toHaveClass(/bg-blue-600/);
  });

  test('autoplay toggle is focusable and toggles aria-pressed', async ({ page }) => {
    await waitForConstellationControls(page);

    const autoplay = page.getByTestId('opengrimoire-viz-constellation-autoplay');
    await expect(autoplay).toHaveAttribute('aria-pressed', 'false');
    await autoplay.focus();
    await expect(autoplay).toBeFocused();
    await page.keyboard.press('Space');
    await expect(autoplay).toHaveAttribute('aria-pressed', 'true');
  });

  test('test-data toggle is keyboard-activatable and toggles aria-pressed', async ({ page }) => {
    await waitForConstellationControls(page);

    const toggle = page.getByTestId('opengrimoire-viz-constellation-test-data-toggle');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await toggle.focus();
    await expect(toggle).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await toggle.focus();
    await expect(toggle).toBeFocused();
  });
});

test.describe('Visualization tab keyboard (OGAN-15)', () => {
  test('ArrowDown on Alluvial tab switches to Chord and moves focus', async ({ page }) => {
    await page.goto('/visualization');
    await expect(page.getByTestId('alluvial-diagram')).toBeVisible({ timeout: 20000 });

    const alluvialTab = page.locator('#opengrimoire-viz-tab-alluvial');
    const chordTab = page.locator('#opengrimoire-viz-tab-chord');
    await alluvialTab.focus();
    await page.keyboard.press('ArrowDown');

    await expect(chordTab).toHaveAttribute('aria-selected', 'true');
    await expect(chordTab).toBeFocused();
    await expect(page.getByTestId('chord-diagram')).toBeVisible();
  });

  test('ArrowUp on Chord tab switches to Alluvial and moves focus', async ({ page }) => {
    await page.goto('/visualization');
    await page.getByRole('tab', { name: 'Chord' }).click();
    await expect(page.getByTestId('chord-diagram')).toBeVisible({ timeout: 20000 });

    const alluvialTab = page.locator('#opengrimoire-viz-tab-alluvial');
    const chordTab = page.locator('#opengrimoire-viz-tab-chord');
    await chordTab.focus();
    await page.keyboard.press('ArrowUp');

    await expect(alluvialTab).toHaveAttribute('aria-selected', 'true');
    await expect(alluvialTab).toBeFocused();
    await expect(page.getByTestId('alluvial-diagram')).toBeVisible();
  });
});
