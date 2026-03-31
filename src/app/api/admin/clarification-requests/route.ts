import { NextResponse } from 'next/server';
import { requireOpenGrimoireAdminRoute } from '@/lib/alignment-context/admin-auth';
import { clarificationCreateBodySchema } from '@/lib/clarification/schemas';
import {
  insertClarificationRequest,
  listClarificationRequests,
} from '@/lib/storage/repositories/clarification';

const LIMIT_DEFAULT = 100;
const LIMIT_MAX = 500;

/** Admin BFF: list / create clarification requests (operator session). */
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

  const { data, error } = listClarificationRequests({ statusFilter, limit });

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[admin/clarification-requests] list:', error.code, error.message);
    } else {
      console.error('[admin/clarification-requests] list:', error.code);
    }
    return NextResponse.json({ error: 'Failed to load clarification requests' }, { status: 500 });
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

  const parsed = clarificationCreateBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { data, error } = insertClarificationRequest({
    question_spec: parsed.data.question_spec,
    agent_metadata: parsed.data.agent_metadata ?? {},
    linked_node_id: parsed.data.linked_node_id ?? null,
  });

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[admin/clarification-requests] insert:', error.code, error.message);
    } else {
      console.error('[admin/clarification-requests] insert:', error.code);
    }
    return NextResponse.json({ error: 'Failed to create clarification request' }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: 'Failed to create clarification request' }, { status: 500 });
  }

  return NextResponse.json({ item: data }, { status: 201 });
}
