import { NextResponse } from 'next/server';
import { checkAlignmentContextApiGate } from '@/lib/alignment-context/api-auth';
import { alignmentContextPatchBodySchema } from '@/lib/alignment-context/schemas';
import {
  deleteAlignmentContextItem,
  updateAlignmentContextItem,
} from '@/lib/storage/repositories/alignment';

type RouteContext = { params: { id: string } };

/**
 * PATCH /api/alignment-context/:id — partial update.
 * DELETE — hard delete row.
 */
export async function PATCH(request: Request, context: RouteContext) {
  const gate = checkAlignmentContextApiGate(request);
  if (!gate.ok) {
    return gate.response;
  }

  const { id } = context.params;
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = alignmentContextPatchBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const patch = parsed.data;
  const keys = Object.keys(patch) as (keyof typeof patch)[];
  if (keys.length === 0) {
    return NextResponse.json(
      { error: 'At least one field is required for PATCH' },
      { status: 400 }
    );
  }

  const updatePayload: Parameters<typeof updateAlignmentContextItem>[1] = {};
  if (patch.title !== undefined) updatePayload.title = patch.title;
  if (patch.body !== undefined) updatePayload.body = patch.body;
  if (patch.tags !== undefined) updatePayload.tags = patch.tags;
  if (patch.priority !== undefined) updatePayload.priority = patch.priority;
  if (patch.status !== undefined) updatePayload.status = patch.status;
  if (patch.linked_node_id !== undefined) updatePayload.linked_node_id = patch.linked_node_id;
  if (patch.attendee_id !== undefined) updatePayload.attendee_id = patch.attendee_id;
  if (patch.source !== undefined) updatePayload.source = patch.source;

  const { data, error } = updateAlignmentContextItem(id, updatePayload);

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[alignment-context] PATCH failed:', error.code, error.message);
    } else {
      console.error('[alignment-context] PATCH failed:', error.code);
    }
    return NextResponse.json(
      { error: 'Failed to update alignment context item' },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ item: data });
}

export async function DELETE(request: Request, context: RouteContext) {
  const gate = checkAlignmentContextApiGate(request);
  if (!gate.ok) {
    return gate.response;
  }

  const { id } = context.params;
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const { deleted, error } = deleteAlignmentContextItem(id);

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[alignment-context] DELETE failed:', error.code, error.message);
    } else {
      console.error('[alignment-context] DELETE failed:', error.code);
    }
    return NextResponse.json(
      { error: 'Failed to delete alignment context item' },
      { status: 500 }
    );
  }

  if (!deleted) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, id });
}
