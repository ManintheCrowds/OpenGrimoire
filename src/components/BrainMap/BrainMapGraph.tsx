'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as d3Force from 'd3-force';
import { select, zoom, drag } from 'd3';

const GROUP_COLORS: Record<string, string> = {
  core: '#c8a84b',
  memory: '#a78bfa',
  publishing: '#22c55e',
  tools: '#60a5fa',
  skills: '#f97316',
  general: '#6b7280',
};

const SESSION_COLORS: Record<string, string> = {
  strategy: '#c8a84b',
  memory: '#a78bfa',
  publishing: '#22c55e',
  infrastructure: '#60a5fa',
  research: '#f97316',
  general: '#6b7280',
};

export type BrainMapLayer = 'state' | 'vault';
export type BrainMapNodeSource = 'handoff' | 'vault' | 'git';
export type BrainMapRiskTier = 'low' | 'medium' | 'high' | 'critical';
export type BrainMapReviewStatus = 'draft' | 'reviewed' | 'stale';

export interface BrainMapNode {
  id: string;
  group: string;
  accessCount: number;
  path: string;
  /** State (.cursor) vs vault (markdown vault) slice for UI filtering */
  layer?: BrainMapLayer;
  /** Optional: human-readable constraint or decision bound to this artifact */
  constraint?: string;
  /** Optional: provenance category (avoids clashing with edge endpoint `source`) */
  provenance?: BrainMapNodeSource;
  risk_tier?: BrainMapRiskTier;
  review_status?: BrainMapReviewStatus;
  /** OpenGrimoire / TrustGraph optional overlays (see BRAIN_MAP_SCHEMA.md) */
  trust_score?: number;
  compass_axis?: string;
  grimoire_tags?: string[];
  insight_level?: string;
  affect_overlay?: BrainMapAffectOverlay;
  intent_artifacts?: BrainMapIntentArtifacts;
}

export interface BrainMapEdge {
  source: string;
  target: string;
  weight: number;
  sessionType: string;
  sessions: string[];
  layer?: BrainMapLayer;
  constraint?: string;
  provenance?: BrainMapNodeSource;
  risk_tier?: BrainMapRiskTier;
  review_status?: BrainMapReviewStatus;
  affect_by_session?: Record<string, BrainMapAffectOverlay>;
  intent_artifacts_by_session?: Record<string, BrainMapIntentArtifacts>;
}

export interface BrainMapSourceRoot {
  path: string;
  label: string;
}

export interface BrainMapData {
  nodes: BrainMapNode[];
  edges: BrainMapEdge[];
  generated: string;
  sessionCount: number;
  /** Present when build merged multiple state dirs (see build_brain_map.py). */
  sourceRoots?: BrainMapSourceRoot[];
}

type GraphNode = BrainMapNode & d3Force.SimulationNodeDatum;
type GraphLink = Omit<BrainMapEdge, 'source' | 'target'> & d3Force.SimulationLinkDatum<GraphNode>;
type AffectMetricKey =
  | 'concern_level'
  | 'need_urgency'
  | 'accomplishment_momentum'
  | 'unresolved_question_count'
  | 'confidence_drift';
type AffectOverlayMode = 'off' | AffectMetricKey;

export interface BrainMapAffectOverlay {
  concern_level?: number;
  need_urgency?: number;
  accomplishment_momentum?: number;
  unresolved_question_count?: number;
  confidence_drift?: number;
}

export interface BrainMapIntentArtifacts {
  survey_refs?: string[];
  clarification_refs?: string[];
  alignment_context_refs?: string[];
  session_refs?: string[];
}

const EMPTY_GRAPH: BrainMapData = {
  nodes: [
    {
      id: 'handoff_latest.md',
      group: 'memory',
      accessCount: 1,
      path: 'handoff_latest.md',
      layer: 'state',
    },
    {
      id: '.cursor/state/README.md',
      group: 'memory',
      accessCount: 1,
      path: '.cursor/state/README.md',
      layer: 'state',
    },
    {
      id: 'docs/plans/ai_visualization_research_and_improvement_60cdf735.plan.md',
      group: 'publishing',
      accessCount: 1,
      path: 'docs/plans/ai_visualization_research_and_improvement_60cdf735.plan.md',
      layer: 'state',
    },
  ],
  edges: [
    {
      source: 'handoff_latest.md',
      target: '.cursor/state/README.md',
      weight: 1,
      sessionType: 'general',
      sessions: ['handoff'],
      layer: 'state',
    },
    {
      source: 'handoff_latest.md',
      target: 'docs/plans/ai_visualization_research_and_improvement_60cdf735.plan.md',
      weight: 1,
      sessionType: 'general',
      sessions: ['handoff'],
      layer: 'state',
    },
  ],
  generated: new Date().toISOString(),
  sessionCount: 1,
};

