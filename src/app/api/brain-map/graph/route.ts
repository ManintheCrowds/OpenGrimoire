import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { timingSafeEqualString } from '@/lib/crypto/timing-safe-compare';

/**
 * Serves brain-map graph JSON. Prefers `public/brain-map-graph.local.json` when present
 * (vault + merged personal builds; gitignored by default), else `public/brain-map-graph.json`.
 * Optional BRAIN_MAP_SECRET for access control.
 */
export async function GET(request: Request) {
  const key = request.headers.get('x-brain-map-key') ?? '';
  const secret = process.env.BRAIN_MAP_SECRET;
  if (secret && !timingSafeEqualString(key, secret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
