import 'server-only';

import { NextResponse } from 'next/server';
import { requireOpenGrimoireAdminRoute } from '@/lib/alignment-context/admin-auth';
import { timingSafeEqualString } from '@/lib/crypto/timing-safe-compare';
import { logAccessDenied } from '@/lib/observability/access-denial-log';

/** Header for machine access to operator-probe admin list/detail/delete when `OPERATOR_PROBE_ADMIN_SECRET` is set. */
export const OPERATOR_PROBE_ADMIN_HEADER = 'x-operator-probe-admin-key';

export type OperatorProbeAdminAuthResult =
  | { ok: true; via: 'session' | 'admin_secret' }
  | { ok: false; response: NextResponse };

/**
 * `GET`/`DELETE` `/api/admin/operator-probes`… — valid operator session, or matching
 * `OPERATOR_PROBE_ADMIN_SECRET` + {@link OPERATOR_PROBE_ADMIN_HEADER} when the secret is set.
 * Never accepts `x-alignment-context-key`. When the admin secret is unset, session only (unchanged).
 */
export async function requireOperatorProbeAdminRoute(request: Request): Promise<OperatorProbeAdminAuthResult> {
  const admin = await requireOpenGrimoireAdminRoute();
  if (admin.ok) {
    return { ok: true, via: 'session' };
  }

  const secretRaw = process.env.OPERATOR_PROBE_ADMIN_SECRET;
  const secret = typeof secretRaw === 'string' ? secretRaw.trim() : '';
  if (!secret) {
    logAccessDenied({
      request,
      gate: 'operator_observability_read',
      reason: 'session_required',
      status: 401,
    });
    return {
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  const key = request.headers.get(OPERATOR_PROBE_ADMIN_HEADER) ?? '';
  if (!timingSafeEqualString(key, secret)) {
    logAccessDenied({
      request,
      gate: 'operator_observability_admin',
      reason: key.trim() ? 'invalid_secret' : 'missing_header',
      status: 401,
    });
    return {
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  return { ok: true, via: 'admin_secret' };
}
