import { NextResponse } from 'next/server';
import { requireOpenGrimoireAdminRoute } from '@/lib/alignment-context/admin-auth';

const READ_GATE_EXPECTATIONS = [
  {
    id: 'prod-smoke-command',
    label: 'Production read-gate smoke command',
    value: 'npm run verify:survey-read-prod',
  },
  {
    id: 'prod-smoke-workflow',
    label: 'Production smoke workflow',
    value: '.github/workflows/survey-visualization-prod-smoke.yml',
  },
  {
    id: 'read-gate-runbook',
    label: 'Read-gate operator runbook',
    value: '/docs/admin/SURVEY_READ_GATING_RUNBOOK.md',
  },
];

export async function GET() {
  const auth = await requireOpenGrimoireAdminRoute();
  if (!auth.ok) {
    return auth.response;
  }

  return NextResponse.json(
    {
      panel: 'capabilities-read-gate-health',
      mode: 'read_only',
      capabilitiesPath: '/api/capabilities',
      readGateExpectations: READ_GATE_EXPECTATIONS,
      summary:
        'Read-only cockpit echo of survey-read-gate production expectations. Use verify:survey-read-prod and workflow evidence before release.',
    },
    { headers: { 'Cache-Control': 'private, no-store' } }
  );
}
