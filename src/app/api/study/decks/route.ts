import { NextResponse } from 'next/server';
import { checkAlignmentOrAdminSession } from '@/lib/alignment-context/api-auth';
import { createStudyDeck, listStudyDecks } from '@/lib/storage/repositories/study';

export async function GET(request: Request) {
  const gate = await checkAlignmentOrAdminSession(request);
  if (!gate.ok) {
    return gate.response;
  }
  const result = listStudyDecks();
  if (result.error) {
    return NextResponse.json({ error: 'Failed to list study decks', detail: result.error.message }, { status: 500 });
  }
  return NextResponse.json({ decks: result.data ?? [] }, { headers: { 'Cache-Control': 'private, no-store' } });
}

export async function POST(request: Request) {
  const gate = await checkAlignmentOrAdminSession(request);
  if (!gate.ok) {
    return gate.response;
  }
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const body = json as { name?: string };
  const name = typeof body.name === 'string' ? body.name : '';
  if (!name.trim()) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }
  const result = createStudyDeck(name);
  if (result.error) {
    return NextResponse.json({ error: 'Failed to create deck', detail: result.error.message }, { status: 500 });
  }
  return NextResponse.json({ deck: result.data }, { status: 201 });
}
