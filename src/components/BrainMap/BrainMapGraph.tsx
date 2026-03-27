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
  /** True when API returned 200 but no nodes (empty build); UI shows placeholder graph — use All/State layer, or rebuild JSON. */
  const [placeholderFromEmptyApi, setPlaceholderFromEmptyApi] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const headers: HeadersInit = {};
    if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_BRAIN_MAP_SECRET) {
      headers['x-brain-map-key'] = process.env.NEXT_PUBLIC_BRAIN_MAP_SECRET;
    }
    setLoading(true);
    setError(null);
    const url = `/api/brain-map/graph?cb=${Date.now()}`;
    fetch(url, { headers, cache: 'no-store' })
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
    return filterGraphByLayer(data, layerFilter);
  }, [data, layerFilter]);

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
      .attr('r', (d) => 4 + Math.min(d.accessCount, 8))
      .attr('fill', (d) => GROUP_COLORS[d.group] ?? '#6b7280')
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
      .on('click', (event) => {
        event.stopPropagation();
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
  }, [filteredData]);

  useEffect(() => {
    renderGraph();
  }, [renderGraph]);

  const sortedNodes = useMemo(
    () => [...(filteredData?.nodes ?? [])].sort((a, b) => b.accessCount - a.accessCount),
    [filteredData]
  );
  const ogCols = useMemo(() => openGrimoireTableFlags(sortedNodes), [sortedNodes]);

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
    <div className="flex h-full w-full flex-col bg-gray-50">
      <div className="border-b bg-white px-4 py-2">
        <h1 className="text-lg font-semibold text-gray-900">OpenGrimoire — context graph</h1>
        <p className="text-sm text-gray-600">
          Co-access across session journals and handoffs. After rebuilding JSON, use <strong>Refresh graph</strong>{' '}
          below (or reload the page). Rebuild with{' '}
          <code className="rounded bg-gray-100 px-1">python .cursor/scripts/build_brain_map.py</code> (from
          portfolio-harness root). See <code className="rounded bg-gray-100 px-1">docs/BRAIN_MAP_SCHEMA.md</code>.
        </p>
        {error && (
          <p className="mt-2 text-sm text-amber-800" role="alert">
            Could not load graph from API ({error}). Showing placeholder graph.
          </p>
        )}
        {placeholderFromEmptyApi && (
          <p
            className="mt-2 text-sm text-slate-700"
            data-testid="brain-map-placeholder-hint"
            role="status"
          >
            Placeholder graph — the API returned no nodes (<code className="rounded bg-gray-100 px-1">sessionCount: 0</code>).
            Use Layer <strong>All</strong> or <strong>State</strong> (not Vault) to see sample nodes, or rebuild{' '}
            <code className="rounded bg-gray-100 px-1">brain-map-graph.json</code> after citing{' '}
            <code className="rounded bg-gray-100 px-1">.md</code> paths in handoffs/daily/decision-log (
            <code className="rounded bg-gray-100 px-1">python .cursor/scripts/build_brain_map.py</code> from portfolio-harness
            root).
          </p>
        )}
        {layerFilterEmpty && (
          <p className="mt-2 text-sm text-gray-600" role="status">
            No nodes in this layer for the current filter. Choose <strong>All</strong> or another layer.
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-2" role="tablist" aria-label="View mode">
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'graph'}
            aria-controls="brain-map-graph-panel"
            id="tab-graph"
            onClick={() => setViewMode('graph')}
            className={`rounded px-3 py-1 text-sm font-medium ${
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
            className={`rounded px-3 py-1 text-sm font-medium ${
              viewMode === 'table' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Table
          </button>
          <span className="mx-1 text-gray-300" aria-hidden>
            |
          </span>
          <span className="text-xs font-medium uppercase tracking-wide text-gray-500">Layer</span>
          {(['all', 'state', 'vault'] as const).map((lf) => (
            <button
              key={lf}
              type="button"
              role="tab"
              aria-selected={layerFilter === lf}
              onClick={() => setLayerFilter(lf)}
              className={`rounded px-3 py-1 text-sm font-medium ${
                layerFilter === lf ? 'bg-slate-200 text-slate-900' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {lf === 'all' ? 'All' : lf === 'state' ? 'State' : 'Vault'}
            </button>
          ))}
          <button
            type="button"
            className="ml-auto rounded border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50"
            onClick={() => setReloadToken((n) => n + 1)}
            disabled={loading}
            aria-label="Reload context graph from server after rebuilding brain-map-graph.json"
          >
            {loading ? 'Loading…' : 'Refresh graph'}
          </button>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-auto" data-testid="brain-map-graph">
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
                </tr>
              </thead>
              <tbody>
                {sortedNodes.map((node) => (
                  <tr
                    key={node.id}
                    className="border-b border-gray-100 hover:bg-gray-50 focus-within:bg-blue-50"
                    tabIndex={0}
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
