import { NextResponse } from 'next/server';
import { requireOpenGrimoireAdminRoute } from '@/lib/alignment-context/admin-auth';
import { appendAutoresearchEvent, readAutoresearchEvents } from '@/lib/autoresearch/events';

export async function GET() {
  const auth = await requireOpenGrimoireAdminRoute();
  if (!auth.ok) {
    return auth.response;
  }

  return NextResponse.json(readAutoresearchEvents(), { headers: { 'Cache-Control': 'private, no-store' } });
}

export async function POST(request: Request) {
  const auth = await requireOpenGrimoireAdminRoute();
  if (!auth.ok) {
    return auth.response;
  }

  const payload = (await request.json()) as Record<string, unknown>;
  if (
    typeof payload.event !== 'string' ||
    typeof payload.experiment_id !== 'string' ||
    typeof payload.asset !== 'string' ||
    typeof payload.branch !== 'string'
  ) {
    return NextResponse.json(
      { error: 'event, experiment_id, asset, and branch are required' },
      { status: 400 }
    );
  }

  const event = {
    ...payload,
    ts: typeof payload.ts === 'string' ? payload.ts : new Date().toISOString(),
    source: typeof payload.source === 'string' ? payload.source : 'agent',
  } as Parameters<typeof appendAutoresearchEvent>[0];

  const result = appendAutoresearchEvent(event);
  return NextResponse.json({ success: true, logPath: result.logPath, event });
}
