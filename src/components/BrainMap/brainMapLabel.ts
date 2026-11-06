/** Minimal node shape needed to pick a human-readable label. */
export interface LabelableNode {
  id: string;
  path?: string;
  claim_text?: string;
  insight_level?: string;
}

const MAX_LABEL = 32;

function truncate(text: string): string {
  const t = text.trim().replace(/\s+/g, ' ');
  return t.length > MAX_LABEL ? `${t.slice(0, MAX_LABEL - 1)}…` : t;
}

/**
 * Display name for a brain-map node: claim text for claim hubs, otherwise the file
 * name from `path` (or `id`) without directories or a markdown/json extension.
 */
export function brainMapNodeLabel(node: LabelableNode): string {
  if (node.insight_level === 'claim' && node.claim_text?.trim()) return truncate(node.claim_text);
  const source = (node.path?.trim() || node.id || '').replace(/[\\/]+$/, '');
  const base = source.split(/[\\/]/).pop() || node.id;
  const name = base.replace(/\.(md|mdx|markdown|json|ya?ml|txt)$/i, '');
  return truncate(name || node.id);
}
