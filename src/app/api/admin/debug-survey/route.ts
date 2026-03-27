import { NextResponse } from 'next/server';
import { requireOpenGrimoireAdminRoute } from '@/lib/alignment-context/admin-auth';
import { debugSurveyResponses } from '@/lib/storage/repositories/survey';

export async function GET() {
  const auth = await requireOpenGrimoireAdminRoute();
  if (!auth.ok) {
    return auth.response;
  }

  const data = debugSurveyResponses();
  return NextResponse.json(data ?? {});
}
