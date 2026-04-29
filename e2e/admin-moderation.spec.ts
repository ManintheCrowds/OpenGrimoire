/**
 * OA-FR-1 — moderation queue API: seed survey, operator session, PATCH, negative auth.
 */
import { test, expect } from '@playwright/test';

import { loginAsAdmin } from './helpers/admin-login';
import { E2E_ALIGNMENT_CONTEXT_API_SECRET } from './helpers/e2e-secrets';

function minimalSurveyBody() {
  return {
    firstName: 'Mod',
    lastName: 'E2E',
    isAnonymous: true,
    sessionType: 'profile',
    questionnaireVersion: 'v1',
    answers: [
      { questionId: 'tenure_years', answer: '2' },
      { questionId: 'learning_style', answer: 'visual' },
      { questionId: 'unique_quality', answer: 'E2E moderation queue seed text.' },
    ],
  };
}

test.describe('Admin moderation API', () => {
  /** SQLite + admin flows contend under `fullyParallel`; serialize to avoid timeouts. */
  test.describe.configure({ mode: 'serial' });
  test('seed → queue contains row → PATCH approved → 401 without session → 401 alignment key only', async ({
    page,
    request,
  }) => {
    const seed = await request.post('/api/survey', {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify(minimalSurveyBody()),
    });
    expect(seed.ok(), await seed.text()).toBeTruthy();
    const created = (await seed.json()) as { surveyResponseId?: string };
    const surveyResponseId = created.surveyResponseId;
    expect(surveyResponseId && /^[0-9a-f-]{36}$/i.test(surveyResponseId)).toBeTruthy();

    await loginAsAdmin(page);

    const queueRes = await page.request.get('/api/admin/moderation-queue');
    expect(queueRes.ok(), await queueRes.text()).toBeTruthy();
    const queueJson = (await queueRes.json()) as { items: { id: string }[] };
    const ids = queueJson.items.map((i) => i.id);
    expect(ids).toContain(surveyResponseId);

    const patchAuthed = await page.request.patch(`/api/admin/moderation/${surveyResponseId}`, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({ status: 'approved', notes: 'e2e' }),
    });
    expect(patchAuthed.ok(), await patchAuthed.text()).toBeTruthy();
    const patchBody = (await patchAuthed.json()) as { moderation?: { status?: string } };
    expect(patchBody.moderation?.status).toBe('approved');

    const patchNoCookie = await request.patch(`/api/admin/moderation/${surveyResponseId}`, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({ status: 'pending', notes: 'e2e-unauth' }),
    });
    expect(patchNoCookie.status()).toBe(401);

    const patchAlignmentOnly = await request.patch(`/api/admin/moderation/${surveyResponseId}`, {
      headers: {
        'Content-Type': 'application/json',
        'x-alignment-context-key': E2E_ALIGNMENT_CONTEXT_API_SECRET,
      },
      data: JSON.stringify({ status: 'pending', notes: 'e2e-alignment-only' }),
    });
    expect(patchAlignmentOnly.status()).toBe(401);
  });

  test('seed → loginAsAdmin → /admin shows moderation row for seeded response (UI)', async ({
    page,
    request,
  }) => {
    await page.route('**/api/admin/clarification-requests?status=pending&limit=5', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [
            {
              id: '11111111-1111-1111-1111-111111111111',
              created_at: '2020-01-01T00:00:00.000Z',
              question_spec: { prompt: 'Older pending clarification item' },
            },
          ],
        }),
      });
    });
    await page.route('**/api/admin/cockpit/local-ai/health', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          panel: 'local-ai-runtime-health',
          mode: 'read_only',
          summary: 'Read-only local AI setup check for the solo Windows developer path.',
          sqlite: {
            dbPath: 'C:/Users/Dell/Documents/GitHub/OpenGrimoire/data/opengrimoire.sqlite',
            dataDir: 'C:/Users/Dell/Documents/GitHub/OpenGrimoire/data',
            dbExists: true,
            dataDirExists: true,
            dataDirWritable: true,
          },
          ollama: {
            baseUrl: 'http://127.0.0.1:11434',
            status: 'ok',
            models: ['llama3.2:3b'],
            error: null,
          },
          docker: {
            status: 'not_checked',
            note: 'Docker is optional for the solo Windows MVP and is not probed by this read-only route.',
          },
          verification: [{ id: 'verify', label: 'Full local verification', command: 'npm run verify' }],
          nextActions: ['Run the first local workflow recipe from the Recipes tab.'],
        }),
      });
    });
    await page.route('**/api/admin/cockpit/workflow-recipes', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          panel: 'workflow-recipes',
          mode: 'read_only',
          summary: 'Curated local-first workflow recipes.',
          recipes: [
            {
              id: 'first-local-agent',
              title: 'First local agent loop',
              purpose: 'Run the smallest local-first path.',
              runtime: 'local_ollama',
              riskTier: 'local-default',
              requiredModels: ['llama3.2:3b'],
              commands: ['npm run dev', 'ollama pull llama3.2:3b', 'npm run verify'],
              artifacts: ['data/opengrimoire.sqlite', 'data/local-ai-activity.jsonl'],
              verification: ['npm run verify'],
              agentParity: {
                humanSurface: '/admin Local AI and Recipes tabs',
                toolSurface: 'planned_cli_or_mcp',
                note: 'Execution should later gain CLI/MCP parity before adding write buttons.',
              },
            },
          ],
        }),
      });
    });
    await page.route('**/api/admin/cockpit/local-ai/activity', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          panel: 'local-ai-activity-log',
          mode: 'jsonl_adapter',
          logPath: 'C:/Users/Dell/Documents/GitHub/OpenGrimoire/data/local-ai-activity.jsonl',
          summary: 'No local AI activity log exists yet.',
          skippedMalformedLines: 0,
          events: [
            {
              id: 'bootstrap',
              ts: '1970-01-01T00:00:00.000Z',
              kind: 'bootstrap',
              summary: 'Local AI cockpit initialized in read-only adapter mode.',
            },
          ],
        }),
      });
    });

    const seed = await request.post('/api/survey', {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify(minimalSurveyBody()),
    });
    expect(seed.ok(), await seed.text()).toBeTruthy();
    const created = (await seed.json()) as { surveyResponseId?: string };
    const surveyResponseId = created.surveyResponseId;
    expect(surveyResponseId && /^[0-9a-f-]{36}$/i.test(surveyResponseId)).toBeTruthy();
    if (!surveyResponseId) {
      throw new Error('Expected surveyResponseId from seed response');
    }

    const queueWait = page.waitForResponse(
      (res) =>
        res.url().includes('/api/admin/moderation-queue') &&
        res.request().method() === 'GET' &&
        res.ok()
    );

    await loginAsAdmin(page);

    const queueRes = await queueWait;
    expect(queueRes.status()).toBe(200);

    await expect(page.getByTestId('admin-moderation-shell')).toBeVisible();
    await expect(page.getByTestId('admin-moderation-column-queue')).toBeVisible();
    await expect(page.getByTestId('admin-moderation-column-detail')).toBeVisible();
    await expect(page.getByTestId('moderation-queue-status-filter')).toBeVisible();
    await expect(page.getByTestId('moderation-queue-age-sort')).toBeVisible();
    await expect(page.getByTestId('moderation-queue-preset-pending-newest')).toBeVisible();
    await expect(page.getByTestId('moderation-queue-preset-rejected-oldest')).toBeVisible();

    const row = page.getByTestId(`moderation-queue-item-${surveyResponseId}`);
    await expect(row).toBeVisible({ timeout: 20000 });
    await expect(row).toContainText('E2E moderation queue seed text.');

    await page.getByTestId('moderation-queue-status-filter').selectOption('pending');
    await expect(row).toBeVisible();
    await page.getByTestId('moderation-queue-status-filter').selectOption('approved');
    await expect(row).toBeHidden();
    await page.getByTestId('moderation-queue-status-filter').selectOption('all');
    await expect(row).toBeVisible();

    await page.getByTestId('moderation-queue-age-sort').selectOption('oldest_first');
    await expect(page.getByTestId('moderation-queue-age-sort')).toHaveValue('oldest_first');
    await page.getByTestId('moderation-queue-age-sort').selectOption('newest_first');
    await expect(page.getByTestId('moderation-queue-age-sort')).toHaveValue('newest_first');
    await page.getByTestId('moderation-queue-preset-rejected-oldest').click();
    await expect(page.getByTestId('moderation-queue-status-filter')).toHaveValue('rejected');
    await expect(page.getByTestId('moderation-queue-age-sort')).toHaveValue('oldest_first');
    await page.getByTestId('moderation-queue-preset-pending-newest').click();
    await expect(page.getByTestId('moderation-queue-status-filter')).toHaveValue('pending');
    await expect(page.getByTestId('moderation-queue-age-sort')).toHaveValue('newest_first');

    await row.click();
    await expect(page.getByTestId('admin-right-tabs')).toBeVisible();
    await expect(page.getByTestId('admin-right-tab-context')).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByTestId('moderation-detail-pane')).toBeVisible();
    await expect(page.getByTestId('moderation-detail-selected-id')).toHaveText(surveyResponseId);
    await expect(page.getByTestId('moderation-detail-approve')).toBeVisible();
    await expect(page.getByTestId('moderation-detail-reject')).toBeVisible();
    await expect(page.getByTestId('moderation-detail-notes')).toBeVisible();

    await page.getByTestId('admin-right-tab-backlog').click();
    await expect(page.getByTestId('admin-right-tab-backlog')).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByTestId('admin-right-tabpanel-backlog')).toBeVisible();
    await expect(page.getByTestId('admin-backlog-count')).toBeVisible();
    await expect(page.getByTestId('admin-backlog-age-11111111-1111-1111-1111-111111111111')).toBeVisible();
    await expect(page.getByTestId('admin-backlog-link')).toHaveAttribute('href', '/admin/clarification-queue');

    await page.getByTestId('admin-right-tab-activity').click();
    await expect(page.getByTestId('admin-right-tab-activity')).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByTestId('admin-right-tabpanel-activity')).toBeVisible();
    await expect(page.getByTestId('admin-activity-placeholder')).toBeVisible();
    await expect(page.getByTestId('admin-activity-runbook-link')).toBeVisible();

    await page.getByTestId('admin-right-tab-health').click();
    await expect(page.getByTestId('admin-right-tab-health')).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByTestId('admin-right-tabpanel-health')).toBeVisible();
    await expect(page.getByTestId('admin-health-panel')).toBeVisible();
    await expect(page.getByTestId('admin-health-capabilities-link')).toHaveAttribute(
      'href',
      '/api/capabilities'
    );
    await expect(page.getByTestId('admin-health-read-gate-command')).toContainText(
      'npm run verify:survey-read-prod'
    );

    await page.getByTestId('admin-right-tab-jobs').click();
    await expect(page.getByTestId('admin-right-tab-jobs')).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByTestId('admin-right-tabpanel-jobs')).toBeVisible();
    await expect(page.getByTestId('admin-jobs-panel')).toBeVisible();
    await expect(page.getByTestId('admin-jobs-link-e2e')).toBeVisible();
    await expect(page.getByTestId('admin-jobs-link-prod-smoke')).toBeVisible();
    await expect(page.getByTestId('admin-jobs-link-gha')).toBeVisible();

    await page.getByTestId('admin-right-tab-ops').click();
    await expect(page.getByTestId('admin-right-tab-ops')).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByTestId('admin-right-tabpanel-ops')).toBeVisible();
    await expect(page.getByTestId('admin-ops-panel')).toBeVisible();
    await expect(page.getByTestId('admin-ops-row-survey-read-gate-prod-smoke')).toBeVisible();
    await expect(page.getByTestId('admin-ops-runbook-link')).toHaveAttribute(
      'href',
      '/docs/runbooks/recurring-operations.md'
    );

    await page.getByTestId('admin-right-tab-local-ai').click();
    await expect(page.getByTestId('admin-right-tab-local-ai')).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByTestId('admin-right-tabpanel-local-ai')).toBeVisible();
    await expect(page.getByTestId('admin-local-ai-panel')).toBeVisible();
    await expect(page.getByTestId('admin-local-ai-db-path')).toContainText('opengrimoire.sqlite');
    await expect(page.getByTestId('admin-local-ai-ollama-status')).toContainText('ok');
    await expect(page.getByTestId('admin-local-ai-next-action')).toContainText('Recipes tab');

    await page.getByTestId('admin-right-tab-recipes').click();
    await expect(page.getByTestId('admin-right-tab-recipes')).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByTestId('admin-right-tabpanel-recipes')).toBeVisible();
    await expect(page.getByTestId('admin-recipes-panel')).toBeVisible();
    await expect(page.getByTestId('admin-recipe-first-local-agent')).toContainText('local_ollama');
    await expect(page.getByTestId('admin-recipe-runtime')).toContainText('local_ollama');

    await page.getByTestId('admin-right-tab-local-activity').click();
    await expect(page.getByTestId('admin-right-tab-local-activity')).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByTestId('admin-right-tabpanel-local-activity')).toBeVisible();
    await expect(page.getByTestId('admin-local-activity-panel')).toBeVisible();
    await expect(page.getByTestId('admin-local-activity-log-path')).toContainText('local-ai-activity.jsonl');

    await page.reload();
    await expect(page.getByTestId('admin-right-tab-local-activity')).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByTestId('moderation-queue-status-filter')).toHaveValue('pending');
    await expect(page.getByTestId('moderation-queue-age-sort')).toHaveValue('newest_first');
  });
});
