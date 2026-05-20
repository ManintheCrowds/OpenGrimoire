import { NextResponse } from 'next/server';
import { requireOpenGrimoireAdminRoute } from '@/lib/alignment-context/admin-auth';
import {
  readBrainMapSourcesConfig,
  resolveActiveGraphPath,
  writeBrainMapSourcesConfig,
  type BrainMapSourcesConfig,
} from '@/lib/brain-map/sources-config';

export async function GET() {
  const auth = await requireOpenGrimoireAdminRoute();
  if (!auth.ok) return auth.response;

  const sources = await readBrainMapSourcesConfig();
  const graph = resolveActiveGraphPath();
  return NextResponse.json({ sources, graph });
}

export async function PUT(request: Request) {
  const auth = await requireOpenGrimoireAdminRoute();
  if (!auth.ok) return auth.response;

  let body: Partial<BrainMapSourcesConfig>;
  try {
    body = (await request.json()) as Partial<BrainMapSourcesConfig>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const saved = await writeBrainMapSourcesConfig({
    vaultRoots: body.vaultRoots ?? [],
    vaultLabels: body.vaultLabels ?? [],
    stateDirs: body.stateDirs ?? [],
    stateLabels: body.stateLabels ?? [],
  });

  return NextResponse.json({ sources: saved });
}
