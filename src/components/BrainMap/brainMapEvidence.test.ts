import { describe, expect, it } from 'vitest';
import { applyEvidenceOverlay, isClaimNode, mergeAlignmentClaimHubs } from './brainMapEvidence';
import type { BrainMapData } from './BrainMapGraph';

const base: BrainMapData = {
  nodes: [
    { id: 'a.md', group: 'memory', accessCount: 2, path: 'a.md', layer: 'state' },
    {
      id: 'claim:abc',
      group: 'memory',
      accessCount: 1,
      path: 'claim:abc',
      insight_level: 'claim',
      claim_text: 'Test claim',
      claim_cites: [{ path: 'a.md', quote: 'hello' }],
    },
  ],
  edges: [
    { source: 'a.md', target: 'b.md', weight: 1, sessionType: 'memory', sessions: ['s1'], layer: 'state' },
    { source: 'claim:abc', target: 'a.md', weight: 1, sessionType: 'evidence', sessions: ['claim'], layer: 'state' },
  ],
  generated: '2026-10-29T00:00:00Z',
  sessionCount: 1,
};

describe('applyEvidenceOverlay', () => {
  it('hides claim nodes and evidence edges when off', () => {
    const out = applyEvidenceOverlay(base, false);
    expect(out.nodes.some(isClaimNode)).toBe(false);
    expect(out.edges.some((e) => e.sessionType === 'evidence')).toBe(false);
    expect(out.nodes.some((n) => n.id === 'a.md')).toBe(true);
  });

  it('keeps claims when on', () => {
    const out = applyEvidenceOverlay(base, true);
    expect(out.nodes.some((n) => n.id === 'claim:abc')).toBe(true);
  });
});

describe('mergeAlignmentClaimHubs', () => {
  it('adds hubs only when linked_node_id is set', () => {
    const out = mergeAlignmentClaimHubs(base, [
      { id: 'row1', title: 'Align', linked_node_id: 'a.md', body: 'body quote' },
      { id: 'row2', title: 'No link', linked_node_id: null },
    ]);
    expect(out.nodes.some((n) => n.id === 'claim:alignment:row1')).toBe(true);
    expect(out.nodes.some((n) => n.id === 'claim:alignment:row2')).toBe(false);
  });
});
