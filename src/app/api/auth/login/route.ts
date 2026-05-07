import { NextResponse } from 'next/server';
import {
  OPENGRIMOIRE_SESSION_COOKIE,
  signAdminSession,
  verifyOperatorPassword,
} from '@/lib/auth/session';
import { appendSecurityAuditEvent } from '@/lib/security/audit-log';

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const password =
    typeof json === 'object' && json !== null && 'password' in json
      ? String((json as { password?: unknown }).password ?? '')
      : '';

  if (!password) {
    return NextResponse.json({ error: 'password is required' }, { status: 400 });
  }

  if (!verifyOperatorPassword(password)) {
    appendSecurityAuditEvent({ ts: new Date().toISOString(), event: 'auth_failed', route: '/api/auth/login', method: 'POST', status: 401, reason: 'invalid_credentials' });
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const token = await signAdminSession();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(OPENGRIMOIRE_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
