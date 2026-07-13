import { stat } from 'node:fs/promises';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { readBrainMapSourcesConfig, resolveActiveGraphPath } from '@/lib/brain-map/sources-config';
import {
  OPENGRIMOIRE_SESSION_COOKIE,
  verifyAdminSessionToken,
} from '@/lib/auth/session';
import { timingSafeEqualString } from '@/lib/crypto/timing-safe-compare';
import { logAccessDenied } from '@/lib/observability/access-denial-log';

export async function GET(request: Request) {
  const secret = process.env.BRAIN_MAP_SECRET;
  if (secret) {
    const key = request.headers.get('x-brain-map-key') ?? '';
    const headerOk = timingSafeEqualString(key, secret);
    const token = cookies().get(OPENGRIMOIRE_SESSION_COOKIE)?.value;
    const sessionOk = (await verifyAdminSessionToken(token)) !== null;
    if (!headerOk && !sessionOk) {
      logAccessDenied({
        request,
        gate: 'brain_map',
        reason: key.trim() ? 'invalid_secret' : 'session_required',
        status: 401,
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

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
