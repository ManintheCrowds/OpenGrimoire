import { NextResponse } from 'next/server';
import { checkClarificationApiGate } from '@/lib/clarification/clarification-api-auth';
import { clarificationResolveBodySchema } from '@/lib/clarification/schemas';
import { getClarificationRequestById, resolveClarificationRequest } from '@/lib/storage/repositories/clarification';

type RouteContext = { params: { id: string } };

export async function GET(request: Request, context: RouteContext) {
  const gate = checkClarificationApiGate(request);
  if (!gate.ok) {
    return gate.response;
  }

  const { id } = context.params;
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const { data, error } = getClarificationRequestById(id);
  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[clarification-requests] GET:', error.code, error.message);
    } else {
      console.error('[clarification-requests] GET:', error.code);
    }
    return NextResponse.json({ error: 'Failed to load item' }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(
    { item: data },
    { headers: { 'Cache-Control': 'private, no-store' } }
  );
}

/**
 * PATCH — resolve a pending item (human or script using alignment API key).
 */
export async function PATCH(request: Request, context: RouteContext) {
  const gate = checkClarificationApiGate(request);
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

  const parsed = clarificationResolveBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const status = parsed.data.status ?? 'answered';
  const result = resolveClarificationRequest(id, {
    resolution: parsed.data.resolution,
    status,
  });

  if (result.validationError) {
    return NextResponse.json({ error: 'Validation failed', message: result.validationError }, { status: 400 });
  }

  if (result.error?.code === 'NOT_FOUND') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (result.error?.code === 'INVALID_STATE') {
    return NextResponse.json({ error: result.error.message }, { status: 409 });
  }

  if (result.error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[clarification-requests] PATCH:', result.error.code, result.error.message);
    } else {
      console.error('[clarification-requests] PATCH:', result.error.code);
    }
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }

  if (!result.data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ item: result.data });
}
