import { randomUUID } from 'crypto';
import { and, asc, eq, lte } from 'drizzle-orm';
import { studyCards, studyDecks, studyReviews } from '@/db/schema';
import { getDb } from '@/db/client';
import {
  applySm2Rating,
  initialScheduleState,
  nextDueIso,
  type ReviewRating,
} from '@/lib/study/sm2';

export type StudyDeckRow = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type StudyCardRow = {
  id: string;
  deck_id: string;
  front: string;
  back: string;
  source_url: string | null;
  repo_path: string | null;
  alignment_context_item_id: string | null;
  ease: number;
  interval_days: number;
  repetitions: number;
  due_at: string;
  last_reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};

function err(e: unknown): { code: string; message: string } {
  const m = e instanceof Error ? e.message : String(e);
  return { code: 'SQLITE_ERROR', message: m };
}

export function listStudyDecks(): { data: StudyDeckRow[] | null; error: ReturnType<typeof err> | null } {
  const db = getDb();
  try {
    const rows = db.select().from(studyDecks).orderBy(asc(studyDecks.createdAt)).all();
    return {
      data: rows.map((r) => ({
        id: r.id,
        name: r.name,
        created_at: r.createdAt,
        updated_at: r.updatedAt,
      })),
      error: null,
    };
  } catch (e) {
    return { data: null, error: err(e) };
  }
}

export function createStudyDeck(name: string): { data: StudyDeckRow | null; error: ReturnType<typeof err> | null } {
  const db = getDb();
  const id = randomUUID();
  const now = new Date().toISOString();
  try {
    db.insert(studyDecks)
      .values({ id, name: name.trim() || 'Untitled', createdAt: now, updatedAt: now })
      .run();
    const row = db.select().from(studyDecks).where(eq(studyDecks.id, id)).get();
    if (!row) return { data: null, error: { code: 'NOT_FOUND', message: 'Deck not found after insert' } };
    return {
      data: {
        id: row.id,
        name: row.name,
        created_at: row.createdAt,
        updated_at: row.updatedAt,
      },
      error: null,
    };
  } catch (e) {
    return { data: null, error: err(e) };
  }
}

export function listStudyCards(
  deckId: string,
  options: { dueOnly?: boolean } = {}
): { data: StudyCardRow[] | null; error: ReturnType<typeof err> | null } {
  const db = getDb();
  const nowIso = new Date().toISOString();
  try {
    const conditions = options.dueOnly
      ? and(eq(studyCards.deckId, deckId), lte(studyCards.dueAt, nowIso))
      : eq(studyCards.deckId, deckId);
    const rows = db.select().from(studyCards).where(conditions).orderBy(asc(studyCards.dueAt)).all();
    return {
      data: rows.map((r) => ({
        id: r.id,
        deck_id: r.deckId,
        front: r.front,
        back: r.back,
        source_url: r.sourceUrl,
        repo_path: r.repoPath,
        alignment_context_item_id: r.alignmentContextItemId,
        ease: r.ease,
        interval_days: r.intervalDays,
        repetitions: r.repetitions,
        due_at: r.dueAt,
        last_reviewed_at: r.lastReviewedAt,
        created_at: r.createdAt,
        updated_at: r.updatedAt,
      })),
      error: null,
    };
  } catch (e) {
    return { data: null, error: err(e) };
  }
}

export function createStudyCard(input: {
  deck_id: string;
  front: string;
  back: string;
  source_url?: string | null;
  repo_path?: string | null;
  alignment_context_item_id?: string | null;
}): { data: StudyCardRow | null; error: ReturnType<typeof err> | null } {
  const db = getDb();
  const id = randomUUID();
  const now = new Date().toISOString();
  const init = initialScheduleState();
  try {
    db.insert(studyCards)
      .values({
        id,
        deckId: input.deck_id,
        front: input.front,
        back: input.back,
        sourceUrl: input.source_url ?? null,
        repoPath: input.repo_path ?? null,
        alignmentContextItemId: input.alignment_context_item_id ?? null,
        ease: init.ease,
        intervalDays: init.intervalDays,
        repetitions: init.repetitions,
        dueAt: now,
        lastReviewedAt: null,
        createdAt: now,
        updatedAt: now,
      })
      .run();
    const row = db.select().from(studyCards).where(eq(studyCards.id, id)).get();
    if (!row) return { data: null, error: { code: 'NOT_FOUND', message: 'Card not found after insert' } };
    return {
      data: {
        id: row.id,
        deck_id: row.deckId,
        front: row.front,
        back: row.back,
        source_url: row.sourceUrl,
        repo_path: row.repoPath,
        alignment_context_item_id: row.alignmentContextItemId,
        ease: row.ease,
        interval_days: row.intervalDays,
        repetitions: row.repetitions,
        due_at: row.dueAt,
        last_reviewed_at: row.lastReviewedAt,
        created_at: row.createdAt,
        updated_at: row.updatedAt,
      },
      error: null,
    };
  } catch (e) {
    return { data: null, error: err(e) };
  }
}

export function reviewStudyCard(
  cardId: string,
  rating: ReviewRating
): { data: StudyCardRow | null; error: ReturnType<typeof err> | null } {
  const db = getDb();
  const now = new Date();
  const nowIso = now.toISOString();
  try {
    const row = db.select().from(studyCards).where(eq(studyCards.id, cardId)).get();
    if (!row) {
      return { data: null, error: { code: 'NOT_FOUND', message: 'Card not found' } };
    }
    const prev = {
      ease: row.ease,
      intervalDays: row.intervalDays,
      repetitions: row.repetitions,
    };
    const next = applySm2Rating(prev, rating);
    const dueAt = nextDueIso(next.intervalDays, now);
    db.update(studyCards)
      .set({
        ease: next.ease,
        intervalDays: next.intervalDays,
        repetitions: next.repetitions,
        dueAt,
        lastReviewedAt: nowIso,
        updatedAt: nowIso,
      })
      .where(eq(studyCards.id, cardId))
      .run();
    db.insert(studyReviews)
      .values({
        id: randomUUID(),
        cardId,
        rating,
        reviewedAt: nowIso,
        easeAfter: next.ease,
        intervalDaysAfter: next.intervalDays,
      })
      .run();
    const updated = db.select().from(studyCards).where(eq(studyCards.id, cardId)).get();
    if (!updated) return { data: null, error: { code: 'NOT_FOUND', message: 'Card missing after review' } };
    return {
      data: {
        id: updated.id,
        deck_id: updated.deckId,
        front: updated.front,
        back: updated.back,
        source_url: updated.sourceUrl,
        repo_path: updated.repoPath,
        alignment_context_item_id: updated.alignmentContextItemId,
        ease: updated.ease,
        interval_days: updated.intervalDays,
        repetitions: updated.repetitions,
        due_at: updated.dueAt,
        last_reviewed_at: updated.lastReviewedAt,
        created_at: updated.createdAt,
        updated_at: updated.updatedAt,
      },
      error: null,
    };
  } catch (e) {
    return { data: null, error: err(e) };
  }
}
