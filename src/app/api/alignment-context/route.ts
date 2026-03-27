import { NextResponse } from 'next/server';
import { checkAlignmentContextApiGate } from '@/lib/alignment-context/api-auth';
import { listAlignmentContextItems } from '@/lib/alignment-context/db';
import { insertAlignmentContextItem } from '@/lib/storage/repositories/alignment';
import { alignmentContextCreateBodySchema } from '@/lib/alignment-context/schemas';

const LIMIT_DEFAULT = 100;
const LIMIT_MAX = 500;

/**
 * GET /api/alignment-context — list alignment context rows (SQLite on server).
 * POST — create row; source forced to `api`.
 */
export async function GET(request: Request) {
  const gate = checkAlignmentContextApiGate(request);
  if (!gate.ok) {
    return gate.response;
  }

  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get('status');
  let limit = Number.parseInt(searchParams.get('limit') ?? '', 10);
  if (!Number.isFinite(limit) || limit < 1) {
    limit = LIMIT_DEFAULT;
  }
  limit = Math.min(limit, LIMIT_MAX);

  const result = listAlignmentContextItems({ statusFilter, limit });
  const { data, error: queryError } = result;

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
            kind: 'sqlite',
            code: queryError.code,
            message: queryError.message,
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

  const { data, error } = insertAlignmentContextItem(row);
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

  if (!data) {
    return NextResponse.json({ error: 'Failed to create alignment context item' }, { status: 500 });
  }

  return NextResponse.json({ item: data }, { status: 201 });
}
