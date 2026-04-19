/**
 * OG-GUI-01 — BrowserReviewSpec evidence at 1280×720 (screenshots for audit attach).
 * Run: npx playwright test e2e/og-gui-01-browser-review-evidence.spec.ts
 */
import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';

import { loginAsAdmin } from './helpers/admin-login';

const OUT_DIR = path.join(process.cwd(), 'docs', 'audit', 'evidence', 'og-gui-01');

function wireDiagnostics(page: Page) {
  const consoleErrors: string[] = [];
  const requestFailed: { url: string; error?: string }[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('requestfailed', (req) => {
    requestFailed.push({ url: req.url(), error: req.failure()?.errorText });
  });
  return async (flowId: string) => {
    const out = path.join(OUT_DIR, `${flowId}-console-network.json`);
    await fs.promises.writeFile(
      out,
      JSON.stringify({ consoleErrors, requestFailed }, null, 2),
      'utf8'
    );
  };
}

test.beforeAll(() => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
});

test.describe('OG-GUI-01 evidence', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test('flow 2: /survey redirects to /operator-intake + screenshot', async ({ page }) => {
    const dump = wireDiagnostics(page);
    await page.goto('/survey');
    await expect(page).toHaveURL(/\/operator-intake/, { timeout: 15000 });
    await page.screenshot({ path: path.join(OUT_DIR, '02-survey-redirect-operator-intake.png'), fullPage: true });
    await dump('02');
  });

  test('flow 1: operator-intake submit → success or error + screenshot', async ({ page }) => {
    const dump = wireDiagnostics(page);
    await page.goto('/operator-intake');
    const surveyPost = page.waitForResponse(
      (res) => res.url().includes('/api/survey') && res.request().method() === 'POST'
    );

    await expect(page.getByTestId('sync-session-form-container')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('name-input')).toBeVisible({ timeout: 10000 });
    await page.getByTestId('name-input').fill('OG-GUI-01');
    await page.getByTestId('email-input').fill('og-gui-01@example.com');
    await page.getByTestId('next-button').click();

    await page.getByText('1-2 years').click();
    await page.getByTestId('next-button').click();

    await page
      .getByTestId('sync-session-form-container')
      .getByText('Visual', { exact: true })
      .click();
    await page.getByTestId('next-button').click();

    await page.getByText('Mentorship').first().click();
    await page.getByTestId('next-button').click();

    await page.getByText('Extrovert, Morning').first().click();
    await page.getByTestId('next-button').click();

    await page.getByText('Making an Impact').first().click();
    await page.getByTestId('next-button').click();

    await page.getByTestId('unique-quality-input').fill('OG-GUI-01 BrowserReview evidence run.');
    await page.getByTestId('submit-button').click();

    const postRes = await surveyPost;
    expect(postRes.status(), 'POST /api/survey status').toBe(200);

    await expect(
      page.getByTestId('success-step').or(page.locator('.message-error'))
    ).toBeVisible({ timeout: 15000 });

    await page.screenshot({ path: path.join(OUT_DIR, '01-operator-intake-after-submit.png'), fullPage: true });
    await dump('01');
  });

  test('flow 3: login → /admin moderation panel + screenshot', async ({ page }) => {
    const dump = wireDiagnostics(page);
    await loginAsAdmin(page);
    await expect(page).toHaveURL(/\/admin/, { timeout: 15000 });
    await expect(page.getByRole('heading', { name: /Response Moderation Queue/i })).toBeVisible({
      timeout: 20000,
    });
    await page.screenshot({ path: path.join(OUT_DIR, '03-admin-moderation-panel.png'), fullPage: true });
    await dump('03');
  });
});
