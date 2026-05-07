import { NextResponse } from 'next/server';
import { requireOpenGrimoireAdminRoute } from '@/lib/alignment-context/admin-auth';
import { appendLocalAiActivityEvent, readLocalAiActivityLog } from '@/lib/local-ai/activity-log';

export async function GET() {
  const auth = await requireOpenGrimoireAdminRoute();
  if (!auth.ok) {
    return auth.response;
  }

  return NextResponse.json(readLocalAiActivityLog(), { headers: { 'Cache-Control': 'private, no-store' } });
}

export async function POST(request: Request) {
  const auth = await requireOpenGrimoireAdminRoute();
  if (!auth.ok) {
    return auth.response;
  }
  const payload = (await request.json()) as {
    kind?: 'ux_assist';
    summary?: string;
    detail?: string;
    id?: string;
  };
  if (!payload.summary || !payload.kind) {
    return NextResponse.json({ error: 'kind and summary are required' }, { status: 400 });
  }
  const event = {
    id: payload.id ?? `ux-${Date.now()}`,
    ts: new Date().toISOString(),
    kind: payload.kind,
    summary: payload.summary,
    detail: payload.detail,
  } as const;
  const result = appendLocalAiActivityEvent(event);
  return NextResponse.json({ success: true, logPath: result.logPath, event });
}
