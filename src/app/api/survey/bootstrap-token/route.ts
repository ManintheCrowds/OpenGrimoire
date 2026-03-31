import { NextResponse } from 'next/server';
import {
  isSurveyPostTokenRequired,
  signSurveyPostBootstrapToken,
} from '@/lib/survey/survey-post-bootstrap';

/**
 * Issues a short-lived JWT for POST /api/survey when SURVEY_POST_REQUIRE_TOKEN is enabled.
 * Same-origin Sync Session UI fetches this and sends the token as x-survey-post-token.
 */
export async function GET() {
  if (!isSurveyPostTokenRequired()) {
    return NextResponse.json({ token: null, expiresIn: null });
  }
  if (!process.env.SURVEY_POST_BOOTSTRAP_SECRET?.trim()) {
    return NextResponse.json(
      { error: 'Survey post token is required but SURVEY_POST_BOOTSTRAP_SECRET is not set' },
      { status: 503 }
    );
  }
  try {
    const token = await signSurveyPostBootstrapToken();
    return NextResponse.json({ token, expiresIn: 900 });
  } catch (e) {
    console.error('[survey/bootstrap-token]', e);
    return NextResponse.json({ error: 'Could not issue token' }, { status: 500 });
  }
}
