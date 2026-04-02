import { describe, expect, it } from 'vitest';
import {
  applySm2Rating,
  DEFAULT_EASE,
  initialScheduleState,
  nextDueIso,
  type CardScheduleState,
} from './sm2';

describe('applySm2Rating', () => {
  it('again resets repetitions and lowers ease', () => {
    const prev: CardScheduleState = { ease: 2.5, intervalDays: 10, repetitions: 3 };
    const next = applySm2Rating(prev, 'again');
    expect(next.repetitions).toBe(0);
    expect(next.intervalDays).toBe(1);
    expect(next.ease).toBeLessThan(2.5);
  });

  it('good from new card uses 1 day then ramps', () => {
    const s0 = initialScheduleState();
    const g1 = applySm2Rating(s0, 'good');
    expect(g1.repetitions).toBe(1);
    expect(g1.intervalDays).toBe(1);
    const g2 = applySm2Rating(g1, 'good');
    expect(g2.repetitions).toBe(2);
    expect(g2.intervalDays).toBe(6);
  });

  it('easy on new card gives 4 days', () => {
    const s0 = initialScheduleState();
    const e = applySm2Rating(s0, 'easy');
    expect(e.intervalDays).toBe(4);
    expect(e.ease).toBeGreaterThan(DEFAULT_EASE);
  });
});

describe('nextDueIso', () => {
  it('adds interval days in UTC', () => {
    const now = new Date('2026-01-01T12:00:00.000Z');
    const due = nextDueIso(3, now);
    expect(due.startsWith('2026-01-04')).toBe(true);
  });
});
