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
  if (!secret) return { ok: true };

  const key = request.headers.get('x-brain-map-key') ?? '';
  const headerOk = timingSafeEqualString(key, secret);
  const token = cookies().get(OPENGRIMOIRE_SESSION_COOKIE)?.value;
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
