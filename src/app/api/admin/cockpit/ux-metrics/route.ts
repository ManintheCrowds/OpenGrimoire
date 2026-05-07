import { NextResponse } from 'next/server';
import { requireOpenGrimoireAdminRoute } from '@/lib/alignment-context/admin-auth';
import { readLocalAiActivityLog } from '@/lib/local-ai/activity-log';

function parseAction(detail?: string): 'accept' | 'dismiss' | 'undo' | 'unknown' {
  if (!detail) return 'unknown';
  const m = detail.match(/action=([^;]+)/);
  if (!m) return 'unknown';
  const action = m[1];
  return action === 'accept' || action === 'dismiss' || action === 'undo' ? action : 'unknown';
}

export async function GET() {
  const auth = await requireOpenGrimoireAdminRoute();
  if (!auth.ok) return auth.response;

  const log = readLocalAiActivityLog();
  const uxEvents = log.events.filter((event) => event.kind === 'ux_assist');

  const accept = uxEvents.filter((event) => parseAction(event.detail) === 'accept').length;
  const dismiss = uxEvents.filter((event) => parseAction(event.detail) === 'dismiss').length;
  const undo = uxEvents.filter((event) => parseAction(event.detail) === 'undo').length;

  const aiAssistTotal = accept + dismiss;
  const acceptanceRate = aiAssistTotal > 0 ? accept / aiAssistTotal : null;
  const dismissRate = aiAssistTotal > 0 ? dismiss / aiAssistTotal : null;

  const daily = new Map<string, { accept: number; dismiss: number; undo: number }>();
  for (const event of uxEvents) {
    const day = event.ts.slice(0, 10);
    const current = daily.get(day) ?? { accept: 0, dismiss: 0, undo: 0 };
    const action = parseAction(event.detail);
    if (action === 'accept') current.accept += 1;
    if (action === 'dismiss') current.dismiss += 1;
    if (action === 'undo') current.undo += 1;
    daily.set(day, current);
  }

  return NextResponse.json(
    {
      panel: 'ux-metrics',
      summary: 'Local UX telemetry adapter derived from local-ai activity JSONL.',
      recoverySuccessRate: null,
      aiAssist: {
        totalSignals: aiAssistTotal,
        accept,
        dismiss,
        undo,
        acceptanceRate,
        dismissRate,
        editRate: null,
      },
      frictionTrendDaily: Array.from(daily.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([day, values]) => ({ day, ...values })),
      coverageNotes: [
        'Recovery success requires explicit success markers from Sync Session post-error retries (not yet instrumented).',
        'Edit-rate requires explicit edit affordance telemetry (not yet instrumented).',
      ],
    },
    { headers: { 'Cache-Control': 'private, no-store' } }
  );
}
