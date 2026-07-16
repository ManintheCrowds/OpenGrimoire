import { stat } from 'fs/promises';
import { NextResponse } from 'next/server';
import { authorizeBrainMapRequest } from '@/lib/brain-map/request-auth';
import { readBrainMapSourcesConfig, resolveActiveGraphPath } from '@/lib/brain-map/sources-config';

export async function GET(request: Request) {
  const gate = await authorizeBrainMapRequest(request);
  if (!gate.ok) return gate.response;

  const sources = await readBrainMapSourcesConfig();
  const graph = resolveActiveGraphPath();
  let graphMtime: string | null = null;
  try {
    const st = await stat(graph.path);
    graphMtime = st.mtime.toISOString();
  } catch {
    graphMtime = null;
  }

  return NextResponse.json({
    sources,
    graph: {
      path: graph.path,
      variant: graph.source,
      mtime: graphMtime,
    },
    rebuildHint:
      'Run MiscRepos .cursor/scripts/build_brain_map.py after changing vault/state dirs, then refresh the browser.',
  });
}
