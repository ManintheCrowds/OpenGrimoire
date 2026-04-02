import { NextResponse } from 'next/server';
import { checkAlignmentOrAdminSession } from '@/lib/alignment-context/api-auth';
import { createStudyCard, listStudyCards } from '@/lib/storage/repositories/study';

type RouteParams = { params: { deckId: string } };

export async function GET(request: Request, context: RouteParams) {
  const gate = await checkAlignmentOrAdminSession(request);
  if (!gate.ok) {
    return gate.response;
  }
  const { deckId } = context.params;
  const { searchParams } = new URL(request.url);
  const dueOnly = searchParams.get('due') === '1' || searchParams.get('due') === 'true';
  const result = listStudyCards(deckId, { dueOnly });
  if (result.error) {
    return NextResponse.json({ error: 'Failed to list cards', detail: result.error.message }, { status: 500 });
  }
  return NextResponse.json({ cards: result.data ?? [] }, { headers: { 'Cache-Control': 'private, no-store' } });
}

export async function POST(request: Request, context: RouteParams) {
  const gate = await checkAlignmentOrAdminSession(request);
  if (!gate.ok) {
    return gate.response;
  }
  const { deckId } = context.params;
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const body = json as {
    front?: string;
    back?: string;
    source_url?: string | null;
    repo_path?: string | null;
    alignment_context_item_id?: string | null;
  };
  const front = typeof body.front === 'string' ? body.front : '';
  const back = typeof body.back === 'string' ? body.back : '';
  if (!front.trim() || !back.trim()) {
    return NextResponse.json({ error: 'front and back are required' }, { status: 400 });
  }
  const result = createStudyCard({
    deck_id: deckId,
    front,
    back,
    source_url: body.source_url ?? null,
    repo_path: body.repo_path ?? null,
    alignment_context_item_id: body.alignment_context_item_id ?? null,
  });
  if (result.error) {
    return NextResponse.json({ error: 'Failed to create card', detail: result.error.message }, { status: 500 });
  }
  return NextResponse.json({ card: result.data }, { status: 201 });
}
