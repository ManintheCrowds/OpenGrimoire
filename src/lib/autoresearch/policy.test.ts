import { describe, expect, it } from 'vitest';

import type { AutoresearchEvent } from './events';
import {
  computeMutableAssetDiff,
  evaluatePolicyPredicates,
  isKillSwitchBlocked,
  readEvalRunsJsonl,
  resolveHarnessRoot,
} from './policy';

const foamEvents: AutoresearchEvent[] = [
  {
    event: 'experiment_started',
    ts: '2026-06-06T12:30:00Z',
    experiment_id: '2026-06-06-foam-pkm',
    asset: 'foam-pkm',
    branch: 'autoresearch/2026-06-06-foam-pkm',
    source: 'initialize',
  },
  {
    event: 'tier_b_complete',
    ts: '2026-06-06T20:30:00Z',
    experiment_id: '2026-06-06-foam-pkm',
    asset: 'foam-pkm',
    branch: 'autoresearch/2026-06-06-foam-pkm',
    metric: '5/5',
    pass: true,
    source: 'agent',
  },
  {
    event: 'critic_scored',
    ts: '2026-06-06T20:30:30Z',
    experiment_id: '2026-06-06-foam-pkm',
    asset: 'foam-pkm',
    branch: 'autoresearch/2026-06-06-foam-pkm',
    pass: true,
    source: 'agent',
  },
  {
    event: 'merge_blocked',
    ts: '2026-06-06T20:31:00Z',
    experiment_id: '2026-06-06-foam-pkm',
    asset: 'foam-pkm',
    branch: 'autoresearch/2026-06-06-foam-pkm',
    pass: false,
    source: 'policy',
    detail: 'Failed: auto_merge_enabled',
  },
];

describe('resolveHarnessRoot', () => {
  it('derives repo root from events log path', () => {
    const root = resolveHarnessRoot(
      {},
      'C:/Users/Dell/Documents/GitHub/MiscRepos/.cursor/state/autoresearch_events.jsonl'
    );
    expect(root).toBe('C:/Users/Dell/Documents/GitHub/MiscRepos');
  });

  it('prefers OPENGRIMOIRE_HARNESS_ROOT', () => {
    const root = resolveHarnessRoot(
      { OPENGRIMOIRE_HARNESS_ROOT: 'D:/harness' },
      'C:/any/path/.cursor/state/autoresearch_events.jsonl'
    );
    expect(root).toBe('D:/harness');
  });
});

describe('readEvalRunsJsonl', () => {
  it('parses eval rows from sibling path', () => {
    const rows = readEvalRunsJsonl({
      eventsLogPath: 'C:/repo/.cursor/state/autoresearch_events.jsonl',
      existsSync: (p) => String(p).endsWith('eval_runs.jsonl'),
      readFileSync: () =>
        JSON.stringify({
          suite: 'foam-pkm-autoresearch-tier-b',
          pass: true,
          ts: '2026-06-06T20:30:00Z',
        }),
    });
    expect(rows).toHaveLength(1);
    expect(rows[0].suite).toBe('foam-pkm-autoresearch-tier-b');
  });
});

describe('computeMutableAssetDiff', () => {
  it('returns unavailable without harness root', () => {
    const diff = computeMutableAssetDiff(null, 'autoresearch/x', 'foam-pkm');
    expect(diff.available).toBe(false);
  });

  it('counts diff lines when git succeeds', () => {
    const diff = computeMutableAssetDiff(
      'C:/repo',
      'autoresearch/2026-06-06-foam-pkm',
      'foam-pkm',
      150,
      () => '+line1\n+line2\n'
    );
    expect(diff.available).toBe(true);
    expect(diff.line_count).toBe(2);
    expect(diff.bounded).toBe(true);
  });
});

describe('evaluatePolicyPredicates', () => {
  it('marks tier_b and critic pass from jsonl', () => {
    const result = evaluatePolicyPredicates(foamEvents, {
      env: { AUTORESEARCH_AUTO_MERGE: '1' },
      eventsLogPath: 'C:/repo/.cursor/state/autoresearch_events.jsonl',
      existsSync: () => false,
      execGit: () => '',
    });
    const tierB = result.predicates.find((p) => p.id === 'tier_b_pass');
    const critic = result.predicates.find((p) => p.id === 'critic_pass');
    expect(tierB?.pass).toBe(true);
    expect(critic?.pass).toBe(true);
  });

  it('marks auto_merge_enabled false when kill switch on', () => {
    const result = evaluatePolicyPredicates(foamEvents, {
      env: { AUTORESEARCH_AUTO_MERGE: '0' },
      eventsLogPath: 'C:/repo/.cursor/state/autoresearch_events.jsonl',
      existsSync: () => false,
      execGit: () => '',
    });
    const autoMerge = result.predicates.find((p) => p.id === 'auto_merge_enabled');
    expect(autoMerge?.pass).toBe(false);
  });

  it('marks ci_green as external with null pass', () => {
    const result = evaluatePolicyPredicates(foamEvents, {
      env: {},
      eventsLogPath: 'C:/repo/.cursor/state/autoresearch_events.jsonl',
      existsSync: () => false,
      execGit: () => '',
    });
    const ci = result.predicates.find((p) => p.id === 'ci_green');
    expect(ci?.pass).toBeNull();
    expect(ci?.source).toBe('external');
  });

  it('sets kill_switch_blocked when merge_blocked cites auto_merge_enabled', () => {
    const result = evaluatePolicyPredicates(foamEvents, {
      env: { AUTORESEARCH_AUTO_MERGE: '0' },
      eventsLogPath: 'C:/repo/.cursor/state/autoresearch_events.jsonl',
      existsSync: () => false,
      execGit: () => '',
    });
    expect(result.kill_switch_blocked).toBe(true);
  });
});

describe('isKillSwitchBlocked', () => {
  it('true only for merge_blocked + kill switch + auto_merge in failures', () => {
    expect(
      isKillSwitchBlocked(
        {
          event: 'merge_blocked',
          ts: 't',
          pass: false,
          detail: 'Failed: auto_merge_enabled',
        },
        false,
        ['auto_merge_enabled']
      )
    ).toBe(true);
    expect(
      isKillSwitchBlocked(
        { event: 'merge_blocked', ts: 't', pass: false, detail: 'Failed: tier_b_pass' },
        false,
        ['tier_b_pass']
      )
    ).toBe(false);
  });
});
