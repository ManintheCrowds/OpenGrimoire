import { NextResponse } from 'next/server';
import { requireOpenGrimoireAdminRoute } from '@/lib/alignment-context/admin-auth';
import { collectLocalAiRuntimeHealth } from '@/lib/local-ai/runtime-health';

export async function GET() {
  const auth = await requireOpenGrimoireAdminRoute();
  if (!auth.ok) {
    return auth.response;
  }

  const health = await collectLocalAiRuntimeHealth();
  return NextResponse.json(health, { headers: { 'Cache-Control': 'private, no-store' } });
}