type LayerFilter = 'all' | BrainMapLayer;

function nodeLayer(n: BrainMapNode): BrainMapLayer {
  return n.layer === 'vault' ? 'vault' : 'state';
}

/** Which optional OpenGrimoire columns to show when at least one visible node carries data. */
function openGrimoireTableFlags(nodes: BrainMapNode[]) {
  return {
    trust_score: nodes.some((n) => typeof n.trust_score === 'number'),
    compass_axis: nodes.some((n) => typeof n.compass_axis === 'string' && n.compass_axis.length > 0),
    grimoire_tags: nodes.some((n) => Array.isArray(n.grimoire_tags)),
    insight_level: nodes.some((n) => typeof n.insight_level === 'string' && n.insight_level.length > 0),
  };
}

function formatGrimoireTags(tags: string[] | undefined): string {
  if (!tags?.length) return '—';
  return tags.join(', ');
}

function normalizeMetricValue(
  metric: AffectMetricKey,
  value: number | undefined,
  maxUnresolvedQuestions: number
): number | null {
  if (typeof value !== 'number') return null;
  if (metric === 'confidence_drift') return Math.max(0, Math.min(1, Math.abs(value)));
  if (metric === 'unresolved_question_count') {
    const bound = Math.max(1, maxUnresolvedQuestions);
    return Math.max(0, Math.min(1, value / bound));
  }
  return Math.max(0, Math.min(1, value));
}

function metricLabel(metric: AffectMetricKey): string {
  return metric.replaceAll('_', ' ');
}

function hasAffectSignals(node: BrainMapNode): boolean {
  const aff = node.affect_overlay;
  if (!aff) return false;
  return (
    typeof aff.concern_level === 'number' ||
    typeof aff.need_urgency === 'number' ||
    typeof aff.accomplishment_momentum === 'number' ||
    typeof aff.unresolved_question_count === 'number' ||
    typeof aff.confidence_drift === 'number'
  );
}

function hasIntentArtifacts(node: BrainMapNode): boolean {
  const refs = node.intent_artifacts;
  if (!refs) return false;
  return Boolean(
    refs.survey_refs?.length || refs.clarification_refs?.length || refs.alignment_context_refs?.length || refs.session_refs?.length
  );
}

function filterGraphByLayer(data: BrainMapData, layer: LayerFilter): BrainMapData {
  if (layer === 'all') return data;
  const ids = new Set(data.nodes.filter((n) => nodeLayer(n) === layer).map((n) => n.id));
  return {
    ...data,
    nodes: data.nodes.filter((n) => ids.has(n.id)),
    edges: data.edges.filter((e) => ids.has(e.source) && ids.has(e.target)),
  };
}

type ViewMode = 'graph' | 'table';

