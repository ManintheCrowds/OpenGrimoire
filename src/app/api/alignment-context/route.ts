import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase/admin';
import { checkAlignmentContextApiGate } from '@/lib/alignment-context/api-auth';
import { listAlignmentContextItems } from '@/lib/alignment-context/db';
import {
  alignmentContextCreateBodySchema,
} from '@/lib/alignment-context/schemas';

const LIMIT_DEFAULT = 100;
const LIMIT_MAX = 500;

/**
 * GET /api/alignment-context — list alignment context rows (service role on server).
 * POST — create row; source forced to `api`.
 *
 * Production: ALIGNMENT_CONTEXT_API_SECRET is required (fail closed). Send x-alignment-context-key.
 * Development: secret optional; if unset, route is open (localhost only recommended).
 */
export async function GET(request: Request) {
  const gate = checkAlignmentContextApiGate(request);
  if (!gate.ok) {
    return gate.response;
  }

  const admin = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      {
        error: 'Server misconfigured',
        detail: 'NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for this route.',
      },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get('status');
  let limit = Number.parseInt(searchParams.get('limit') ?? '', 10);
  if (!Number.isFinite(limit) || limit < 1) {
    limit = LIMIT_DEFAULT;
  }
  limit = Math.min(limit, LIMIT_MAX);

  let data: Awaited<ReturnType<typeof listAlignmentContextItems>>['data'];
  let queryError: Awaited<ReturnType<typeof listAlignmentContextItems>>['error'];

  try {
    const result = await listAlignmentContextItems(admin, { statusFilter, limit });
    data = result.data;
    queryError = result.error;
  } catch (err) {
    const isDev = process.env.NODE_ENV === 'development';
    const e = err instanceof Error ? err : new Error(String(err));
    if (isDev) {
      console.error('[alignment-context] transport error:', e.name, e.message);
    } else {
      console.error('[alignment-context] transport error:', e.name);
    }
    const safeMessage = e.message.replace(/https?:\/\/[^\s"'<>]+/gi, '[url]');
    return NextResponse.json(
      {
        error: 'Failed to reach Supabase',
        ...(isDev && {
          debug: {
            kind: 'transport',
            name: e.name,
            message: safeMessage,
            hint: 'Check NEXT_PUBLIC_SUPABASE_URL, network/VPN, and that the project is reachable from this host.',
          },
        }),
      },
      { status: 502 }
    );
  }

  if (queryError) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[alignment-context] query failed:', queryError.code, queryError.message);
    } else {
      console.error('[alignment-context] query failed:', queryError.code);
    }
    const isDev = process.env.NODE_ENV === 'development';
    return NextResponse.json(
      {
        error: 'Failed to load alignment context',
        ...(isDev && {
          debug: {
            kind: 'postgrest',
            code: queryError.code,
            message: queryError.message,
            hint: queryError.message?.includes('relation')
              ? 'Table may be missing — apply migration 20260319140000_alignment_context_items.sql.'
              : undefined,
          },
        }),
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { items: data ?? [] },
    {
      headers: {
        'Cache-Control': 'private, no-store',
      },
    }
  );
}

export async function POST(request: Request) {
  const gate = checkAlignmentContextApiGate(request);
  if (!gate.ok) {
    return gate.response;
  }

  const admin = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      {
        error: 'Server misconfigured',
        detail: 'NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for this route.',
      },
      { status: 503 }
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = alignmentContextCreateBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const row = {
    title: parsed.data.title,
    body: parsed.data.body ?? null,
    tags: parsed.data.tags ?? [],
    priority: parsed.data.priority ?? null,
    status: parsed.data.status,
    linked_node_id: parsed.data.linked_node_id ?? null,
    attendee_id: parsed.data.attendee_id ?? null,
    source: 'api' as const,
    created_by: null,
  };

  try {
    const { data, error } = await admin
      .from('alignment_context_items')
      .insert(row)
      .select(
        'id,title,body,tags,priority,status,linked_node_id,attendee_id,source,created_by,created_at,updated_at'
      )
      .single();

    if (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[alignment-context] insert failed:', error.code, error.message);
      } else {
        console.error('[alignment-context] insert failed:', error.code);
      }
      return NextResponse.json(
        { error: 'Failed to create alignment context item' },
        { status: 500 }
      );
    }

    return NextResponse.json({ item: data }, { status: 201 });
  } catch (err) {
    const isDev = process.env.NODE_ENV === 'development';
    const e = err instanceof Error ? err : new Error(String(err));
    if (isDev) {
      console.error('[alignment-context] POST transport error:', e.name, e.message);
    } else {
      console.error('[alignment-context] POST transport error:', e.name);
    }
    return NextResponse.json({ error: 'Failed to reach Supabase' }, { status: 502 });
  }
}
