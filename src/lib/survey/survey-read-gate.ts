import 'server-only';

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  OPENGRIMOIRE_SESSION_COOKIE,
  verifyAdminSessionToken,
} from '@/lib/auth/session';
import { logAccessDenied } from '@/lib/observability/access-denial-log';
import { decideSurveyReadAccess } from '@/lib/survey/survey-read-gate-logic';
import { SURVEY_READ_GATE_UNAUTHORIZED_JSON_DETAIL } from '@/lib/survey/survey-read-gate-public-messages';

export type SurveyReadGateResult =
  | { ok: true }
  | { ok: false; response: NextResponse };

/**
 * Production survey read APIs (visualization + approved quotes) may expose PII.
 * In production, deny unless explicitly opened or caller presents auth.
 *
 * **NODE_ENV foot-gun:** When `NODE_ENV` is not **`production`**, this function **short-circuits**
 * and always allows reads (same as local dev). There is **no** separate “staging gate” flag.
 * Any host with **real survey PII** that should enforce the read gate **must** run the app with
 * **`NODE_ENV=production`** (and configure secrets / `SURVEY_VISUALIZATION_*` per docs). See
 * [DEPLOYMENT.md](../../../DEPLOYMENT.md) and [admin/SURVEY_READ_GATING_RUNBOOK.md](../../../docs/admin/SURVEY_READ_GATING_RUNBOOK.md).
 */
export async function checkSurveyReadGate(request: Request): Promise<SurveyReadGateResult> {
  if (process.env.NODE_ENV !== 'production') {
    return { ok: true };
  }

  const token = cookies().get(OPENGRIMOIRE_SESSION_COOKIE)?.value;
  const session = await verifyAdminSessionToken(token);

  const decision = decideSurveyReadAccess({
    nodeEnv: process.env.NODE_ENV ?? 'development',
    surveyVisualizationAllowPublic: process.env.SURVEY_VISUALIZATION_ALLOW_PUBLIC,
    hasAdminSession: Boolean(session),
    alignmentContextKeyAllowsSurveyRead: process.env.ALIGNMENT_CONTEXT_KEY_ALLOWS_SURVEY_READ,
    alignmentApiSecret: process.env.ALIGNMENT_CONTEXT_API_SECRET ?? '',
    alignmentContextKeyHeader: request.headers.get('x-alignment-context-key') ?? '',
    surveyVizSecret: process.env.SURVEY_VISUALIZATION_API_SECRET ?? '',
    surveyVizKeyHeader: request.headers.get('x-survey-visualization-key') ?? '',
  });

  if (decision.allow) {
    return { ok: true };
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
        detail: SURVEY_READ_GATE_UNAUTHORIZED_JSON_DETAIL,
      },
      { status: 401 }
    ),
  };
}