export default function BrainMapGraph() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [data, setData] = useState<BrainMapData | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('graph');
  const [layerFilter, setLayerFilter] = useState<LayerFilter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [affectOverlayMode, setAffectOverlayMode] = useState<AffectOverlayMode>('off');
  const [affectFilterOnly, setAffectFilterOnly] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  /** True when API returned 200 but no nodes (empty build); UI shows placeholder graph — use All/State layer, or rebuild JSON. */
  const [placeholderFromEmptyApi, setPlaceholderFromEmptyApi] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const headers: HeadersInit = {};
    // Legacy: optional obfuscation token in bundle — prefer operator login + session for gated graphs.
    if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_BRAIN_MAP_SECRET) {
      headers['x-brain-map-key'] = process.env.NEXT_PUBLIC_BRAIN_MAP_SECRET;
    }
    setLoading(true);
    setError(null);
    const url = `/api/brain-map/graph?cb=${Date.now()}`;
    fetch(url, { headers, credentials: 'include', cache: 'no-store' })
      .then((res) => {
        return res.ok ? res.json() : Promise.reject(new Error(`${res.status} ${res.statusText}`));
      })
      .then((graph: BrainMapData) => {
        if (cancelled) return;
        if (graph.nodes?.length > 0) {
          setPlaceholderFromEmptyApi(false);
          setData(graph);
        } else {
          setPlaceholderFromEmptyApi((graph.sessionCount ?? 0) === 0);
          setData(EMPTY_GRAPH);
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : 'Failed to load graph';
        setError(msg);
        setPlaceholderFromEmptyApi(false);
        setData(EMPTY_GRAPH);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const filteredData = useMemo(() => {
    if (!data) return null;
    const byLayer = filterGraphByLayer(data, layerFilter);
    if (!affectFilterOnly) return byLayer;
    const ids = new Set(byLayer.nodes.filter(hasAffectSignals).map((n) => n.id));
    return {
      ...byLayer,
      nodes: byLayer.nodes.filter((n) => ids.has(n.id)),
      edges: byLayer.edges.filter((e) => ids.has(e.source) && ids.has(e.target)),
    };
  }, [data, layerFilter, affectFilterOnly]);

  const maxUnresolvedQuestions = useMemo(
    () =>
      Math.max(
        1,
        ...(filteredData?.nodes.map((n) => n.affect_overlay?.unresolved_question_count ?? 0) ?? [1])
      ),
    [filteredData]
  );

  const dataSourceSummary = useMemo(() => {
    if (!data) return null;
    const generated = data.generated ? new Date(data.generated) : null;
    const sourceRoots = data.sourceRoots?.filter((root) => root.path || root.label) ?? [];
    const vaultRoots = sourceRoots.filter((root) => /vault|obsidian|arc[_-]?forge/i.test(`${root.label} ${root.path}`));
    return {
      generatedLabel:
        generated && !Number.isNaN(generated.getTime()) ? generated.toLocaleString() : data.generated || 'unknown',
      nodeCount: data.nodes.length,
      edgeCount: data.edges.length,
      sourceRoots,
      vaultRootCount: vaultRoots.length,
    };
  }, [data]);

  const renderGraph = useCallback(() => {
    if (!svgRef.current || !filteredData) return;

    const width = svgRef.current.clientWidth || 800;
    const height = svgRef.current.clientHeight || 600;

    select(svgRef.current).selectAll('*').remove();

    const nodes: GraphNode[] = filteredData.nodes.map((n) => ({ ...n, x: 0, y: 0 }));
    const links: GraphLink[] = filteredData.edges.map((e) => ({
      ...e,
      source: nodes.find((nn) => nn.id === e.source) ?? e.source,
      target: nodes.find((nn) => nn.id === e.target) ?? e.target,
    }));

    const simulation = d3Force
      .forceSimulation(nodes)
      .force(
        'link',
        d3Force.forceLink<GraphNode, GraphLink>(links).id((d) => d.id).distance(80)
      )
      .force('charge', d3Force.forceManyBody().strength(-200))
      .force('center', d3Force.forceCenter(width / 2, height / 2));

    const svg = select(svgRef.current);
    const g = svg.append('g');

    const zoomHandler = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 4])
      .on('zoom', (event) => g.attr('transform', event.transform));
    svg.call(zoomHandler);

    const link = g
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', (d) => SESSION_COLORS[d.sessionType] ?? '#6b7280')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', (d) => Math.min(4, 1 + d.weight * 0.5));

    const node = g
      .append('g')
      .attr('class', 'nodes')
      .selectAll<SVGCircleElement, GraphNode>('circle')
      .data(nodes)
      .join('circle')
      .attr('r', (d) => {
        const base = 4 + Math.min(d.accessCount, 8);
        if (affectOverlayMode === 'off') return base;
        const norm = normalizeMetricValue(
          affectOverlayMode,
          d.affect_overlay?.[affectOverlayMode],
          maxUnresolvedQuestions
        );
        if (norm === null) return base;
        return base + norm * 8;
      })
      .attr('fill', (d) => {
        if (affectOverlayMode === 'off') return GROUP_COLORS[d.group] ?? '#6b7280';
        const norm = normalizeMetricValue(
          affectOverlayMode,
          d.affect_overlay?.[affectOverlayMode],
          maxUnresolvedQuestions
        );
        if (norm === null) return '#9ca3af';
        return `rgb(${Math.round(34 + norm * 190)}, ${Math.round(197 - norm * 90)}, ${Math.round(94 - norm * 60)})`;
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .style('cursor', 'pointer')
      .call(
        drag<SVGCircleElement, (typeof nodes)[0]>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      )
      .on('click', (event, d) => {
        event.stopPropagation();
        setSelectedNodeId(d.id);
      });

    const labels = g
      .append('g')
      .attr('class', 'labels')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .attr('font-size', 10)
      .attr('dx', 8)
      .attr('dy', 4)
      .text((d) => d.id.split('/').pop() ?? d.id)
      .style('pointer-events', 'none')
      .style('opacity', 0.9);

    select('.brain-map-tooltip').remove();
    const tooltip = select('body').append('div').attr('class', 'brain-map-tooltip').style('position', 'absolute').style('visibility', 'hidden').style('background', 'rgba(0,0,0,0.8)').style('color', '#fff').style('padding', '8px 12px').style('border-radius', '4px').style('font-size', '12px').style('z-index', '9999').style('pointer-events', 'none');

    node
      .on('mouseover', (event, d) => {
        const extra: string[] = [];
        if (d.layer) extra.push(`Layer: ${d.layer}`);
        if (d.constraint) extra.push(`Constraint: ${d.constraint}`);
        if (d.provenance) extra.push(`Provenance: ${d.provenance}`);
        if (d.risk_tier) extra.push(`Risk: ${d.risk_tier}`);
        if (d.review_status) extra.push(`Review: ${d.review_status}`);
        if (typeof d.trust_score === 'number') extra.push(`Trust: ${d.trust_score}`);
        if (d.compass_axis) extra.push(`Axis: ${d.compass_axis}`);
        if (d.grimoire_tags?.length) extra.push(`Tags: ${d.grimoire_tags.join(', ')}`);
        if (d.insight_level) extra.push(`Insight: ${d.insight_level}`);
        if (d.affect_overlay) {
          if (typeof d.affect_overlay.concern_level === 'number') extra.push(`Concern: ${d.affect_overlay.concern_level}`);
          if (typeof d.affect_overlay.need_urgency === 'number') extra.push(`Urgency: ${d.affect_overlay.need_urgency}`);
          if (typeof d.affect_overlay.accomplishment_momentum === 'number')
            extra.push(`Momentum: ${d.affect_overlay.accomplishment_momentum}`);
          if (typeof d.affect_overlay.unresolved_question_count === 'number')
            extra.push(`Unresolved Q: ${d.affect_overlay.unresolved_question_count}`);
          if (typeof d.affect_overlay.confidence_drift === 'number')
            extra.push(`Confidence drift: ${d.affect_overlay.confidence_drift}`);
        }
        const tail = extra.length ? `<br/>${extra.join('<br/>')}` : '';
        tooltip
          .style('visibility', 'visible')
          .html(
            `<strong>${d.path}</strong><br/>Group: ${d.group}<br/>Access count: ${d.accessCount}${tail}`
          );
      })
      .on('mousemove', (event) => {
        tooltip.style('top', `${event.pageY + 10}px`).style('left', `${event.pageX + 10}px`);
      })
      .on('mouseout', () => tooltip.style('visibility', 'hidden'));

    simulation.on('tick', () => {
      link
        .attr('x1', (d) => (d.source as GraphNode).x ?? 0)
        .attr('y1', (d) => (d.source as GraphNode).y ?? 0)
        .attr('x2', (d) => (d.target as GraphNode).x ?? 0)
        .attr('y2', (d) => (d.target as GraphNode).y ?? 0);
      node.attr('cx', (d) => d.x ?? 0).attr('cy', (d) => d.y ?? 0);
      labels.attr('x', (d) => d.x ?? 0).attr('y', (d) => d.y ?? 0);
    });

    return () => tooltip.remove();
  }, [filteredData, affectOverlayMode, maxUnresolvedQuestions]);

  useEffect(() => {
    renderGraph();
  }, [renderGraph]);

  const sortedNodes = useMemo(
    () => [...(filteredData?.nodes ?? [])].sort((a, b) => b.accessCount - a.accessCount),
    [filteredData]
  );
  const ogCols = useMemo(() => openGrimoireTableFlags(sortedNodes), [sortedNodes]);
  const showAffectCols = useMemo(() => sortedNodes.some(hasAffectSignals), [sortedNodes]);
  const selectedNode = useMemo(
    () => sortedNodes.find((node) => node.id === selectedNodeId) ?? null,
    [sortedNodes, selectedNodeId]
  );
  const connectedEdges = useMemo(
    () =>
      selectedNode
        ? (filteredData?.edges ?? []).filter((edge) => edge.source === selectedNode.id || edge.target === selectedNode.id)
        : [],
    [filteredData, selectedNode]
  );

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading brain map...</p>
      </div>
    );
  }

  const layerFilterEmpty =
    Boolean(data && data.nodes.length > 0 && filteredData && filteredData.nodes.length === 0);

  return (
    <div className="flex h-full min-h-0 w-full max-w-full flex-col bg-gray-50">
      <div className="min-w-0 shrink-0 border-b bg-white px-3 py-2 sm:px-4">
        <h1 className="text-base font-semibold text-gray-900 sm:text-lg">OpenGrimoire — Context Atlas</h1>
        <p className="text-xs text-gray-600 sm:text-sm">
          A generated map of handoffs, state files, and vault notes. Sync Session submissions go to SQLite; this
          atlas updates only after rebuilding the brain-map JSON with the sibling{' '}
          <code className="rounded bg-gray-100 px-1">MiscRepos/.cursor/scripts/build_brain_map.py</code> script.
        </p>
        {dataSourceSummary && (
          <div className="mt-2 rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <span>
                <strong>Generated:</strong> {dataSourceSummary.generatedLabel}
              </span>
              <span>
                <strong>Nodes:</strong> {dataSourceSummary.nodeCount}
              </span>
              <span>
                <strong>Edges:</strong> {dataSourceSummary.edgeCount}
              </span>
              <span>
                <strong>Source roots:</strong> {dataSourceSummary.sourceRoots.length || 'none listed'}
              </span>
              <span>
                <strong>Vault roots:</strong> {dataSourceSummary.vaultRootCount || 'not detected'}
              </span>
            </div>
            {dataSourceSummary.sourceRoots.length > 0 && (
              <p className="mt-1 truncate">
                {dataSourceSummary.sourceRoots.map((root) => root.label || root.path).join(' / ')}
              </p>
            )}
          </div>
        )}
        {error && (
          <p className="mt-2 text-sm text-amber-800" role="alert">
            Could not load graph from API ({error}). Showing a placeholder map. Check the generated JSON file,
            `BRAIN_MAP_SECRET`, and the `/api/brain-map/graph` route.
          </p>
        )}
        {placeholderFromEmptyApi && (
          <p
            className="mt-2 text-sm text-slate-700"
            data-testid="brain-map-placeholder-hint"
            role="status"
          >
            Placeholder map — the API returned no nodes (<code className="rounded bg-gray-100 px-1">sessionCount: 0</code>).
            Rebuild <code className="rounded bg-gray-100 px-1">brain-map-graph.local.json</code> after configuring{' '}
            <code className="rounded bg-gray-100 px-1">CURSOR_STATE_DIRS</code> for handoffs and{' '}
            <code className="rounded bg-gray-100 px-1">BRAIN_MAP_VAULT_ROOTS</code> for Arc_Forge/ObsidianVault.
            Archived handoffs are included when the configured state root contains{' '}
            <code className="rounded bg-gray-100 px-1">handoff_archive/*.md</code>.
          </p>
        )}
        {layerFilterEmpty && (
          <p className="mt-2 text-sm text-gray-600" role="status">
            No nodes in this layer for the current filter. Choose <strong>All</strong> or another layer.
          </p>
        )}
        <div
          className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-2 sm:gap-y-2"
          role="tablist"
          aria-label="View mode"
        >
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'graph'}
              aria-controls="brain-map-graph-panel"
              id="tab-graph"
              onClick={() => setViewMode('graph')}
              className={`min-h-[40px] rounded px-3 py-2 text-sm font-medium sm:min-h-0 sm:py-1 ${
                viewMode === 'graph' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Graph
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'table'}
              aria-controls="brain-map-table-panel"
              id="tab-table"
              onClick={() => setViewMode('table')}
              className={`min-h-[40px] rounded px-3 py-2 text-sm font-medium sm:min-h-0 sm:py-1 ${
                viewMode === 'table' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Table
            </button>
            <span className="hidden text-gray-300 sm:inline" aria-hidden>
              |
            </span>
            <span className="w-full text-xs font-medium uppercase tracking-wide text-gray-500 sm:w-auto">Affect overlay</span>
            <select
              aria-label="Affect overlay metric"
              value={affectOverlayMode}
              onChange={(event) => setAffectOverlayMode(event.target.value as AffectOverlayMode)}
              className="min-h-[40px] rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700"
            >
              <option value="off">Off</option>
              <option value="concern_level">Concern level</option>
              <option value="need_urgency">Need urgency</option>
              <option value="accomplishment_momentum">Accomplishment momentum</option>
              <option value="unresolved_question_count">Unresolved question count</option>
              <option value="confidence_drift">Confidence drift</option>
            </select>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={affectFilterOnly}
                onChange={(event) => setAffectFilterOnly(event.target.checked)}
                data-testid="affect-filter-checkbox"
              />
              Show affect-only
            </label>
            <span className="w-full text-xs font-medium uppercase tracking-wide text-gray-500 sm:w-auto">Layer</span>
            {(['all', 'state', 'vault'] as const).map((lf) => (
              <button
                key={lf}
                type="button"
                role="tab"
                aria-selected={layerFilter === lf}
                onClick={() => setLayerFilter(lf)}
                className={`min-h-[40px] rounded px-3 py-2 text-sm font-medium sm:min-h-0 sm:py-1 ${
                  layerFilter === lf ? 'bg-slate-200 text-slate-900' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {lf === 'all' ? 'All' : lf === 'state' ? 'State' : 'Vault'}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="w-full min-h-[44px] rounded border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 sm:ml-auto sm:w-auto sm:min-h-0 sm:py-1"
            onClick={() => setReloadToken((n) => n + 1)}
            disabled={loading}
            aria-label="Reload context graph from server after rebuilding brain-map-graph.json"
          >
            {loading ? 'Loading…' : 'Refresh graph'}
          </button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto" data-testid="brain-map-graph">
        {viewMode === 'graph' && (
          <div id="brain-map-graph-panel" role="tabpanel" aria-labelledby="tab-graph" className="h-full w-full">
            <svg ref={svgRef} className="h-full w-full" aria-label="Context graph visualization" />
          </div>
        )}
        {viewMode === 'table' && (
          <div
            id="brain-map-table-panel"
            role="tabpanel"
            aria-labelledby="tab-table"
            className="overflow-auto p-4"
            aria-label="Context graph nodes as table"
          >
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
              <caption className="sr-only">
                Context graph nodes: path, group, access count, layer, provenance, and optional OpenGrimoire fields
                when present in the graph JSON.
              </caption>
              <thead>
                <tr>
                  <th scope="col" className="px-4 py-2 font-semibold text-gray-900">
                    Path
                  </th>
                  <th scope="col" className="px-4 py-2 font-semibold text-gray-900">
                    Group
                  </th>
                  <th scope="col" className="px-4 py-2 font-semibold text-gray-900">
                    Access count
                  </th>
                  <th scope="col" className="px-4 py-2 font-semibold text-gray-900">
                    Layer
                  </th>
                  <th scope="col" className="px-4 py-2 font-semibold text-gray-900">
                    Provenance
                  </th>
                  {ogCols.trust_score && (
                    <th
                      scope="col"
                      className="px-4 py-2 font-semibold text-gray-900"
                      data-testid="col-trust-score"
                    >
                      Trust score
                    </th>
                  )}
                  {ogCols.compass_axis && (
                    <th scope="col" className="px-4 py-2 font-semibold text-gray-900">
                      Compass axis
                    </th>
                  )}
                  {ogCols.grimoire_tags && (
                    <th scope="col" className="px-4 py-2 font-semibold text-gray-900">
                      Grimoire tags
                    </th>
                  )}
                  {ogCols.insight_level && (
                    <th scope="col" className="px-4 py-2 font-semibold text-gray-900">
                      Insight level
                    </th>
                  )}
                  {showAffectCols && (
                    <>
                      <th scope="col" className="px-4 py-2 font-semibold text-gray-900">
                        Concern
                      </th>
                      <th scope="col" className="px-4 py-2 font-semibold text-gray-900">
                        Urgency
                      </th>
                      <th scope="col" className="px-4 py-2 font-semibold text-gray-900">
                        Momentum
                      </th>
                      <th scope="col" className="px-4 py-2 font-semibold text-gray-900">
                        Unresolved questions
                      </th>
                      <th scope="col" className="px-4 py-2 font-semibold text-gray-900">
                        Confidence drift
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {sortedNodes.map((node) => (
                  <tr
                    key={node.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 focus-within:bg-blue-50 ${
                      selectedNodeId === node.id ? 'bg-blue-50' : ''
                    }`}
                    tabIndex={0}
                    onClick={() => setSelectedNodeId(node.id)}
                  >
                    <td className="px-4 py-2 font-mono text-gray-800">{node.path}</td>
                    <td className="px-4 py-2">
                      <span
                        className="inline-block h-3 w-3 rounded-full"
                        style={{ backgroundColor: GROUP_COLORS[node.group] ?? '#6b7280' }}
                        aria-hidden
                      />{' '}
                      {node.group}
                    </td>
                    <td className="px-4 py-2">{node.accessCount}</td>
                    <td className="px-4 py-2">{nodeLayer(node)}</td>
                    <td className="px-4 py-2">{node.provenance ?? '—'}</td>
                    {ogCols.trust_score && (
                      <td className="px-4 py-2">
                        {typeof node.trust_score === 'number' ? node.trust_score : '—'}
                      </td>
                    )}
                    {ogCols.compass_axis && (
                      <td className="px-4 py-2">{node.compass_axis ?? '—'}</td>
                    )}
                    {ogCols.grimoire_tags && (
                      <td className="px-4 py-2">{formatGrimoireTags(node.grimoire_tags)}</td>
                    )}
                    {ogCols.insight_level && (
                      <td className="px-4 py-2">{node.insight_level ?? '—'}</td>
                    )}
                    {showAffectCols && (
                      <>
                        <td className="px-4 py-2">{node.affect_overlay?.concern_level ?? '—'}</td>
                        <td className="px-4 py-2">{node.affect_overlay?.need_urgency ?? '—'}</td>
                        <td className="px-4 py-2">{node.affect_overlay?.accomplishment_momentum ?? '—'}</td>
                        <td className="px-4 py-2">{node.affect_overlay?.unresolved_question_count ?? '—'}</td>
                        <td className="px-4 py-2">{node.affect_overlay?.confidence_drift ?? '—'}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {selectedNode && (
          <aside
            className="border-t border-gray-200 bg-white p-4"
            data-testid="intent-drilldown-panel"
            aria-label="Intent artifacts drilldown"
          >
            <h2 className="text-sm font-semibold text-gray-900">Intent drilldown</h2>
            <p className="mt-1 text-xs text-gray-600">
              Node: <code className="rounded bg-gray-100 px-1">{selectedNode.path}</code>
            </p>
            {selectedNode.affect_overlay && (
              <div className="mt-2 text-xs text-gray-700">
                {(['concern_level', 'need_urgency', 'accomplishment_momentum', 'unresolved_question_count', 'confidence_drift'] as AffectMetricKey[]).map((key) => (
                  <span key={key} className="mr-3 inline-block">
                    {metricLabel(key)}: {selectedNode.affect_overlay?.[key] ?? '—'}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-3 text-sm">
              <p className="font-medium text-gray-900">Intent artifacts</p>
              <ul className="ml-4 list-disc text-gray-700">
                <li data-testid="intent-survey-refs">
                  Survey refs: {selectedNode.intent_artifacts?.survey_refs?.join(', ') || '—'}
                </li>
                <li>
                  Clarification refs: {selectedNode.intent_artifacts?.clarification_refs?.join(', ') || '—'}
                </li>
                <li>
                  Alignment context refs:{' '}
                  {selectedNode.intent_artifacts?.alignment_context_refs?.join(', ') || '—'}
                </li>
              </ul>
            </div>
            {connectedEdges.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-900">Session links</p>
                <ul className="ml-4 list-disc text-xs text-gray-700">
                  {connectedEdges.map((edge, idx) => (
                    <li key={`${edge.source}-${edge.target}-${idx}`}>
                      {(edge.sessions ?? []).join(', ') || '—'}
                      {edge.affect_by_session &&
                        ` (session affect overlays: ${Object.keys(edge.affect_by_session).join(', ')})`}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {!hasIntentArtifacts(selectedNode) && (
              <p className="mt-2 text-xs text-gray-500">
                No linked survey, clarification, or alignment references on this node.
              </p>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
