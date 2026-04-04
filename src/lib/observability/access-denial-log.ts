import 'server-only';

/** Auth gate emitting structured access_denied logs (no PII, no secrets). */
export type AccessDenialGate =
  | 'alignment_context'
  | 'clarification_queue'
  | 'brain_map'
  | 'survey_read';

export type AccessDenialReason =
  | 'missing_header'
  | 'invalid_secret'
  | 'misconfigured'
  | 'session_required';

/**
 * One JSON line per denial for operators (`grep access_denied`). Never log headers, keys, or bodies.
 */
export function logAccessDenied(params: {
  request: Request;
  gate: AccessDenialGate;
  reason: AccessDenialReason;
  status: number;
}): void {
  let route = '';
  try {
    route = new URL(params.request.url).pathname;
  } catch {
    /* ignore */
  }
  console.info(
    JSON.stringify({
      event: 'access_denied',
      gate: params.gate,
      route,
      reason: params.reason,
      status: params.status,
    })
  );
}
