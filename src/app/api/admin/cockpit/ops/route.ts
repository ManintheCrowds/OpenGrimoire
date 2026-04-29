import { NextResponse } from 'next/server';
import { requireOpenGrimoireAdminRoute } from '@/lib/alignment-context/admin-auth';

const RECURRING_OPS = [
  {
    id: 'survey-read-gate-prod-smoke',
    workflow: 'Survey read-gate production smoke',
    schedule: 'On pull request and push (main/master)',
    owner: 'OpenGrimoire maintainers',
    evidencePath: '.github/workflows/survey-visualization-prod-smoke.yml',
  },
  {
    id: 'playwright-admin-smoke',
    workflow: 'Admin moderation E2E smoke',
    schedule: 'On PR branch before merge (manual/CI)',
    owner: 'OpenGrimoire maintainers',
    evidencePath: 'e2e/admin-moderation.spec.ts',
  },
  {
    id: 'verify-chain',
    workflow: 'Verify chain (lint/type/test/contracts)',
    schedule: 'Before merge and release',
    owner: 'OpenGrimoire maintainers',
    evidencePath: 'package.json (npm run verify)',
  },
];

export async function GET() {
  const auth = await requireOpenGrimoireAdminRoute();
  if (!auth.ok) {
    return auth.response;
  }

  return NextResponse.json(
    {
      panel: 'recurring-operations',
      mode: 'read_only',
      runbookPath: '/docs/runbooks/recurring-operations.md',
      items: RECURRING_OPS,
    },
    { headers: { 'Cache-Control': 'private, no-store' } }
  );
}
