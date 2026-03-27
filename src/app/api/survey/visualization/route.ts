import { NextResponse } from 'next/server';
import { getVisualizationData } from '@/lib/storage/repositories/survey';
import { checkSurveyReadGate } from '@/lib/survey/survey-read-gate';

/**
 * Survey visualization rows (may include PII). Open in dev; production gated — see checkSurveyReadGate.
 */
export async function GET(request: Request) {
  const gate = await checkSurveyReadGate(request);
  if (!gate.ok) {
    return gate.response;
  }

  const { searchParams } = new URL(request.url);
  const all = searchParams.get('all') === '1';
  const showTestDataParam = searchParams.get('showTestData');
  const showTestData: boolean | null = all
    ? null
    : showTestDataParam === 'true';

  try {
    const data = getVisualizationData(showTestData);
    return NextResponse.json(
      { data },
      { headers: { 'Cache-Control': 'private, no-store' } }
    );
  } catch (e) {
    console.error('[survey/visualization]', e);
    return NextResponse.json({ error: 'Failed to load visualization data' }, { status: 500 });
  }
}
