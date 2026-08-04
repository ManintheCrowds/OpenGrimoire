export type BrainMapChunkPayload<
  TNode extends { id: string },
  TEdge extends { source: string; target: string },
  TSourceRoots = unknown,
> = {
  nodes?: TNode[];
  edges?: TEdge[];
  generated?: string;
  sessionCount?: number;
  sourceRoots?: TSourceRoots;
  fingerprint?: string;
};

export function mergeBrainMapChunks<
  TNode extends { id: string },
  TEdge extends { source: string; target: string },
  TSourceRoots = unknown,
>(
  chunks: Array<BrainMapChunkPayload<TNode, TEdge, TSourceRoots>>
): {
  nodes: TNode[];
  edges: TEdge[];
  generated: string;
  sessionCount: number;
  sourceRoots?: TSourceRoots;
} {
  let expectedFingerprint: string | null = null;
  const graph: {
    nodes: TNode[];
    edges: TEdge[];
    generated: string;
    sessionCount: number;
    sourceRoots?: TSourceRoots;
  } = { nodes: [], edges: [], generated: '', sessionCount: 0 };

  for (const chunk of chunks) {
    if (chunk.fingerprint) {
      if (expectedFingerprint && chunk.fingerprint !== expectedFingerprint) {
        throw new Error('Graph changed while loading. Refresh the context atlas and try again.');
      }
      expectedFingerprint = chunk.fingerprint;
    }

    graph.generated = chunk.generated ?? graph.generated;
    graph.sessionCount = chunk.sessionCount ?? graph.sessionCount;
    if (chunk.sourceRoots !== undefined) graph.sourceRoots = chunk.sourceRoots;
    graph.nodes.push(...(chunk.nodes ?? []));
    graph.edges.push(...(chunk.edges ?? []));
  }

  const nodeIds = new Set(graph.nodes.map((node) => node.id));
  graph.edges = graph.edges.filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target));

  return graph;
}
