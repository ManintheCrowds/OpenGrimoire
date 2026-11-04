import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  OPENGRIMOIRE_SESSION_COOKIE,
  verifyAdminSessionToken,
} from '@/lib/auth/session';
import { timingSafeEqualString } from '@/lib/crypto/timing-safe-compare';
import { logAccessDenied } from '@/lib/observability/access-denial-log';

type BrainMapAuthorizationResult =
  | { ok: true }
  | { ok: false; response: NextResponse };

export async function authorizeBrainMapRequest(
  request: Request,
): Promise<BrainMapAuthorizationResult> {
  const secret = process.env.BRAIN_MAP_SECRET;
  if (!secret) {
    // Fail closed in production: the graph can expose private vault/state paths, so a
    // deployment that forgot BRAIN_MAP_SECRET must not serve it anonymously.
    if (isProductionRuntime()) {
      logAccessDenied({ request, gate: 'brain_map', reason: 'misconfigured', status: 503 });
      return {
        ok: false,
        response: NextResponse.json(
          { error: 'Brain map is disabled: BRAIN_MAP_SECRET is not configured' },
          { status: 503 },
        ),
      };
    }
    return { ok: true };
  }

  const key = request.headers.get('x-brain-map-key') ?? '';
  const headerOk = timingSafeEqualString(key, secret);
  const token = (await cookies()).get(OPENGRIMOIRE_SESSION_COOKIE)?.value;
  const sessionOk = (await verifyAdminSessionToken(token)) !== null;
  if (headerOk || sessionOk) return { ok: true };

  logAccessDenied({
    request,
    gate: 'brain_map',
    reason: key.trim() ? 'invalid_secret' : 'session_required',
    status: 401,
  });
  return {
    ok: false,
    response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
  };
}

/** True for `next start` / production builds. Dev and test runs keep the open local default. */
export function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === 'production';
}
