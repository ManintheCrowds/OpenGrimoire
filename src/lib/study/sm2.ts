/**
 * Simplified SM-2–style scheduling for study cards (single deck per card).
 * Ratings map to interval/ease updates suitable for local SRS before optional Anki export.
 */

export type ReviewRating = 'again' | 'hard' | 'good' | 'easy';

export type CardScheduleState = {
  ease: number;
  intervalDays: number;
  repetitions: number;
};

const MIN_EASE = 1.3;
export const DEFAULT_EASE = 2.5;

/** Initial scheduling state for a newly created card (due immediately). */
export function initialScheduleState(): CardScheduleState {
  return {
    ease: DEFAULT_EASE,
    intervalDays: 0,
    repetitions: 0,
  };
}

/**
 * Compute next schedule from previous state and rating.
 * `now` is used only to build due timestamps in {@link nextDueIso}.
 */
export function applySm2Rating(prev: CardScheduleState, rating: ReviewRating): CardScheduleState {
  let ease = prev.ease;
  let interval = prev.intervalDays;
  const reps = prev.repetitions;

  if (rating === 'again') {
    return {
      ease: Math.max(MIN_EASE, ease - 0.2),
      intervalDays: 1,
      repetitions: 0,
    };
  }

  if (rating === 'hard') {
    const nextInterval = Math.max(1, Math.round(interval * 0.8 || 1));
    return {
      ease: Math.max(MIN_EASE, ease - 0.15),
      intervalDays: nextInterval,
      repetitions: reps,
    };
  }

  if (rating === 'good') {
    let nextInterval: number;
    let nextReps = reps + 1;
    if (reps === 0) {
      nextInterval = 1;
    } else if (reps === 1) {
      nextInterval = 6;
    } else {
      nextInterval = Math.max(1, Math.round(interval * ease));
    }
    return {
      ease,
      intervalDays: nextInterval,
      repetitions: nextReps,
    };
  }

  // easy
  ease = ease + 0.15;
  let nextInterval: number;
  let nextReps = reps + 1;
  if (reps === 0) {
    nextInterval = 4;
  } else {
    nextInterval = Math.max(1, Math.round((interval || 1) * ease * 1.3));
  }
  return {
    ease,
    intervalDays: nextInterval,
    repetitions: nextReps,
  };
}

export function nextDueIso(intervalDays: number, now: Date): string {
  const d = new Date(now);
  d.setUTCDate(d.getUTCDate() + intervalDays);
  return d.toISOString();
}
