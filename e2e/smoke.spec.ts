import { test, expect } from '@playwright/test';

test.describe('Smoke tests', () => {
  test('home loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'OpenGrimoire' })).toBeVisible();
  });

  test('nav links work and main routes render', async ({ page }) => {
    await page.goto('/');

    // Visualization (scope to main so we hit the home card, not any future duplicate ids)
    await page.locator('main').getByTestId('nav-link-visualization').click();
    await expect(page).toHaveURL(/\/visualization/);
    await expect(page.getByTestId('alluvial-diagram')).toBeVisible({ timeout: 10000 });

    // Operator intake
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'OpenGrimoire' })).toBeVisible();
    await page.getByTestId('nav-link-operator-intake').click();
    await expect(page).toHaveURL(/\/operator-intake/);
    await expect(page.getByTestId('survey-form-container')).toBeVisible();

    // Admin controls
    await page.goto('/');
    await page.getByTestId('nav-link-admin-controls').click();
    await expect(page).toHaveURL(/\/admin\/controls/);
    await expect(page.getByText('Global Visualization Controls')).toBeVisible();
  });
});
