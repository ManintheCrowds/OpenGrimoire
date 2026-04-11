import Database from 'better-sqlite3';
import { NextResponse } from 'next/server';
import { createAttendee, createSurveyResponse } from '@/lib/storage/repositories/survey';
import { mapAnswersToSurveyResponsePayload } from '@/lib/survey/mapAnswersToSurveyResponse';
import { isSurveyPostCaptchaRequired, verifyTurnstileToken } from '@/lib/survey/survey-post-captcha';
import {
  isSurveyPostTokenRequired,
  verifySurveyPostBootstrapToken,
} from '@/lib/survey/survey-post-bootstrap';
import { surveyPostBodySchema } from '@/lib/survey/schemas';
import { getHarnessProfileById } from '@/lib/storage/repositories/harness-profiles';

function isUniqueConstraintError(e: unknown): boolean {
  return (
    e instanceof Database.SqliteError &&
    (e.code === 'SQLITE_CONSTRAINT_UNIQUE' ||
      (typeof e.message === 'string' && e.message.includes('UNIQUE constraint failed')))
  );
}

export async function POST(request: Request) {
  if (isSurveyPostTokenRequired()) {
    if (!process.env.SURVEY_POST_BOOTSTRAP_SECRET?.trim()) {
      return NextResponse.json(
        { error: 'Survey post token required but server is not configured (SURVEY_POST_BOOTSTRAP_SECRET)' },
        { status: 503 }
      );
    }
    const ok = await verifySurveyPostBootstrapToken(request.headers.get('x-survey-post-token'));
    if (!ok) {
      return NextResponse.json(
        { error: 'Invalid or missing survey post token', detail: 'Fetch GET /api/survey/bootstrap-token first' },
        { status: 401 }
      );
    }
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = surveyPostBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const body = parsed.data;
  if (body.harnessProfileId) {
    const profile = getHarnessProfileById(body.harnessProfileId);
    if (!profile) {
      return NextResponse.json({ error: 'Validation failed', message: 'Invalid harnessProfileId' }, { status: 400 });
    }
  }

  if (isSurveyPostCaptchaRequired()) {
    if (!process.env.TURNSTILE_SECRET_KEY?.trim()) {
      return NextResponse.json(
        { error: 'Captcha required but TURNSTILE_SECRET_KEY is not set' },
        { status: 503 }
      );
    }
    const captchaOk = await verifyTurnstileToken(body.turnstileToken);
    if (!captchaOk) {
      return NextResponse.json(
        { error: 'Validation failed', message: 'Invalid or missing Turnstile token' },
        { status: 400 }
      );
    }
  }

  const mapped = mapAnswersToSurveyResponsePayload({
    answers: body.answers,
    sessionType: body.sessionType,
    questionnaireVersion: body.questionnaireVersion,
  });
  if (!mapped.ok) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        message: mapped.error.message,
        field: mapped.error.field,
      },
      { status: 400 }
    );
  }

  try {
    const attendee = createAttendee({
      first_name: body.firstName,
      last_name: body.lastName,
      email: body.isAnonymous ? undefined : body.email || undefined,
      is_anonymous: body.isAnonymous,
    });

    const surveyResponse = createSurveyResponse({
      attendee_id: attendee.id,
      ...mapped.data.surveyResponse,
      categories: mapped.data.categories,
    });

    return NextResponse.json({
      success: true,
      message: 'Survey submitted successfully',
      attendeeId: attendee.id,
      surveyResponseId: surveyResponse.id,
      harnessProfileId: surveyResponse.harness_profile_id,
    });
  } catch (error: unknown) {
    console.error('Error submitting survey:', error);

    if (isUniqueConstraintError(error)) {
      const msg = error instanceof Error ? error.message : '';
      if (msg.includes('attendees.email')) {
        return NextResponse.json(
          {
            success: false,
            message:
              'An account with this email already exists. Use a different email or submit anonymously.',
          },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { success: false, message: 'This data already exists. Check your information and try again.' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Error submitting survey' },
      { status: 500 }
    );
  }
}
