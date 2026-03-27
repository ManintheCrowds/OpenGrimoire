import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  OPENGRIMOIRE_SESSION_COOKIE,
  verifyAdminSessionToken,
} from '@/lib/auth/session';

export type AdminSessionUser = { id: string };

export type RequireAdminResult =
  | { ok: true; user: AdminSessionUser }
  | { ok: false; response: NextResponse };

/**
 * Require a valid OpenGrimoire operator session (HTTP-only cookie, signed JWT).
 */
export async function requireOpenGrimoireAdminRoute(): Promise<RequireAdminResult> {
  const token = cookies().get(OPENGRIMOIRE_SESSION_COOKIE)?.value;
  const session = await verifyAdminSessionToken(token);

  if (!session) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  return { ok: true, user: { id: session.sub } };
}
