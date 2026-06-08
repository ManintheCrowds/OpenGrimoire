import { describe, expect, it } from 'vitest';

import {
  aggregateExperiments,
  getAutoresearchExperimentDetail,
  latestPolicyTrace,
  readAutoresearchEvents,
  type AutoresearchEvent,
} from './events';

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
    event: 'merge_applied',
    ts: '2026-06-07T00:00:00Z',
    experiment_id: '2026-06-06-foam-pkm',
    asset: 'foam-pkm',
    branch: 'autoresearch/2026-06-06-foam-pkm',
    pass: true,
    source: 'ci',
    github: { pr: 17, compare_url: 'https://github.com/example/MiscRepos/pull/17' },
  },
];

describe('readAutoresearchEvents', () => {
  it('returns bootstrap panel when events log is missing', () => {
    const panel = readAutoresearchEvents({
      cwd: 'C:/repo/OpenGrimoire',
      existsSync: () => false,
      readFileSync: () => '',
    });

    expect(panel.panel).toBe('autoresearch-experiments');
    expect(panel.experiments).toHaveLength(0);
    expect(panel.events[0].experiment_id).toBe('bootstrap');
    expect(panel.panel_enabled).toBe(true);
  });

  it('sets panel_enabled false when OG_AUTORESEARCH_PANEL=0', () => {
    const panel = readAutoresearchEvents({
      cwd: 'C:/repo/OpenGrimoire',
      env: { OG_AUTORESEARCH_PANEL: '0' },
      existsSync: () => false,
      readFileSync: () => '',
    });

    expect(panel.panel_enabled).toBe(false);
  });

  it('reads valid JSONL and skips malformed lines', () => {
    const panel = readAutoresearchEvents({
      cwd: 'C:/repo/OpenGrimoire',
      env: { OPENGRIMOIRE_AUTORESEARCH_EVENTS_LOG: 'C:/data/autoresearch_events.jsonl' },
      existsSync: (p) => String(p).endsWith('autoresearch_events.jsonl'),
      readFileSync: () =>
        [
          JSON.stringify(foamEvents[0]),
          'bad-line',
          JSON.stringify(foamEvents[1]),
        ].join('\n'),
    });

    expect(panel.skippedMalformedLines).toBe(1);
    expect(panel.events).toHaveLength(2);
    expect(panel.experiments).toHaveLength(1);
    expect(panel.experiments[0].latest_metric).toBe('5/5');
  });
});

describe('aggregateExperiments', () => {
  it('derives merged status from merge_applied', () => {
    const summaries = aggregateExperiments(foamEvents);
    expect(summaries[0].status).toBe('merged');
    expect(summaries[0].github_compare_url).toContain('/pull/17');
  });
});

describe('latestPolicyTrace', () => {
  it('returns newest policy event', () => {
    const trace = latestPolicyTrace(foamEvents);
    expect(trace?.event).toBe('merge_applied');
    expect(trace?.pass).toBe(true);
  });
});

describe('getAutoresearchExperimentDetail', () => {
  it('returns chronological events and policy predicates', () => {
    const detail = getAutoresearchExperimentDetail('2026-06-06-foam-pkm', {
      cwd: 'C:/repo/OpenGrimoire',
      env: {
        OPENGRIMOIRE_AUTORESEARCH_EVENTS_LOG: 'C:/data/autoresearch_events.jsonl',
        AUTORESEARCH_AUTO_MERGE: '1',
      },
      existsSync: (p) => String(p).endsWith('autoresearch_events.jsonl'),
      readFileSync: (p) => {
        if (String(p).endsWith('autoresearch_events.jsonl')) {
          return foamEvents.map((e) => JSON.stringify(e)).join('\n');
        }
        return '';
      },
    });

    expect(detail.experiment?.experiment_id).toBe('2026-06-06-foam-pkm');
    expect(detail.events[0].event).toBe('experiment_started');
    expect(detail.events[detail.events.length - 1].event).toBe('merge_applied');
    expect(detail.policy_predicates.length).toBe(7);
    expect(detail.mutable_asset_diff.path).toContain('foam-pkm/SKILL.md');
  });
});
