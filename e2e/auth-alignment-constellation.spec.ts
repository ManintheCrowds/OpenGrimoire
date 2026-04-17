/**
 * OA-5 — E2E smoke for /login, /admin/alignment, /constellation.
 * Playwright webServer sets OPENGRIMOIRE_ADMIN_PASSWORD (see playwright.config.ts).
 */
import { test, expect } from '@playwright/test';

import { adminPassword, loginAsAdmin } from './helpers/admin-login';

test.describe('OA-5 auth + alignment + constellation', () => {
  test('login page renders and sign-in redirects to /admin', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /OpenGrimoire admin/i })).toBeVisible();
    await page.getByPlaceholder('Operator password').fill(adminPassword());
    await Promise.all([
      page.waitForURL(/\/admin/),
      page.getByRole('button', { name: /Sign in/i }).click(),
    ]);
    await expect(page).toHaveURL(/\/admin/);
  });

  test('/admin/alignment loads after session', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/alignment');
    await expect(page.getByRole('heading', { name: 'Alignment context' })).toBeVisible({
      timeout: 15000,
    });
  });

  test('/constellation loads Constellation View', async ({ page }) => {
    await page.goto('/constellation');
    await expect(page.getByText('Loading visualization...')).not.toBeVisible({ timeout: 30000 });
    await expect(page.getByRole('heading', { name: 'Constellation View' })).toBeVisible({
      timeout: 15000,
    });
  });
});
