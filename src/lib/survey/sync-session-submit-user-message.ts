/**
 * User-facing strings for Sync Session POST /api/survey failures (operator-intake).
 */

export type SurveySubmitErrorPayload = {
  success?: boolean;
  message?: string;
  error?: string;
  detail?: string;
  issues?: unknown;
};

function parseRetryAfterSeconds(raw: string | null | undefined): number | null {
  if (raw == null || raw === '') return null;
  const n = Number.parseInt(String(raw).trim(), 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * Maps HTTP status + JSON body from POST /api/survey (or middleware) to a single alert string.
 */
export function syncSessionSubmitUserMessage(
  status: number,
  payload: SurveySubmitErrorPayload,
  opts?: { retryAfterSeconds?: string | null }
): string {
  if (status === 409 && payload.message?.trim()) {
    return payload.message.trim();
  }

  if (status === 400 && payload.error === 'Validation failed') {
    return 'Please check your answers and try again.';
  }

  if (status === 429) {
    const detail = payload.detail?.trim();
    const retry = parseRetryAfterSeconds(opts?.retryAfterSeconds ?? null);
    const lead =
      "You're sending submissions too quickly. " +
      (detail ? `${detail} ` : 'Please slow down. ');
    const tail = retry
      ? `You can try again in about ${retry} seconds.`
      : 'Please wait a minute and try again.';
    return (lead + tail).trim();
  }

  if (status === 401) {
    const detail = payload.detail?.trim();
    const hint = detail ? ` ${detail}` : '';
    return (
      "We couldn't verify this submission (session token missing or expired)." +
      hint +
      ' Reload this page and try again.'
    ).trim();
  }

  if (status === 503) {
    const parts = [payload.error, payload.detail]
      .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
      .map((s) => s.trim());
    if (parts.length > 0) {
      return (
        'Sync Session intake is not configured yet. ' +
        parts.join(' ') +
        ' Operator check: token, captcha, and SQLite environment settings.'
      ).trim();
    }
    return 'Sync Session intake is temporarily unavailable. Operator check: token, captcha, and SQLite environment settings.';
  }

  if (status >= 500) {
    return 'Sync Session intake hit a server error. Your draft is still in this browser; wait a moment, then try again or ask an operator to check the intake logs.';
  }

  if (payload.message?.trim()) {
    return payload.message.trim();
  }

  return 'Sync Session intake could not save this submission. Your draft is still in this browser; try again or ask an operator to check the intake logs.';
}

export const SYNC_SESSION_NETWORK_ERROR_MESSAGE =
  "We couldn't reach the server. Check your connection and try again.";

export function isLikelyNetworkFetchError(err: unknown): boolean {
  if (err instanceof TypeError) {
    return true;
  }
  if (err instanceof Error) {
    return /failed to fetch|networkerror|load failed/i.test(err.message);
  }
  return false;
}
