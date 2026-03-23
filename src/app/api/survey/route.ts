import { NextResponse } from 'next/server';
import { createAttendee, createSurveyResponse } from '@/lib/supabase/db';
import { mapAnswersToSurveyResponsePayload } from '@/lib/survey/mapAnswersToSurveyResponse';
import { surveyPostBodySchema } from '@/lib/survey/schemas';

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
    const attendee = await createAttendee({
      first_name: body.firstName,
      last_name: body.lastName,
      email: body.isAnonymous ? undefined : body.email || undefined,
      is_anonymous: body.isAnonymous,
    });

    await createSurveyResponse({
      attendee_id: attendee.id,
      ...mapped.data,
    });

    return NextResponse.json({
      success: true,
      message: 'Survey submitted successfully',
    });
  } catch (error: unknown) {
    console.error('Error submitting survey:', error);

    if (error && typeof error === 'object' && 'code' in error) {
      const code = (error as { code?: string }).code;
      const message = String((error as { message?: string }).message ?? '');
      if (code === '23505' && message.includes('attendees_email_key')) {
        return NextResponse.json(
          {
            success: false,
            message:
              'An account with this email already exists. Use a different email or submit anonymously.',
          },
          { status: 409 }
        );
      }
      if (code === '23505') {
        return NextResponse.json(
          { success: false, message: 'This data already exists. Check your information and try again.' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { success: false, message: 'Error submitting survey' },
      { status: 500 }
    );
  }
}
