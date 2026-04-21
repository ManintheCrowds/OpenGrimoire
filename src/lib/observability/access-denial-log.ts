import 'server-only';

import { getClientIpFromRequest } from '@/lib/rate-limit/get-client-ip';

/** Auth gate emitting structured access_denied logs (no PII, no secrets). */
export type AccessDenialGate =
  | 'alignment_context'
  | 'clarification_queue'
  | 'brain_map'
  | 'survey_read'
  | 'operator_observability_ingest'
  | 'operator_observability_read'
  | 'operator_observability_admin';

export type AccessDenialReason =
  | 'missing_header'
  | 'invalid_secret'
  | 'misconfigured'
  | 'session_required';

const invalidSecretCooldown = new Map<string, number>();

function parseProbability(): number {
  const raw = process.env.ACCESS_DENIED_INVALID_SECRET_LOG_PROBABILITY;
  if (raw === undefined || raw === '') return 1;
  const n = parseFloat(raw);
  if (!Number.isFinite(n)) return 1;
  return Math.min(1, Math.max(0, n));
}

function parseCooldownMs(): number {
  const raw = process.env.ACCESS_DENIED_INVALID_SECRET_PER_IP_COOLDOWN_MS;
  if (raw === undefined || raw === '') return 0;
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}

function shouldEmitInvalidSecret401(params: {
  request: Request;
  gate: AccessDenialGate;
  route: string;
}): boolean {
  const cooldownMs = parseCooldownMs();
  if (cooldownMs > 0) {
    const ip = getClientIpFromRequest(params.request);
    const key = `${params.gate}|${params.route}|${ip}`;
    const now = Date.now();
    const last = invalidSecretCooldown.get(key);
    if (last !== undefined && now - last < cooldownMs) {
      return false;
    }
    invalidSecretCooldown.set(key, now);
    if (invalidSecretCooldown.size > 3000) {
      const staleBefore = now - Math.max(cooldownMs * 3, 60_000);
      for (const [k, t] of Array.from(invalidSecretCooldown.entries())) {
        if (t < staleBefore) {
          invalidSecretCooldown.delete(k);
          if (invalidSecretCooldown.size <= 2000) break;
        }
      }
    }
  }

  const p = parseProbability();
  if (p >= 1) return true;
  if (p <= 0) return false;
  return Math.random() < p;
}

/**
 * One JSON line per denial for operators (`grep access_denied`). Never log headers, keys, or bodies.
 *
 * **401 + `invalid_secret`:** Optional noise control (OG-OH-09): set
 * `ACCESS_DENIED_INVALID_SECRET_LOG_PROBABILITY` (0–1, default 1) and/or
 * `ACCESS_DENIED_INVALID_SECRET_PER_IP_COOLDOWN_MS` (per gate+route+client IP, in-process only).
 * Misconfigured **503** paths intentionally omit `access_denied` where documented (e.g. probe ingest).
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

  if (
    params.reason === 'invalid_secret' &&
    params.status === 401 &&
    !shouldEmitInvalidSecret401({ request: params.request, gate: params.gate, route })
  ) {
    return;
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
