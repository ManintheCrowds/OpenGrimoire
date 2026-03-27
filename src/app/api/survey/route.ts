import Database from 'better-sqlite3';
import { NextResponse } from 'next/server';
import { createAttendee, createSurveyResponse } from '@/lib/storage/repositories/survey';
import { mapAnswersToSurveyResponsePayload } from '@/lib/survey/mapAnswersToSurveyResponse';
import { surveyPostBodySchema } from '@/lib/survey/schemas';

function isUniqueConstraintError(e: unknown): boolean {
  return (
    e instanceof Database.SqliteError &&
    (e.code === 'SQLITE_CONSTRAINT_UNIQUE' ||
      (typeof e.message === 'string' && e.message.includes('UNIQUE constraint failed')))
  );
}

export async function POST(request: Request) {
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
  const mapped = mapAnswersToSurveyResponsePayload(body.answers);
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

    createSurveyResponse({
      attendee_id: attendee.id,
      ...mapped.data,
    });

    return NextResponse.json({
      success: true,
      message: 'Survey submitted successfully',
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
