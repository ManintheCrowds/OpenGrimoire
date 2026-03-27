import { NextResponse } from 'next/server';
import { getApprovedUniqueQualities } from '@/lib/storage/repositories/survey';
import { checkSurveyReadGate } from '@/lib/survey/survey-read-gate';

export async function GET(request: Request) {
  const gate = await checkSurveyReadGate(request);
  if (!gate.ok) {
    return gate.response;
  }

  try {
    const items = getApprovedUniqueQualities();
    return NextResponse.json(
      { items },
      { headers: { 'Cache-Control': 'private, no-store' } }
    );
  } catch (e) {
    console.error('[survey/approved-qualities]', e);
    return NextResponse.json({ error: 'Failed to load quotes' }, { status: 500 });
  }
}
