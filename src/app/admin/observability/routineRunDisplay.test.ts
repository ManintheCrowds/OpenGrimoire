import { describe, expect, it } from 'vitest';

import { routineRunListDisplay, routineRunOutcomeChipClass } from './routineRunDisplay';

describe('routineRunListDisplay', () => {
  it('returns display fields for a routine_run summary', () => {
    const d = routineRunListDisplay('routine_run', {
      agent_id: 'bot-1',
      routine_id: 'friday-raise',
      routine_name: 'Friday raise',
      fired_at: '2026-11-14T15:00:00Z',
      outcome: 'failed',
      reason: 'CI red',
    });
    expect(d).toEqual({
      agentId: 'bot-1',
      routineLabel: 'Friday raise (friday-raise)',
      outcome: 'failed',
      firedAt: '2026-11-14T15:00:00Z',
      reason: 'CI red',
    });
  });

  it('returns null for other probe types or malformed summaries', () => {
    expect(routineRunListDisplay('cursor_path_analysis', { agent_id: 'x' })).toBeNull();
    expect(routineRunListDisplay('routine_run', { agent_id: 'x' })).toBeNull();
    expect(routineRunListDisplay('routine_run', null)).toBeNull();
  });

  it('maps outcomes to chip classes', () => {
    expect(routineRunOutcomeChipClass('done')).toContain('emerald');
    expect(routineRunOutcomeChipClass('failed')).toContain('red');
    expect(routineRunOutcomeChipClass('weird')).toContain('amber');
  });
});
