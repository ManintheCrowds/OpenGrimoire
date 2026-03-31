import 'server-only';
import { SignJWT, jwtVerify } from 'jose';

const PURPOSE = 'survey_post';

function getSecret(): Uint8Array {
  const s = process.env.SURVEY_POST_BOOTSTRAP_SECRET?.trim();
  if (!s) {
    throw new Error('SURVEY_POST_BOOTSTRAP_SECRET is required when survey post token enforcement is enabled');
  }
  return new TextEncoder().encode(s);
}

export async function signSurveyPostBootstrapToken(): Promise<string> {
  return new SignJWT({ purpose: PURPOSE })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(getSecret());
}

export async function verifySurveyPostBootstrapToken(token: string | null): Promise<boolean> {
  if (!token?.trim()) return false;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload.purpose === PURPOSE;
  } catch {
    return false;
  }
}

export function isSurveyPostTokenRequired(): boolean {
  const v = process.env.SURVEY_POST_REQUIRE_TOKEN?.trim();
  return v === '1' || v === 'true';
}
