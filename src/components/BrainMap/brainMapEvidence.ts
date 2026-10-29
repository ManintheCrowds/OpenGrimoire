/**
 * Evidence overlay filters for claim-level provenance on the context atlas.
 * Overlay off: hide claim hubs and evidence edges (co-access unchanged).
 */

import type { BrainMapData, BrainMapEdge, BrainMapNode } from './BrainMapGraph';

export type ClaimCite = { path: string; quote?: string; source_file?: string };

export function isClaimNode(node: BrainMapNode): boolean {
  return node.insight_level === 'claim' || Boolean((node as BrainMapNode & { claim_cites?: ClaimCite[] }).claim_cites?.length);
}

export function isEvidenceEdge(edge: BrainMapEdge): boolean {
  return edge.sessionType === 'evidence' || (edge as BrainMapEdge & { insight_level?: string }).insight_level === 'claim';
}

/** When overlay is off, drop claim nodes and evidence edges. */
export function applyEvidenceOverlay(data: BrainMapData, evidenceOverlayOn: boolean): BrainMapData {
  if (evidenceOverlayOn) {
    return data;
  }
  const nodes = data.nodes.filter((n) => !isClaimNode(n));
  const ids = new Set(nodes.map((n) => n.id));
  const edges = data.edges.filter((e) => !isEvidenceEdge(e) && ids.has(e.source) && ids.has(e.target));
  return { ...data, nodes, edges };
}

export function mergeAlignmentClaimHubs(
  data: BrainMapData,
  rows: Array<{ id: string; title?: string | null; body?: string | null; linked_node_id?: string | null }>
): BrainMapData {
  const nodes = [...data.nodes];
  const edges = [...data.edges];
  const existing = new Set(nodes.map((n) => n.id));

  for (const row of rows) {
    const linked = row.linked_node_id?.trim();
    if (!linked) continue;
    const claimId = `claim:alignment:${row.id}`;
    if (existing.has(claimId)) continue;
    const claimText = (row.title || row.body || row.id).slice(0, 240);
    const quote = (row.body || row.title || '').slice(0, 280);
    nodes.push({
      id: claimId,
      group: 'memory',
      accessCount: 1,
      path: claimId,
      layer: 'state',
      provenance: 'handoff',
      insight_level: 'claim',
      constraint: claimText,
      claim_text: claimText,
      claim_cites: [{ path: linked, quote, source_file: `alignment:${row.id}` }],
      intent_artifacts: { alignment_context_refs: [row.id] },
    } as BrainMapNode);
    existing.add(claimId);
    if (!existing.has(linked)) {
      nodes.push({
        id: linked,
        group: 'general',
        accessCount: 1,
        path: linked,
        layer: 'state',
        provenance: 'handoff',
      });
      existing.add(linked);
    }
    edges.push({
      source: claimId,
      target: linked,
      weight: 1,
      sessionType: 'evidence',
      sessions: [`alignment:${row.id}`],
      layer: 'state',
      provenance: 'handoff',
    });
  }

  return { ...data, nodes, edges };
}
