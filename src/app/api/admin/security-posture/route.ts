import { NextResponse } from 'next/server';
import { requireOpenGrimoireAdminRoute } from '@/lib/alignment-context/admin-auth';

export async function GET() {
  const auth = await requireOpenGrimoireAdminRoute();
  if (!auth.ok) return auth.response;

  const hasAlignmentSecret = !!process.env.ALIGNMENT_CONTEXT_API_SECRET?.trim();
  const insecureLocalAlignmentMode =
    process.env.NODE_ENV !== 'production' &&
    process.env.ALIGNMENT_CONTEXT_ALLOW_INSECURE_LOCAL === 'true' &&
    !hasAlignmentSecret;

  return NextResponse.json({
    requiredEnv: {
      OPENGRIMOIRE_SESSION_SECRET: !!process.env.OPENGRIMOIRE_SESSION_SECRET?.trim(),
      OPENGRIMOIRE_ADMIN_PASSWORD_OR_HASH:
        !!process.env.OPENGRIMOIRE_ADMIN_PASSWORD?.trim() || !!process.env.OPENGRIMOIRE_ADMIN_PASSWORD_HASH?.trim(),
      ALIGNMENT_CONTEXT_API_SECRET: hasAlignmentSecret,
    },
    toggles: {
      insecureLocalAlignmentMode,
      surveyPostRequireToken: process.env.SURVEY_POST_REQUIRE_TOKEN === 'true',
      surveyCaptchaRequired: process.env.SURVEY_POST_REQUIRE_TURNSTILE === 'true',
    },
  });
}
