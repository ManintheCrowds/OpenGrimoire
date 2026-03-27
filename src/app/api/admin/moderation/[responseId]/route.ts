import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireOpenGrimoireAdminRoute } from '@/lib/alignment-context/admin-auth';
import { updateModerationStatus } from '@/lib/storage/repositories/survey';

const bodySchema = z.object({
  status: z.enum(['approved', 'rejected', 'pending']),
  notes: z.string().optional(),
});

type RouteContext = { params: { responseId: string } };

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireOpenGrimoireAdminRoute();
  if (!auth.ok) {
    return auth.response;
  }

  const { responseId } = context.params;
  if (!responseId) {
    return NextResponse.json({ error: 'Missing response id' }, { status: 400 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const row = updateModerationStatus(responseId, {
      status: parsed.data.status,
      moderator_id: auth.user.id,
      notes: parsed.data.notes,
    });
    return NextResponse.json({ moderation: row });
  } catch (e) {
    console.error('[admin/moderation PATCH]', e);
    return NextResponse.json({ error: 'Failed to update moderation' }, { status: 500 });
  }
}
