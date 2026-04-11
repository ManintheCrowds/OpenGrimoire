import { NextResponse } from 'next/server';
import { checkAlignmentOrAdminSession } from '@/lib/alignment-context/api-auth';
import { harnessProfilePatchBodySchema } from '@/lib/harness-profiles/schemas';
import {
  deleteHarnessProfile,
  getHarnessProfileById,
  updateHarnessProfile,
} from '@/lib/storage/repositories/harness-profiles';

type RouteContext = { params: { id: string } };

export async function GET(_request: Request, context: RouteContext) {
  const gate = await checkAlignmentOrAdminSession(_request);
  if (!gate.ok) return gate.response;
  const item = getHarnessProfileById(context.params.id);
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ item });
}

export async function PATCH(request: Request, context: RouteContext) {
  const gate = await checkAlignmentOrAdminSession(request);
  if (!gate.ok) return gate.response;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const parsed = harnessProfilePatchBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', issues: parsed.error.flatten() }, { status: 400 });
  }
  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: 'At least one field is required for PATCH' }, { status: 400 });
  }

  const item = updateHarnessProfile(context.params.id, parsed.data);
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ item });
}

export async function DELETE(request: Request, context: RouteContext) {
  const gate = await checkAlignmentOrAdminSession(request);
  if (!gate.ok) return gate.response;
  const deleted = deleteHarnessProfile(context.params.id);
  if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true, id: context.params.id });
}
