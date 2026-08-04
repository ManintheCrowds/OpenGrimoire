import { describe, expect, it } from 'vitest';
import { mergeBrainMapChunks } from './brainMapChunks';

describe('mergeBrainMapChunks', () => {
  it('rejects chunks from different graph fingerprints', () => {
    expect(() =>
      mergeBrainMapChunks([
        {
          fingerprint: 'graph-a',
          generated: '2026-05-14T00:00:00.000Z',
          sessionCount: 1,
          nodes: [{ id: 'a' }],
          edges: [],
        },
        {
          fingerprint: 'graph-b',
          generated: '2026-05-14T00:00:01.000Z',
          sessionCount: 1,
          nodes: [{ id: 'b' }],
          edges: [{ source: 'a', target: 'b' }],
        },
      ])
    ).toThrow(/Graph changed while loading/);
  });

  it('drops dangling edges before D3 receives the graph', () => {
    const graph = mergeBrainMapChunks([
      {
        fingerprint: 'graph-a',
        generated: '2026-05-14T00:00:00.000Z',
        sessionCount: 1,
        nodes: [{ id: 'a' }],
        edges: [
          { source: 'a', target: 'a' },
          { source: 'a', target: 'missing' },
        ],
      },
    ]);

    expect(graph.edges).toEqual([{ source: 'a', target: 'a' }]);
  });
});
