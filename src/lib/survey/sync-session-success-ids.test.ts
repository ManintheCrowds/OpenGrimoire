import { describe, expect, it } from 'vitest';
import { parseSyncSessionSuccessIds } from './sync-session-success-ids';

describe('parseSyncSessionSuccessIds', () => {
  const attendeeId = '11111111-1111-4111-8111-111111111111';
  const surveyResponseId = '22222222-2222-4222-8222-222222222222';
  const harnessProfileId = '33333333-3333-4333-8333-333333333333';

  it('returns IDs from a valid success payload', () => {
    expect(
      parseSyncSessionSuccessIds({
        success: true,
        attendeeId,
        surveyResponseId,
        harnessProfileId,
      })
    ).toEqual({ attendeeId, surveyResponseId, harnessProfileId });
  });

  it('allows null harnessProfileId', () => {
    expect(
      parseSyncSessionSuccessIds({
        attendeeId,
        surveyResponseId,
        harnessProfileId: null,
      })
    ).toEqual({ attendeeId, surveyResponseId, harnessProfileId: null });
  });

  it('returns null when attendeeId or surveyResponseId missing', () => {
    expect(parseSyncSessionSuccessIds({ attendeeId, surveyResponseId: 'bad' })).toBeNull();
    expect(parseSyncSessionSuccessIds({ surveyResponseId })).toBeNull();
    expect(parseSyncSessionSuccessIds(null)).toBeNull();
  });
});
