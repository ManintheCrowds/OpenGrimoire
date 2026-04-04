import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import {
  OPENGRIMOIRE_SESSION_COOKIE,
  verifyAdminSessionToken,
} from '@/lib/auth/session';
import { timingSafeEqualString } from '@/lib/crypto/timing-safe-compare';
import { logAccessDenied } from '@/lib/observability/access-denial-log';

/**
 * Serves brain-map graph JSON. Prefers `public/brain-map-graph.local.json` when present
 * (vault + merged personal builds; gitignored by default), else `public/brain-map-graph.json`.
 * When BRAIN_MAP_SECRET is set: allow `x-brain-map-key` matching the secret, or a valid
 * OpenGrimoire operator session cookie (browser UI after login). Anonymous requests without
 * the header are rejected.
 */
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

  const publicDir = join(process.cwd(), 'public');
  const localPath = join(publicDir, 'brain-map-graph.local.json');
  const defaultPath = join(publicDir, 'brain-map-graph.json');

  try {
    let raw: string;
    try {
      raw = await readFile(localPath, 'utf-8');
    } catch {
      raw = await readFile(defaultPath, 'utf-8');
    }
    const graph = JSON.parse(raw);
    return NextResponse.json(graph, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    return NextResponse.json(
      { error: 'Graph not found. Run: python .cursor/scripts/build_brain_map.py' },
      { status: 404 }
    );
  }
}
