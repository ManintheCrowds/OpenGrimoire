/**
 * PURPOSE: Parse and type Sync Session POST /api/survey success handoff IDs.
 * DEPENDENCIES: SYNC_SESSION_HANDOFF §6–§7 field names
 * MODIFICATION NOTES: Fail closed when attendeeId or surveyResponseId missing/invalid.
 */

export type SyncSessionSuccessIds = {
  attendeeId: string;
  surveyResponseId: string;
  harnessProfileId: string | null;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function asUuid(value: unknown): string | null {
  return typeof value === 'string' && UUID_RE.test(value) ? value : null;
}

/** Extract handoff IDs from a successful survey POST JSON body. Returns null if incomplete. */
export function parseSyncSessionSuccessIds(payload: unknown): SyncSessionSuccessIds | null {
  if (!payload || typeof payload !== 'object') return null;
  const body = payload as Record<string, unknown>;
  const attendeeId = asUuid(body.attendeeId);
  const surveyResponseId = asUuid(body.surveyResponseId);
  if (!attendeeId || !surveyResponseId) return null;
  const rawHarness = body.harnessProfileId;
  const harnessProfileId =
    rawHarness == null || rawHarness === ''
      ? null
      : typeof rawHarness === 'string'
        ? rawHarness
        : null;
  return { attendeeId, surveyResponseId, harnessProfileId };
}
