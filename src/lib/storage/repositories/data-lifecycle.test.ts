import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';

const ORIGINAL_DB_PATH = process.env.OPENGRIMOIRE_DB_PATH;

let tempDir: string | null = null;

vi.mock('server-only', () => ({}));

afterEach(() => {
  if (ORIGINAL_DB_PATH === undefined) {
    delete process.env.OPENGRIMOIRE_DB_PATH;
  } else {
    process.env.OPENGRIMOIRE_DB_PATH = ORIGINAL_DB_PATH;
  }
  if (tempDir) {
    fs.rmSync(tempDir, { recursive: true, force: true });
    tempDir = null;
  }
  vi.resetModules();
});

async function loadLifecycleModules(dbPath: string) {
  vi.resetModules();
  process.env.OPENGRIMOIRE_DB_PATH = dbPath;
  const [{ getSqlite }, { createAttendee, createSurveyResponse }, { exportManagedTable, pruneManagedTables }] =
    await Promise.all([
      import('@/db/client'),
      import('./survey'),
      import('./data-lifecycle'),
    ]);
  return { getSqlite, createAttendee, createSurveyResponse, exportManagedTable, pruneManagedTables };
}

describe('exportManagedTable(survey_responses)', () => {
  it('includes Sync Session v2 intent categories that would be lost on prune', async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'opengrimoire-export-categories-'));
    const dbPath = path.join(tempDir, 'opengrimoire.sqlite');
    const {
      getSqlite,
      createAttendee,
      createSurveyResponse,
      exportManagedTable,
      pruneManagedTables,
    } = await loadLifecycleModules(dbPath);

    const sqlite = getSqlite();
    const attendee = createAttendee({
      first_name: 'Ada',
      last_name: 'Lovelace',
      is_anonymous: true,
    });

    const response = createSurveyResponse({
      attendee_id: attendee.id,
      session_type: 'profile',
      questionnaire_version: 'v2',
      unique_quality: 'Ship carefully',
      // Stamped far in the past so retention prune removes the parent row.
      categories: [
        { category: 'signals', content: 'Ship OG-HV' },
        { category: 'needs', content: 'Local dev only' },
        { category: 'constraints', content: 'No prod secrets' },
      ],
    });

    sqlite
      .prepare(`UPDATE survey_responses SET created_at = ?, updated_at = ? WHERE id = ?`)
      .run('2020-01-01T00:00:00.000Z', '2020-01-01T00:00:00.000Z', response.id);

    const exported = exportManagedTable('survey_responses') as Array<{
      id: string;
      intent_categories: Array<{ category: string; content: string }>;
    }>;

    expect(exported).toHaveLength(1);
    expect(exported[0]?.id).toBe(response.id);
    expect(exported[0]?.intent_categories).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ category: 'signals', content: 'Ship OG-HV' }),
        expect.objectContaining({ category: 'needs', content: 'Local dev only' }),
        expect.objectContaining({ category: 'constraints', content: 'No prod secrets' }),
      ])
    );
    expect(exported[0]?.intent_categories).toHaveLength(3);

    // Confirm the archival hazard: prune CASCADE-deletes categories with the response.
    pruneManagedTables({
      survey_responses: 30,
      clarification_requests: 180,
      study_reviews: 365,
    });
    const categoryCount = sqlite
      .prepare(`SELECT COUNT(*) AS n FROM survey_response_intent_categories`)
      .get() as { n: number };
    expect(categoryCount.n).toBe(0);

    sqlite.close();
  });

  it('returns an empty intent_categories array when a response has none', async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'opengrimoire-export-empty-cats-'));
    const dbPath = path.join(tempDir, 'opengrimoire.sqlite');
    const { getSqlite, createAttendee, createSurveyResponse, exportManagedTable } =
      await loadLifecycleModules(dbPath);

    const sqlite = getSqlite();
    const attendee = createAttendee({
      first_name: 'Grace',
      last_name: 'Hopper',
      is_anonymous: true,
    });
    const response = createSurveyResponse({
      attendee_id: attendee.id,
      unique_quality: 'v1-only',
    });

    const exported = exportManagedTable('survey_responses') as Array<{
      id: string;
      intent_categories: unknown[];
    }>;
    const row = exported.find((item) => item.id === response.id);
    expect(row?.intent_categories).toEqual([]);

    sqlite.close();
  });
});
