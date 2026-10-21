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

async function loadSurveyModules(dbPath: string) {
  vi.resetModules();
  process.env.OPENGRIMOIRE_DB_PATH = dbPath;
  const [{ getSqlite }, survey] = await Promise.all([
    import('@/db/client'),
    import('./survey'),
  ]);
  return { getSqlite, ...survey };
}

describe('createSurveyResponse', () => {
  it('rolls back the parent response when a category insert fails mid-write', async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'opengrimoire-survey-'));
    const dbPath = path.join(tempDir, 'opengrimoire.sqlite');
    const { getSqlite, createAttendee, createSurveyResponse } = await loadSurveyModules(dbPath);

    const sqlite = getSqlite();
    const attendee = createAttendee({
      first_name: 'Ada',
      last_name: 'Lovelace',
      is_anonymous: true,
    });

    // Fail on the second category insert so a non-transactional write would leave
    // survey_responses (and possibly one category) committed while the API returns 500.
    sqlite.exec(`
      CREATE TRIGGER fail_second_category
      BEFORE INSERT ON survey_response_intent_categories
      WHEN (SELECT COUNT(*) FROM survey_response_intent_categories) >= 1
      BEGIN
        SELECT RAISE(ABORT, 'forced category failure');
      END;
    `);

    expect(() =>
      createSurveyResponse({
        attendee_id: attendee.id,
        session_type: 'profile',
        questionnaire_version: 'v2',
        unique_quality: 'Ship OG-HV',
        categories: [
          { category: 'signals', content: 'Ship OG-HV' },
          { category: 'needs', content: 'Local dev only' },
          { category: 'constraints', content: 'No prod secrets' },
        ],
      })
    ).toThrow(/forced category failure/);

    const responseCount = sqlite.prepare('SELECT COUNT(*) AS n FROM survey_responses').get() as {
      n: number;
    };
    const categoryCount = sqlite
      .prepare('SELECT COUNT(*) AS n FROM survey_response_intent_categories')
      .get() as { n: number };

    expect(responseCount.n).toBe(0);
    expect(categoryCount.n).toBe(0);

    sqlite.close();
  });

  it('persists response and categories together on success', async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'opengrimoire-survey-ok-'));
    const dbPath = path.join(tempDir, 'opengrimoire.sqlite');
    const { getSqlite, createAttendee, createSurveyResponse } = await loadSurveyModules(dbPath);

    const sqlite = getSqlite();
    const attendee = createAttendee({
      first_name: 'Grace',
      last_name: 'Hopper',
      is_anonymous: true,
    });

    const response = createSurveyResponse({
      attendee_id: attendee.id,
      session_type: 'profile',
      questionnaire_version: 'v2',
      unique_quality: 'Clarify agent context',
      categories: [
        { category: 'signals', content: 'Clarify agent context' },
        { category: 'needs', content: 'Local SQLite' },
        { category: 'constraints', content: 'No secrets in prompts' },
      ],
    });

    const categories = sqlite
      .prepare(
        `SELECT category, content FROM survey_response_intent_categories
         WHERE response_id = ? ORDER BY category`
      )
      .all(response.id) as { category: string; content: string }[];

    expect(categories).toEqual([
      { category: 'constraints', content: 'No secrets in prompts' },
      { category: 'needs', content: 'Local SQLite' },
      { category: 'signals', content: 'Clarify agent context' },
    ]);

    sqlite.close();
  });
});

describe('updateModerationStatus', () => {
  it('preserves existing notes when a later status PATCH omits notes', async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'opengrimoire-moderation-notes-'));
    const dbPath = path.join(tempDir, 'opengrimoire.sqlite');
    const { getSqlite, createAttendee, createSurveyResponse, updateModerationStatus } =
      await loadSurveyModules(dbPath);

    const sqlite = getSqlite();
    const attendee = createAttendee({
      first_name: 'Mod',
      last_name: 'Operator',
      is_anonymous: true,
    });
    const response = createSurveyResponse({
      attendee_id: attendee.id,
      unique_quality: 'Needs a second look',
    });

    updateModerationStatus(response.id, {
      status: 'pending',
      moderator_id: 'mod-1',
      notes: 'investigate X',
    });

    const afterOmit = updateModerationStatus(response.id, {
      status: 'approved',
      moderator_id: 'mod-1',
    });
    expect(afterOmit.notes).toBe('investigate X');

    const row = sqlite
      .prepare(`SELECT status, notes FROM moderation WHERE response_id = ?`)
      .get(response.id) as { status: string; notes: string | null };
    expect(row.status).toBe('approved');
    expect(row.notes).toBe('investigate X');

    const cleared = updateModerationStatus(response.id, {
      status: 'rejected',
      moderator_id: 'mod-1',
      notes: '',
    });
    expect(cleared.notes).toBe('');

    sqlite.close();
  });

  it('rolls back moderation upsert when parent status update fails', async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'opengrimoire-moderation-tx-'));
    const dbPath = path.join(tempDir, 'opengrimoire.sqlite');
    const { getSqlite, createAttendee, createSurveyResponse, updateModerationStatus } =
      await loadSurveyModules(dbPath);

    const sqlite = getSqlite();
    const attendee = createAttendee({
      first_name: 'Tx',
      last_name: 'Guard',
      is_anonymous: true,
    });
    const response = createSurveyResponse({
      attendee_id: attendee.id,
      unique_quality: 'Keep pending if parent fails',
    });

    sqlite.exec(`
      CREATE TRIGGER fail_parent_status_update
      BEFORE UPDATE OF status ON survey_responses
      BEGIN
        SELECT RAISE(ABORT, 'forced parent status failure');
      END;
    `);

    expect(() =>
      updateModerationStatus(response.id, {
        status: 'approved',
        moderator_id: 'mod-1',
        notes: 'should not stick',
      })
    ).toThrow(/forced parent status failure/);

    const modCount = sqlite.prepare('SELECT COUNT(*) AS n FROM moderation').get() as { n: number };
    const parent = sqlite
      .prepare(`SELECT status, moderated_at FROM survey_responses WHERE id = ?`)
      .get(response.id) as { status: string; moderated_at: string | null };

    expect(modCount.n).toBe(0);
    expect(parent.status).toBe('pending');
    expect(parent.moderated_at).toBeNull();

    sqlite.close();
  });
});
