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

  test('detail back link returns to list with run row still visible (continuity)', async ({ request, page }) => {
    const runnerId = `e2e-probe-continuity-${Date.now()}`;
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
        summary: { continuity: true },
      },
    });
    expect(ingest.status()).toBe(201);
    const { id: runId } = (await ingest.json()) as { id: string };

    await loginAsAdmin(page);
    await page.goto('/admin/observability');
    await expect(page.getByTestId(`operator-probe-run-${runId}`)).toBeVisible();

    await Promise.all([
      page.waitForURL(`**/admin/observability/${runId}`),
      page.getByTestId(`operator-probe-detail-link-${runId}`).click(),
    ]);
    await expect(page.getByTestId('operator-probe-detail-heading')).toBeVisible();

    await Promise.all([
      page.waitForURL('**/admin/observability', { timeout: 20000 }),
      page.getByRole('link', { name: 'All probe runs' }).click(),
    ]);
    await expect(page.getByTestId('operator-observability-heading')).toBeVisible({ timeout: 20000 });
    await expect(page.getByTestId(`operator-probe-run-${runId}`)).toBeVisible({ timeout: 20000 });
  });
});

test.describe('Operator observability — routine_run records', () => {
  test('routine_run ingest rejects unknown fields (strict body)', async ({ request }) => {
    const res = await request.post('/api/operator-probes/ingest', {
      headers: {
        'Content-Type': 'application/json',
        'x-operator-probe-ingest-key': E2E_OPERATOR_PROBE_INGEST_SECRET,
      },
      data: {
        probe_type: 'routine_run',
        runner_id: 'e2e-routine-strict',
        runner_type: 'ci',
        summary: {
          agent_id: 'e2e-agent-1',
          routine_id: 'e2e-routine',
          fired_at: '2026-11-14T15:00:00Z',
          outcome: 'done',
          message: 'free-form text must be rejected',
        },
      },
    });
    expect(res.status()).toBe(400);
  });

  test('routine_run ingest appears in /admin/observability with label and outcome', async ({ request, page }) => {
    const stamp = Date.now();
    const agentId = `e2e-agent-${stamp}`;
    const res = await request.post('/api/operator-probes/ingest', {
      headers: {
        'Content-Type': 'application/json',
        'x-operator-probe-ingest-key': E2E_OPERATOR_PROBE_INGEST_SECRET,
      },
      data: {
        probe_type: 'routine_run',
        runner_id: `e2e-routine-${stamp}`,
        runner_type: 'ci',
        summary: {
          agent_id: agentId,
          routine_id: 'e2e-nightly',
          routine_name: 'E2E nightly',
          fired_at: '2026-11-14T15:00:00Z',
          finished_at: '2026-11-14T15:01:00Z',
          outcome: 'failed',
          reason: 'E2E: simulated failure',
        },
      },
    });
    expect(res.status()).toBe(201);
    const { id: runId } = (await res.json()) as { id: string };

    const list = await request.get('/api/admin/operator-probes', {
      headers: { 'x-operator-probe-admin-key': E2E_OPERATOR_PROBE_ADMIN_SECRET },
    });
    expect(list.status()).toBe(200);
    const { items } = (await list.json()) as {
      items: { id: string; probe_type: string; target_host: string; summary: Record<string, unknown> }[];
    };
    const item = items.find((i) => i.id === runId);
    expect(item?.probe_type).toBe('routine_run');
    expect(item?.target_host).toBe('routine');
    expect(item?.summary.agent_id).toBe(agentId);

    await loginAsAdmin(page);
    await page.goto('/admin/observability');
    await expect(page.getByTestId(`operator-probe-run-${runId}`)).toBeVisible();
    await expect(page.getByTestId(`operator-probe-routine-label-${runId}`)).toHaveText('E2E nightly (e2e-nightly)');
    await expect(page.getByTestId(`operator-probe-routine-agent-${runId}`)).toHaveText(`agent ${agentId}`);
    await expect(page.getByTestId(`operator-probe-routine-outcome-${runId}`)).toHaveText('failed');
    await expect(page.getByTestId(`operator-probe-routine-reason-${runId}`)).toHaveText('E2E: simulated failure');

    const del = await request.delete(`/api/admin/operator-probes/${encodeURIComponent(runId)}`, {
      headers: { 'x-operator-probe-admin-key': E2E_OPERATOR_PROBE_ADMIN_SECRET },
    });
    expect(del.status()).toBe(200);
  });
});
