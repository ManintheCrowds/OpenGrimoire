import { NextResponse } from 'next/server';
import { requireOpenGrimoireAdminRoute } from '@/lib/alignment-context/admin-auth';

const JOB_LINKS = [
  {
    id: 'e2e',
    title: 'Playwright E2E',
    status: 'link_only',
    href: 'https://github.com/search?q=repo%3AManintheCrowds%2FOpenGrimoire+path%3A.github%2Fworkflows+playwright&type=code',
    note: 'Use workflow history as canonical run status.',
  },
  {
    id: 'prod-smoke',
    title: 'Survey read-gate production smoke',
    status: 'link_only',
    href: 'https://github.com/ManintheCrowds/OpenGrimoire/blob/main/.github/workflows/survey-visualization-prod-smoke.yml',
    note: 'Workflow definition for production read-gate matrix checks.',
  },
  {
    id: 'gha',
    title: 'GitHub Actions',
    status: 'link_only',
    href: 'https://github.com/ManintheCrowds/OpenGrimoire/actions',
    note: 'Repository Actions index for latest automation runs.',
  },
];

export async function GET() {
  const auth = await requireOpenGrimoireAdminRoute();
  if (!auth.ok) {
    return auth.response;
  }

  return NextResponse.json(
    {
      panel: 'jobs-and-automation',
      mode: 'read_only_link_aggregation',
      links: JOB_LINKS,
      summary:
        'No synthetic agent rows. This panel links to known automation evidence surfaces until a canonical jobs status API is approved.',
    },
    { headers: { 'Cache-Control': 'private, no-store' } }
  );
}
