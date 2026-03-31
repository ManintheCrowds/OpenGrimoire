import { test, expect } from '@playwright/test';

test.describe('Smoke tests', () => {
  test('home loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'OpenGrimoire' })).toBeVisible();
  });

  test('nav links work and main routes render', async ({ page }) => {
    await page.goto('/');

    // Client navigation: wait for URL in parallel with click (avoids flake before hydration completes)
    await Promise.all([
      page.waitForURL(/\/visualization/),
      page.getByTestId('nav-link-visualization').click(),
    ]);
    await expect(page).toHaveURL(/\/visualization/);
    await expect(page.getByTestId('alluvial-diagram')).toBeVisible({ timeout: 10000 });

    // Operator intake (home grid card)
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'OpenGrimoire' })).toBeVisible();
    await page.getByTestId('home-card-operator-intake').click();
    await expect(page).toHaveURL(/\/operator-intake/);
    await expect(page.getByTestId('survey-form-container')).toBeVisible();

    // Operator intake via top nav (OA-2 — not only home cards)
    await page.goto('/context-atlas');
    await Promise.all([
      page.waitForURL(/\/operator-intake/),
      page.getByTestId('nav-link-operator-intake').click(),
    ]);
    await expect(page.getByTestId('survey-form-container')).toBeVisible();

    // Admin controls
    await page.goto('/');
    await Promise.all([
      page.waitForURL(/\/admin\/controls/),
      page.getByTestId('nav-link-admin-controls').click(),
    ]);
    await expect(page).toHaveURL(/\/admin\/controls/);
    await expect(page.getByText('Global Visualization Controls')).toBeVisible();
  });
});
