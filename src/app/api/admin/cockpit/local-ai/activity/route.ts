import { NextResponse } from 'next/server';
import { requireOpenGrimoireAdminRoute } from '@/lib/alignment-context/admin-auth';
import { readLocalAiActivityLog } from '@/lib/local-ai/activity-log';

export async function GET() {
  const auth = await requireOpenGrimoireAdminRoute();
  if (!auth.ok) {
    return auth.response;
  }

  return NextResponse.json(readLocalAiActivityLog(), { headers: { 'Cache-Control': 'private, no-store' } });
}
