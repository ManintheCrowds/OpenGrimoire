import { randomUUID } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { getSqlite } from '@/db/client';
import { createHarnessProfile } from '@/lib/storage/repositories/harness-profiles';
import { getSurveyResponseById } from '@/lib/storage/repositories/survey';
import { POST } from './route';

const validAnswers = [
  { questionId: 'session_intent', answer: 'Ship the next operator handoff' },
  { questionId: 'session_context', answer: 'Local-first OpenGrimoire workflow' },
  { questionId: 'shaped_by', answer: 'mentor' },
  { questionId: 'working_style', answer: 'collaborative' },
  { questionId: 'constraints', answer: 'No production secrets' },
  { questionId: 'unique_quality', answer: 'Systems-oriented debugging' },
];

describe('POST /api/survey', () => {
  let tempDir: string;

  beforeAll(() => {
    tempDir = mkdtempSync(path.join(tmpdir(), 'opengrimoire-survey-route-'));
    process.env.OPENGRIMOIRE_DB_PATH = path.join(tempDir, 'opengrimoire.sqlite');
    delete process.env.SURVEY_POST_REQUIRE_TOKEN;
    delete process.env.SURVEY_POST_CAPTCHA;
  });

  afterAll(() => {
    getSqlite().close();
    rmSync(tempDir, { recursive: true, force: true });
    delete process.env.OPENGRIMOIRE_DB_PATH;
  });

  it('persists the validated harness profile selection', async () => {
    const profile = createHarnessProfile({
      id: randomUUID(),
      name: 'Route regression verifier',
      purpose: 'Verify selected profile survives survey submission.',
      question_strategy: 'Ask focused questions.',
      risk_posture: 'Conservative.',
      preferred_clarification_modes: ['short_free_text'],
      output_style: 'Concise with explicit unknowns.',
      is_default: false,
    });

    const response = await POST(
      new Request('http://localhost/api/survey', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          firstName: 'Jane',
          lastName: 'Verifier',
          email: 'jane.verifier@example.com',
          isAnonymous: false,
          sessionType: 'profile',
          questionnaireVersion: 'v2',
          harnessProfileId: profile.id,
          answers: validAnswers,
        }),
      })
    );
    const body = (await response.json()) as {
      success: boolean;
      surveyResponseId: string;
      harnessProfileId: string | null;
    };

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.harnessProfileId).toBe(profile.id);
    expect(getSurveyResponseById(body.surveyResponseId)?.harness_profile_id).toBe(profile.id);
  });
});
