import { NextResponse } from 'next/server';

/**
 * Hand-maintained machine-readable API surface for agents (OA-REST-2).
 * Update in the same PR as changes under src/app/api/ (see CONTRIBUTING.md, ARCHITECTURE_REST_CONTRACT.md).
 */
const CAPABILITIES = {
  app: 'open-atlas',
  maintainer_note:
    'Mirror of docs entity matrix; not generated. Extend when adding routes.',
  documentation: {
    contract: '/docs/ARCHITECTURE_REST_CONTRACT.md (repo)',
    alignment_api: '/docs/agent/ALIGNMENT_CONTEXT_API.md (repo)',
  },
  auth_env_hints: [
    'ALIGNMENT_CONTEXT_API_SECRET + header x-alignment-context-key',
    'BRAIN_MAP_SECRET + header x-brain-map-key',
    'Supabase session + admin role for /api/admin/alignment-context',
  ],
  routes: [
    {
      path: '/api/alignment-context',
      methods: ['GET', 'POST'],
      auth: 'x-alignment-context-key when ALIGNMENT_CONTEXT_API_SECRET set',
    },
    {
      path: '/api/alignment-context/:id',
      methods: ['PATCH', 'DELETE'],
      auth: 'x-alignment-context-key when ALIGNMENT_CONTEXT_API_SECRET set',
    },
    {
      path: '/api/admin/alignment-context',
      methods: ['GET', 'POST'],
      auth: 'Supabase session; user_metadata.role === admin',
    },
    {
      path: '/api/admin/alignment-context/:id',
      methods: ['PATCH', 'DELETE'],
      auth: 'Supabase session; user_metadata.role === admin',
    },
    {
      path: '/api/brain-map/graph',
      methods: ['GET'],
      auth: 'Optional x-brain-map-key when BRAIN_MAP_SECRET set',
    },
    {
      path: '/api/survey',
      methods: ['POST'],
      auth: 'Server-side Supabase (no alignment shared-secret pattern)',
    },
    {
      path: '/api/test-data/:dataset',
      methods: ['GET'],
      auth: 'None (stub)',
    },
    {
      path: '/api/capabilities',
      methods: ['GET'],
      auth: 'None (public manifest)',
    },
  ],
} as const;

export async function GET() {
  return NextResponse.json(CAPABILITIES, {
    headers: { 'Cache-Control': 'public, max-age=300' },
  });
}
