import { mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { POST } from './route';
import { createHarnessProfile } from '@/lib/storage/repositories/harness-profiles';
import { getSurveyResponseById } from '@/lib/storage/repositories/survey';

process.env.OPENGRIMOIRE_DB_PATH = join(
  mkdtempSync(join(tmpdir(), 'opengrimoire-survey-route-')),
  'test.sqlite'
);

describe('POST /api/survey', () => {
  it('persists the validated harness profile selection on the survey response', async () => {
    const profile = createHarnessProfile({
      name: 'Handoff verifier',
      purpose: 'Keep selected profile linkage through Sync Session submit.',
      question_strategy: 'Ask focused handoff questions.',
      risk_posture: 'Conservative',
      preferred_clarification_modes: ['short_free_text'],
      output_style: 'Structured summary',
      is_default: false,
    });

    const response = await POST(
      new Request('http://localhost/api/survey', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane-route@example.com',
          isAnonymous: false,
          sessionType: 'profile',
          questionnaireVersion: 'v2',
          harnessProfileId: profile.id,
          answers: [
            { questionId: 'session_intent', answer: 'Ship a reliable handoff' },
            { questionId: 'session_context', answer: 'Route regression test' },
            { questionId: 'shaped_by', answer: 'mentor' },
            { questionId: 'working_style', answer: 'collaborative' },
            { questionId: 'constraints', answer: 'Keep profile id persisted' },
            { questionId: 'unique_quality', answer: 'Detail oriented' },
          ],
        }),
      })
    );

    const payload = await response.json();
    expect(response.status).toBe(200);
    expect(payload.harnessProfileId).toBe(profile.id);
    expect(getSurveyResponseById(payload.surveyResponseId)?.harness_profile_id).toBe(profile.id);
  });
});
