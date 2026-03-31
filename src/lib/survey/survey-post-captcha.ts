import 'server-only';

/** When true, POST /api/survey must include a valid Turnstile token (see TURNSTILE_SECRET_KEY). */
export function isSurveyPostCaptchaRequired(): boolean {
  if (process.env.SURVEY_POST_CAPTCHA_REQUIRED === 'true' || process.env.SURVEY_POST_CAPTCHA_REQUIRED === '1') {
    return true;
  }
  return process.env.NODE_ENV === 'production' && !!process.env.TURNSTILE_SECRET_KEY?.trim();
}

export async function verifyTurnstileToken(token: string | undefined): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) return false;
  const t = token?.trim();
  if (!t) return false;
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, response: t }),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
