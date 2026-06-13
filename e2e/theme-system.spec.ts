/**
 * Phase 3 — system theme follows prefers-color-scheme when localStorage is
 * 'system' or unset; explicit light/dark overrides emulated OS preference.
 */
import { test, expect } from '@playwright/test';

import { clearAppTheme, setAppTheme } from './helpers/theme';

test.describe('System theme (prefers-color-scheme)', () => {
  test('system preference follows emulated light OS scheme', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await setAppTheme(page, 'system');
    await page.goto('/');
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  });

  test('system preference follows emulated dark OS scheme', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await setAppTheme(page, 'system');
    await page.goto('/');
    await expect(page.locator('html')).toHaveClass(/dark/);
  });

  test('unset localStorage follows emulated dark OS scheme', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await clearAppTheme(page);
    await page.goto('/');
    await expect(page.locator('html')).toHaveClass(/dark/);
  });

  test('explicit light overrides emulated dark OS scheme', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await setAppTheme(page, 'light');
    await page.goto('/');
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  });

  test('forced dark visualization does not persist over explicit light theme', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await setAppTheme(page, 'light');

    await page.goto('/visualization/dark');
    await expect(page.locator('html')).toHaveClass(/dark/);
    await expect(page.locator('body')).toHaveClass(/dark/);

    await page.getByRole('link', { name: 'Light Mode' }).click();
    await expect(page).toHaveURL(/\/visualization$/);
    await expect(page.locator('html')).not.toHaveClass(/dark/);
    await expect(page.locator('body')).not.toHaveClass(/dark/);
    await expect(page.evaluate(() => window.localStorage.getItem('opengrimoire.theme'))).resolves.toBe('light');
  });
});
