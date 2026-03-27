import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

export const OPENGRIMOIRE_SESSION_COOKIE = 'opengrimoire_session';
export const OPENGRIMOIRE_ADMIN_ID = 'opengrimoire-admin';

function getSecret(): Uint8Array {
  const s = process.env.OPENGRIMOIRE_SESSION_SECRET;
  if (!s && process.env.NODE_ENV === 'production') {
    throw new Error('OPENGRIMOIRE_SESSION_SECRET is required in production');
  }
  return new TextEncoder().encode(s ?? 'dev-opengrimoire-session-secret-change-me');
}

export async function signAdminSession(): Promise<string> {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(OPENGRIMOIRE_ADMIN_ID)
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret());
}

export async function verifyAdminSessionToken(
  token: string | undefined
): Promise<{ sub: string } | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const sub = payload.sub;
    if (sub !== OPENGRIMOIRE_ADMIN_ID) return null;
    return { sub };
  } catch {
    return null;
  }
}

export function verifyOperatorPassword(plain: string): boolean {
  const hash = process.env.OPENGRIMOIRE_ADMIN_PASSWORD_HASH;
  const plainEnv = process.env.OPENGRIMOIRE_ADMIN_PASSWORD;
  if (hash) {
    return bcrypt.compareSync(plain, hash);
  }
  if (plainEnv) {
    return plain === plainEnv;
  }
  return false;
}
