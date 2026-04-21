import 'server-only';

import { NextResponse } from 'next/server';
import { requireOpenGrimoireAdminRoute } from '@/lib/alignment-context/admin-auth';
import { timingSafeEqualString } from '@/lib/crypto/timing-safe-compare';
import { logAccessDenied } from '@/lib/observability/access-denial-log';

export const OPERATOR_PROBE_INGEST_HEADER = 'x-operator-probe-ingest-key';

/**
 * Ingest auth posture (replay / tamper): shared header secret + timing-safe compare + middleware rate limit.
 * Product decision and future HMAC/signed-body options: ARCHITECTURE_REST_CONTRACT.md § Operator probe ingest authentication (product posture).
 */

export type OperatorProbeIngestGateResult =
  | { ok: true; via: 'session' | 'ingest_secret' }
  | { ok: false; response: NextResponse };

/**
 * POST /api/operator-probes/ingest: valid operator session **or** matching ingest secret.
 * Never accept unauthenticated ingest.
 */
export async function requireOperatorProbeIngestOrAdminSession(
  request: Request
): Promise<OperatorProbeIngestGateResult> {
  const admin = await requireOpenGrimoireAdminRoute();
  if (admin.ok) {
    return { ok: true, via: 'session' };
  }

  const secretRaw = process.env.OPERATOR_PROBE_INGEST_SECRET;
  const secret = typeof secretRaw === 'string' ? secretRaw.trim() : '';
  if (secret) {
    const key = request.headers.get(OPERATOR_PROBE_INGEST_HEADER) ?? '';
    if (!timingSafeEqualString(key, secret)) {
      logAccessDenied({
        request,
        gate: 'operator_observability_ingest',
        reason: key.trim() ? 'invalid_secret' : 'missing_header',
        status: 401,
      });
      return {
        ok: false,
        response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      };
    }
    return { ok: true, via: 'ingest_secret' };
  }

  // No OPERATOR_PROBE_INGEST_SECRET: unauthenticated callers get 503. Intentionally omit
  // logAccessDenied here to avoid scanner-driven noise; 401 paths above still log denials.
  return {
    ok: false,
    response: NextResponse.json(
      {
        error: 'Misconfigured',
        detail:
          'Set OPERATOR_PROBE_INGEST_SECRET and send header x-operator-probe-ingest-key for runner ingest, or authenticate as operator for same-origin session POST.',
      },
      { status: 503 }
    ),
  };
}
