import { describe, expect, it } from 'vitest';
import { mergeAlignmentClaimHubs } from './brainMapEvidence';
import { brainMapTooltipHtml } from './brainMapTooltip';
import type { BrainMapData, BrainMapNode } from './BrainMapGraph';

const base: BrainMapData = {
  nodes: [{ id: 'a.md', group: 'memory', accessCount: 2, path: 'a.md', layer: 'state' }],
  edges: [],
  generated: '2026-11-09T00:00:00Z',
  sessionCount: 1,
};

const payload = '<img src=x onerror="alert(1)">';

function node(partial: Partial<BrainMapNode> & Pick<BrainMapNode, 'id' | 'path'>): BrainMapNode {
  return { group: 'memory', accessCount: 1, ...partial };
}

describe('brainMapTooltipHtml', () => {
  it('keeps the benign tooltip structure', () => {
    const html = brainMapTooltipHtml(
      node({
        id: 'n1',
        path: 'vault/notes/OpenGrimoire.md',
        group: 'core',
        accessCount: 4,
        layer: 'vault',
        affect_overlay: { concern_level: 0.5 },
      }),
    );
    expect(html).toBe(
      '<strong>vault/notes/OpenGrimoire.md</strong><br/>Group: core<br/>Access count: 4<br/>Layer: vault<br/>Concern: 0.5',
    );
  });

  it('escapes graph fields that the tooltip used to inject as HTML', () => {
    const html = brainMapTooltipHtml(
      node({
        id: 'n2',
        path: payload,
        group: '<b>',
        accessCount: 1,
        constraint: payload,
        grimoire_tags: ['<script>alert(1)</script>'],
      }),
    );
    expect(html).not.toContain('<img');
    expect(html).not.toContain('<script');
    expect(html).not.toContain('<b>');
    expect(html).toContain('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).toContain('<br/>');
  });

  it('escapes alignment titles and linked paths merged in by the evidence overlay', () => {
    const merged = mergeAlignmentClaimHubs(base, [
      { id: 'row1', title: payload, linked_node_id: payload },
    ]);
    const hub = merged.nodes.find((n) => n.id === 'claim:alignment:row1');
    const target = merged.nodes.find((n) => n.id === payload);
    expect(hub).toBeDefined();
    expect(target).toBeDefined();

    const hubHtml = brainMapTooltipHtml(hub!);
    const targetHtml = brainMapTooltipHtml(target!);
    expect(hubHtml).not.toContain('<img');
    expect(targetHtml).not.toContain('<img');
    expect(hubHtml).toContain('Constraint: &lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
    expect(targetHtml.startsWith(`<strong>&lt;img src=x onerror=&quot;alert(1)&quot;&gt;</strong>`)).toBe(true);
  });
});
