import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { OPENGRIMOIRE_SESSION_COOKIE, verifyAdminSessionToken } from '@/lib/auth/session';

export async function GET() {
  const token = cookies().get(OPENGRIMOIRE_SESSION_COOKIE)?.value;
  const session = await verifyAdminSessionToken(token);
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({
    authenticated: true,
    user: { id: session.sub },
  });
}
