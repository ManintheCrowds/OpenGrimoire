import 'server-only';

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  OPENGRIMOIRE_SESSION_COOKIE,
  verifyAdminSessionToken,
} from '@/lib/auth/session';
import { timingSafeEqualString } from '@/lib/crypto/timing-safe-compare';
import { logAccessDenied } from '@/lib/observability/access-denial-log';

export type SurveyReadGateResult =
  | { ok: true }
  | { ok: false; response: NextResponse };

/**
 * Production survey read APIs (visualization + approved quotes) may expose PII.
 * In production, deny unless explicitly opened or caller presents auth.
 */
export async function checkSurveyReadGate(request: Request): Promise<SurveyReadGateResult> {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    return { ok: true };
  }

  if (process.env.SURVEY_VISUALIZATION_ALLOW_PUBLIC === 'true') {
    return { ok: true };
  }

  const token = cookies().get(OPENGRIMOIRE_SESSION_COOKIE)?.value;
  const session = await verifyAdminSessionToken(token);
  if (session) {
    return { ok: true };
  }

  const alignmentAllowsSurvey =
    (process.env.ALIGNMENT_CONTEXT_KEY_ALLOWS_SURVEY_READ ?? '').trim().toLowerCase() === 'true';

  const alignmentSecret = (process.env.ALIGNMENT_CONTEXT_API_SECRET ?? '').trim();
  if (alignmentAllowsSurvey && alignmentSecret) {
    const key = request.headers.get('x-alignment-context-key') ?? '';
    if (timingSafeEqualString(key, alignmentSecret)) {
      return { ok: true };
    }
  }

  const vizSecret = (process.env.SURVEY_VISUALIZATION_API_SECRET ?? '').trim();
  if (vizSecret) {
    const key = request.headers.get('x-survey-visualization-key') ?? '';
    if (timingSafeEqualString(key, vizSecret)) {
      return { ok: true };
    }
  }

  logAccessDenied({
    request,
    gate: 'survey_read',
    reason: 'session_required',
    status: 401,
  });
  return {
    ok: false,
    response: NextResponse.json(
      {
        error: 'Unauthorized',
        detail:
          'In production, survey read endpoints require an admin session cookie, ' +
          'x-survey-visualization-key (when SURVEY_VISUALIZATION_API_SECRET is set), ' +
          'or set SURVEY_VISUALIZATION_ALLOW_PUBLIC=true for demo-only deployments. ' +
          'Optional legacy: set ALIGNMENT_CONTEXT_KEY_ALLOWS_SURVEY_READ=true to also accept x-alignment-context-key. ' +
          'See docs/AGENT_INTEGRATION.md.',
      },
      { status: 401 }
    ),
  };
}
