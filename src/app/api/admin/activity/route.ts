import { NextResponse } from 'next/server';
import { requireOpenGrimoireAdminRoute } from '@/lib/alignment-context/admin-auth';

export async function GET() {
  const auth = await requireOpenGrimoireAdminRoute();
  if (!auth.ok) {
    return auth.response;
  }

  return NextResponse.json(
    {
      mode: 'placeholder',
      status: 'degraded',
      summary:
        'Canonical activity feed endpoint is not yet available. This panel is a thin adapter and does not claim live event completeness.',
      runbookPath: '/docs/OPERATOR_GUI_RUNBOOK.md',
    },
    { headers: { 'Cache-Control': 'private, no-store' } }
  );
}
