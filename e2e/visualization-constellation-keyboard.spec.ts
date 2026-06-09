/**
 * OGAN-15 Phase 2b/3 — keyboard reachability for constellation demo controls and
 * visualization tablist. WebGL canvas is out of axe scope (axe excludes canvas in
 * visualization-constellation-a11y.spec.ts); Three scene pointer focus remains
 * product/AT — manual VoiceOver/NVDA spot-check cadence per
 * docs/audit/gui-2026-04-16-opengrimoire-data-viz.md §3.
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

    const announcer = page.getByTestId('opengrimoire-viz-constellation-announcer');
    await expect(announcer).toContainText(/2 nodes/);

    const secondCluster = page.getByTestId('opengrimoire-viz-constellation-cluster-shaped_by');
    await secondCluster.focus();
    await expect(secondCluster).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(secondCluster).toHaveClass(/bg-blue-600/);
    await expect(announcer).toContainText(/Clustering by Shaped By/i);
  });

  test('cluster attribute buttons activate with Space and update announcer', async ({ page }) => {
    await waitForConstellationControls(page);

    const announcer = page.getByTestId('opengrimoire-viz-constellation-announcer');
    const shapedBy = page.getByTestId('opengrimoire-viz-constellation-cluster-shaped_by');
    await shapedBy.focus();
    await page.keyboard.press('Space');
    await expect(shapedBy).toHaveClass(/bg-blue-600/);
    await expect(announcer).toContainText(/Clustering by Shaped By/i);
  });

  test('autoplay toggle is focusable, toggles aria-pressed, announces, and keeps focus', async ({
    page,
  }) => {
    await waitForConstellationControls(page);

    const announcer = page.getByTestId('opengrimoire-viz-constellation-announcer');
    const autoplay = page.getByTestId('opengrimoire-viz-constellation-autoplay');
    await expect(autoplay).toHaveAttribute('aria-pressed', 'false');
    await autoplay.focus();
    await expect(autoplay).toBeFocused();
    await page.keyboard.press('Space');
    await expect(autoplay).toHaveAttribute('aria-pressed', 'true');
    await expect(announcer).toContainText(/Auto-play started/i);
    await expect(autoplay).toBeFocused();
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
