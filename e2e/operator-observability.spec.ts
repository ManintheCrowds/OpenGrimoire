import { expect, test } from '@playwright/test';

import { loginAsAdmin } from './helpers/admin-login';
import {
  E2E_ALIGNMENT_CONTEXT_API_SECRET,
  E2E_OPERATOR_PROBE_ADMIN_SECRET,
  E2E_OPERATOR_PROBE_INGEST_SECRET,
} from './helpers/e2e-secrets';

test.describe('Operator observability', () => {
  test('admin operator-probes API returns 401 without session or admin key', async ({ request }) => {
    const res = await request.get('/api/admin/operator-probes');
    expect(res.status()).toBe(401);
  });

  test('admin operator-probes list returns 401 with wrong admin key when secret is set', async ({ request }) => {
    const res = await request.get('/api/admin/operator-probes', {
      headers: { 'x-operator-probe-admin-key': 'wrong-key' },
    });
    expect(res.status()).toBe(401);
  });

  test('admin operator-probes list returns 200 with valid admin key and no session', async ({ request }) => {
    const res = await request.get('/api/admin/operator-probes', {
      headers: { 'x-operator-probe-admin-key': E2E_OPERATOR_PROBE_ADMIN_SECRET },
    });
    expect(res.status()).toBe(200);
    const body = (await res.json()) as { items?: unknown[] };
    expect(Array.isArray(body.items)).toBe(true);
  });

  test('admin operator-probes list rejects x-alignment-context-key without session', async ({ request }) => {
    const res = await request.get('/api/admin/operator-probes', {
      headers: { 'x-alignment-context-key': E2E_ALIGNMENT_CONTEXT_API_SECRET },
    });
    expect(res.status()).toBe(401);
  });

  test('admin DELETE with valid admin key and no session', async ({ request }) => {
    const runnerId = `e2e-admin-del-${Date.now()}`;
    const ingest = await request.post('/api/operator-probes/ingest', {
      headers: {
        'Content-Type': 'application/json',
        'x-operator-probe-ingest-key': E2E_OPERATOR_PROBE_INGEST_SECRET,
      },
      data: {
        probe_type: 'cursor_path_analysis',
        target_host: 'api.cursor.com',
        runner_id: runnerId,
        runner_type: 'ci',
        summary: { e2e_admin_delete: true },
      },
    });
    expect(ingest.status()).toBe(201);
    const { id: runId } = (await ingest.json()) as { id: string };

    const del = await request.delete(`/api/admin/operator-probes/${encodeURIComponent(runId)}`, {
      headers: { 'x-operator-probe-admin-key': E2E_OPERATOR_PROBE_ADMIN_SECRET },
    });
    expect(del.status()).toBe(200);

    const get = await request.get(`/api/admin/operator-probes/${encodeURIComponent(runId)}`, {
      headers: { 'x-operator-probe-admin-key': E2E_OPERATOR_PROBE_ADMIN_SECRET },
    });
    expect(get.status()).toBe(404);
  });

  test('ingest returns 401 or 503 without auth depending on OPERATOR_PROBE_INGEST_SECRET', async ({ request }) => {
    const res = await request.post('/api/operator-probes/ingest', {
      headers: { 'Content-Type': 'application/json' },
      data: {
        probe_type: 'cursor_path_analysis',
        target_host: 'api.cursor.com',
        runner_id: 'e2e-anon',
        runner_type: 'ci',
        summary: { probe: true },
      },
    });
    const status = res.status();
    expect(
      status === 401 || status === 503,
      `expected 401 (secret set, missing key) or 503 (secret unset); got ${status}`
    ).toBe(true);
  });

  test('ingest with valid secret creates run; list, detail, and delete', async ({ request, page }) => {
    const runnerId = `e2e-probe-${Date.now()}`;
    const res = await request.post('/api/operator-probes/ingest', {
      headers: {
        'Content-Type': 'application/json',
        'x-operator-probe-ingest-key': E2E_OPERATOR_PROBE_INGEST_SECRET,
      },
      data: {
        probe_type: 'cursor_path_analysis',
        target_host: 'api.cursor.com',
        runner_id: runnerId,
        runner_type: 'ci',
        summary: { e2e: true, hops: 2 },
      },
    });
    expect(res.status()).toBe(201);
    const body = (await res.json()) as { id?: string };
    expect(body.id).toBeTruthy();
    const runId = body.id as string;

    await loginAsAdmin(page);
    await page.goto('/admin/observability');
    await expect(page.getByTestId('operator-observability-heading')).toBeVisible();
    await expect(page.getByTestId(`operator-probe-run-${runId}`)).toBeVisible();
    await expect(page.getByTestId(`operator-probe-runner-id-${runId}`)).toHaveText(runnerId);
    await expect(page.getByTestId(`operator-probe-target-host-${runId}`)).toHaveText('api.cursor.com');

    const detailLink = page.getByTestId(`operator-probe-detail-link-${runId}`);
    await expect(detailLink).toHaveAttribute('href', `/admin/observability/${runId}`);
    await detailLink.scrollIntoViewIfNeeded();
    await Promise.all([
      page.waitForURL(`**/admin/observability/${runId}`),
      detailLink.click(),
    ]);
    await expect(page).toHaveURL(new RegExp(`/admin/observability/${runId}`));
    await expect(page.getByTestId('operator-probe-detail-heading')).toBeVisible({ timeout: 20000 });
    await expect(page.getByTestId('operator-probe-delete-button')).toBeVisible({ timeout: 20000 });

    page.once('dialog', (dialog) => {
      void dialog.accept();
    });
    await page.getByTestId('operator-probe-delete-button').click();
    await expect(page).toHaveURL(/\/admin\/observability$/);
    await expect(page.getByTestId(`operator-probe-run-${runId}`)).toHaveCount(0);
  });
});
