import { NextResponse } from 'next/server';
import { requireOpenGrimoireAdminRoute } from '@/lib/alignment-context/admin-auth';
import { listLocalAiWorkflowRecipes } from '@/lib/local-ai/workflow-recipes';

export async function GET() {
  const auth = await requireOpenGrimoireAdminRoute();
  if (!auth.ok) {
    return auth.response;
  }

  return NextResponse.json(
    {
      panel: 'workflow-recipes',
      mode: 'read_only',
      recipes: listLocalAiWorkflowRecipes(),
      summary: 'Curated local-first workflow recipes. Execution controls are deferred until CLI/MCP parity exists.',
    },
    { headers: { 'Cache-Control': 'private, no-store' } }
  );
}
