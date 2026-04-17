import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';

export function adminPassword(): string {
  return process.env.OPENGRIMOIRE_ADMIN_PASSWORD ?? 'e2e-test-password';
}

export async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: /OpenGrimoire admin/i })).toBeVisible();
  await page.getByPlaceholder('Operator password').fill(adminPassword());
  await Promise.all([
    page.waitForURL(/\/admin/),
    page.getByRole('button', { name: /Sign in/i }).click(),
  ]);
}
