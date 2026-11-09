/**
 * Hover tooltip for the context atlas. Node fields come from graph JSON and, when the
 * evidence overlay is on, from alignment titles and linked_node_id. Those strings are
 * rendered with innerHTML, so every interpolated value has to be escaped.
 */

import type { BrainMapNode } from './BrainMapGraph';

export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/** HTML for the brain-map hover tooltip. Markup is fixed; node text is escaped. */
export function brainMapTooltipHtml(node: BrainMapNode): string {
  const lines: string[] = [];
  if (node.layer) lines.push(`Layer: ${escapeHtml(node.layer)}`);
  if (node.constraint) lines.push(`Constraint: ${escapeHtml(node.constraint)}`);
  if (node.provenance) lines.push(`Provenance: ${escapeHtml(node.provenance)}`);
  if (node.risk_tier) lines.push(`Risk: ${escapeHtml(node.risk_tier)}`);
  if (node.review_status) lines.push(`Review: ${escapeHtml(node.review_status)}`);
  if (typeof node.trust_score === 'number') lines.push(`Trust: ${node.trust_score}`);
  if (node.compass_axis) lines.push(`Axis: ${escapeHtml(node.compass_axis)}`);
  if (node.grimoire_tags?.length) lines.push(`Tags: ${escapeHtml(node.grimoire_tags.join(', '))}`);
  if (node.insight_level) lines.push(`Insight: ${escapeHtml(node.insight_level)}`);
  const affect = node.affect_overlay;
  if (affect) {
    if (typeof affect.concern_level === 'number') lines.push(`Concern: ${affect.concern_level}`);
    if (typeof affect.need_urgency === 'number') lines.push(`Urgency: ${affect.need_urgency}`);
    if (typeof affect.accomplishment_momentum === 'number') {
      lines.push(`Momentum: ${affect.accomplishment_momentum}`);
    }
    if (typeof affect.unresolved_question_count === 'number') {
      lines.push(`Unresolved Q: ${affect.unresolved_question_count}`);
    }
    if (typeof affect.confidence_drift === 'number') {
      lines.push(`Confidence drift: ${affect.confidence_drift}`);
    }
  }
  const tail = lines.length ? `<br/>${lines.join('<br/>')}` : '';
  return `<strong>${escapeHtml(node.path)}</strong><br/>Group: ${escapeHtml(node.group)}<br/>Access count: ${escapeHtml(String(node.accessCount))}${tail}`;
}
