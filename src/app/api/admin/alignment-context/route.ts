import { NextResponse } from 'next/server';
import { requireOpenGrimoireAdminRoute } from '@/lib/alignment-context/admin-auth';
import { alignmentContextCreateBodySchema } from '@/lib/alignment-context/schemas';
import {
  insertAlignmentContextItem,
  listAlignmentContextItems,
} from '@/lib/storage/repositories/alignment';

const LIMIT_DEFAULT = 100;
const LIMIT_MAX = 500;

/**
 * Admin BFF: list / create alignment_context_items after session admin check.
 */
export async function GET(request: Request) {
  const auth = await requireOpenGrimoireAdminRoute();
  if (!auth.ok) {
    return auth.response;
  }

  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get('status');
  let limit = Number.parseInt(searchParams.get('limit') ?? '', 10);
  if (!Number.isFinite(limit) || limit < 1) {
    limit = LIMIT_DEFAULT;
  }
  limit = Math.min(limit, LIMIT_MAX);

  const { data, error } = listAlignmentContextItems({ statusFilter, limit });

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[admin/alignment-context] list:', error.code, error.message);
    } else {
      console.error('[admin/alignment-context] list:', error.code);
    }
    return NextResponse.json({ error: 'Failed to load items' }, { status: 500 });
  }

  return NextResponse.json(
    { items: data ?? [] },
    { headers: { 'Cache-Control': 'private, no-store' } }
  );
}

export async function POST(request: Request) {
  const auth = await requireOpenGrimoireAdminRoute();
  if (!auth.ok) {
    return auth.response;
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
    source: 'ui' as const,
    created_by: auth.user.id,
  };

  const { data, error } = insertAlignmentContextItem(row);

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[admin/alignment-context] insert:', error.code, error.message);
    } else {
      console.error('[admin/alignment-context] insert:', error.code);
    }
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
  }

  return NextResponse.json({ item: data }, { status: 201 });
}
