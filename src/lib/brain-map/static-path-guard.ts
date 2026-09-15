/**
 * Direct static URLs under /public for brain-map graph JSON must be blocked.
 * Clients must use GET /api/brain-map/graph (optional BRAIN_MAP_SECRET / session).
 *
 * Exact-name allowlists miss operator backups such as
 * `/brain-map-graph.local.json.pre_e2e_backup` or `.bak` copies left in public/.
 * Finder/VS Code "Duplicate File" inserts before the extension
 * (`brain-map-graph.local-copy.json`, `brain-map-graph.local copy.json`).
 */
const BRAIN_MAP_STATIC_PATH_RE = /^\/brain-map-graph[^/]*\.json(?:$|\.)/i;

export function isBlockedBrainMapStaticPath(pathname: string): boolean {
  return BRAIN_MAP_STATIC_PATH_RE.test(pathname);
}
