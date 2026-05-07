import * as d3Force from 'd3-force';

type WorkerNode = { id: string; x?: number; y?: number };
type WorkerEdge = { source: string; target: string; weight?: number };

type WorkerMessage = {
  nodes: WorkerNode[];
  edges: WorkerEdge[];
  width: number;
  height: number;
};

self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const { nodes, edges, width, height } = event.data;
  const simNodes = nodes.map((node) => ({ ...node, x: width / 2, y: height / 2 }));
  const links = edges.map((edge) => ({
    ...edge,
    source: simNodes.find((node) => node.id === edge.source) ?? edge.source,
    target: simNodes.find((node) => node.id === edge.target) ?? edge.target,
  }));

  const simulation = d3Force
    .forceSimulation(simNodes)
    .force('link', d3Force.forceLink(links).id((d: any) => d.id).distance(80))
    .force('charge', d3Force.forceManyBody().strength(-200))
    .force('center', d3Force.forceCenter(width / 2, height / 2))
    .stop();

  for (let i = 0; i < 120; i += 1) simulation.tick();

  (self as DedicatedWorkerGlobalScope).postMessage({
    nodes: simNodes.map((node) => ({ id: node.id, x: node.x ?? 0, y: node.y ?? 0 })),
  });
};
