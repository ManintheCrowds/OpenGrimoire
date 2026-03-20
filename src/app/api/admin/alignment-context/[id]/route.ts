import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase/admin';
import { requireOpenAtlasAdminRoute } from '@/lib/alignment-context/admin-auth';
import { alignmentContextPatchBodySchema } from '@/lib/alignment-context/schemas';

type RouteContext = { params: { id: string } };

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireOpenAtlasAdminRoute();
  if (!auth.ok) {
    return auth.response;
  }

  const admin = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: 'Server misconfigured', detail: 'SUPABASE_SERVICE_ROLE_KEY required.' },
      { status: 503 }
    );
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
  if (Object.keys(patch).length === 0) {
    return NextResponse.json(
      { error: 'At least one field is required for PATCH' },
      { status: 400 }
    );
  }

  const updatePayload: Record<string, unknown> = {};
  if (patch.title !== undefined) updatePayload.title = patch.title;
  if (patch.body !== undefined) updatePayload.body = patch.body;
  if (patch.tags !== undefined) updatePayload.tags = patch.tags;
  if (patch.priority !== undefined) updatePayload.priority = patch.priority;
  if (patch.status !== undefined) updatePayload.status = patch.status;
  if (patch.linked_node_id !== undefined) updatePayload.linked_node_id = patch.linked_node_id;
  if (patch.attendee_id !== undefined) updatePayload.attendee_id = patch.attendee_id;
  if (patch.source !== undefined) updatePayload.source = patch.source;

  const { data, error } = await admin
    .from('alignment_context_items')
    .update(updatePayload)
    .eq('id', id)
    .select(
      'id,title,body,tags,priority,status,linked_node_id,attendee_id,source,created_by,created_at,updated_at'
    )
    .maybeSingle();

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[admin/alignment-context] PATCH:', error.code, error.message);
    } else {
      console.error('[admin/alignment-context] PATCH:', error.code);
    }
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ item: data });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireOpenAtlasAdminRoute();
  if (!auth.ok) {
    return auth.response;
  }

  const admin = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: 'Server misconfigured', detail: 'SUPABASE_SERVICE_ROLE_KEY required.' },
      { status: 503 }
    );
  }

  const { id } = context.params;
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const { data, error } = await admin
    .from('alignment_context_items')
    .delete()
    .eq('id', id)
    .select('id')
    .maybeSingle();

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[admin/alignment-context] DELETE:', error.code, error.message);
    } else {
      console.error('[admin/alignment-context] DELETE:', error.code);
    }
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}
