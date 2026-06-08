import { NextResponse } from 'next/server';
import { requireOpenGrimoireAdminRoute } from '@/lib/alignment-context/admin-auth';
import { getAutoresearchExperimentDetail } from '@/lib/autoresearch/events';

export async function GET(_request: Request, context: { params: Promise<{ experimentId: string }> }) {
  const auth = await requireOpenGrimoireAdminRoute();
  if (!auth.ok) {
    return auth.response;
  }

  const { experimentId } = await context.params;
  return NextResponse.json(getAutoresearchExperimentDetail(experimentId), {
    headers: { 'Cache-Control': 'private, no-store' },
  });
}
