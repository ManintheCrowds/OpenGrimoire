import { NextResponse } from 'next/server';
import { checkAlignmentOrAdminSession } from '@/lib/alignment-context/api-auth';
import { reviewStudyCard } from '@/lib/storage/repositories/study';
import type { ReviewRating } from '@/lib/study/sm2';

type RouteParams = { params: { cardId: string } };

const RATINGS: ReviewRating[] = ['again', 'hard', 'good', 'easy'];

export async function POST(request: Request, context: RouteParams) {
  const gate = await checkAlignmentOrAdminSession(request);
  if (!gate.ok) {
    return gate.response;
  }
  const { cardId } = context.params;
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const body = json as { rating?: string };
  const rating = body.rating;
  if (typeof rating !== 'string' || !RATINGS.includes(rating as ReviewRating)) {
    return NextResponse.json({ error: 'rating must be one of: again, hard, good, easy' }, { status: 400 });
  }
  const result = reviewStudyCard(cardId, rating as ReviewRating);
  if (result.error) {
    const status = result.error.code === 'NOT_FOUND' ? 404 : 500;
    return NextResponse.json({ error: result.error.message }, { status });
  }
  return NextResponse.json({ card: result.data });
}
