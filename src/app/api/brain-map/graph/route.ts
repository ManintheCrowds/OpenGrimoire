import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { createHash } from 'crypto';
import { authorizeBrainMapRequest } from '@/lib/brain-map/request-auth';

/**
 * Serves brain-map graph JSON. Prefers `public/brain-map-graph.local.json` when present
 * (vault + merged personal builds; gitignored by default), else `public/brain-map-graph.json`.
 * When BRAIN_MAP_SECRET is set: allow `x-brain-map-key` matching the secret, or a valid
 * OpenGrimoire operator session cookie (browser UI after login). Anonymous requests without
 * the header are rejected.
 */
export async function GET(request: Request) {
  const gate = await authorizeBrainMapRequest(request);
  if (!gate.ok) return gate.response;

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
    const url = new URL(request.url);
    const chunkSize = Math.max(0, Number.parseInt(url.searchParams.get('chunkSize') ?? '0', 10) || 0);
    const chunkIndex = Math.max(0, Number.parseInt(url.searchParams.get('chunkIndex') ?? '0', 10) || 0);

    const fingerprint = createHash('sha1').update(raw).digest('hex');
    const etag = `W/\"brain-map-${fingerprint}\"`;
    if (request.headers.get('if-none-match') === etag) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          ETag: etag,
          'Cache-Control': 'public, max-age=0, must-revalidate',
        },
      });
    }

    if (chunkSize > 0) {
      const nodeStart = chunkIndex * chunkSize;
      const edgeStart = chunkIndex * chunkSize;
      const chunked = {
        ...graph,
        nodes: graph.nodes.slice(nodeStart, nodeStart + chunkSize),
        edges: graph.edges.slice(edgeStart, edgeStart + chunkSize),
        chunkIndex,
        chunkSize,
        hasMoreNodes: nodeStart + chunkSize < graph.nodes.length,
        hasMoreEdges: edgeStart + chunkSize < graph.edges.length,
        fingerprint,
      };
      return NextResponse.json(chunked, {
        headers: {
          ETag: etag,
          'Cache-Control': 'public, max-age=0, must-revalidate',
          'X-Graph-Fingerprint': fingerprint,
        },
      });
    }

    return NextResponse.json(graph, {
      headers: {
        ETag: etag,
        'Cache-Control': 'public, max-age=0, must-revalidate',
        'X-Graph-Fingerprint': fingerprint,
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Graph not found. Run: python .cursor/scripts/build_brain_map.py' },
      { status: 404 }
    );
  }
}
