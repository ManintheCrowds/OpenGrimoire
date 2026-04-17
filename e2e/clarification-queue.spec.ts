import { test, expect } from '@playwright/test';

import { E2E_ALIGNMENT_CONTEXT_API_SECRET } from './helpers/e2e-secrets';

test.describe('Clarification queue', () => {
  test('admin inbox shows pending item after API create', async ({ page, request }) => {
    const create = await request.post('/api/clarification-requests', {
      headers: {
        'Content-Type': 'application/json',
        'x-alignment-context-key': E2E_ALIGNMENT_CONTEXT_API_SECRET,
      },
      data: JSON.stringify({
        question_spec: {
          kind: 'text',
          prompt: 'E2E: what should we verify?',
        },
        agent_metadata: { reason: 'playwright e2e' },
      }),
    });
    expect(create.ok()).toBeTruthy();
    const created = (await create.json()) as { item?: { id: string } };
    const id = created.item?.id;
    expect(id && /^[0-9a-f-]{36}$/i.test(id)).toBeTruthy();

    await page.goto('/login');
    await page.getByPlaceholder('Operator password').fill('e2e-test-password');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL(/\/admin/, { timeout: 15000 });

    await page.goto('/admin/clarification-queue');
    await expect(page.getByTestId('clarification-queue-page')).toBeVisible({ timeout: 15000 });
    const item = page.getByTestId(`clarification-item-${id}`);
    await expect(item).toBeVisible({ timeout: 10000 });
    await expect(item.getByText('E2E: what should we verify?')).toBeVisible();
  });
});
