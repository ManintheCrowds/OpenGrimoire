/**
 * Direct static URLs under /public for brain-map graph JSON must be blocked.
 * Clients must use GET /api/brain-map/graph (optional BRAIN_MAP_SECRET / session).
 *
 * Exact-name allowlists miss operator backups left in public/. Middleware already
 * runs for any suffix after `.json` (`/brain-map-graph.json(.*)`); the guard must
 * block hyphen/`~`/`_` copies (`json-copy`, `json~`) as well as `.json.bak`.
 */
const BRAIN_MAP_STATIC_PATH_RE = /^\/brain-map-graph(\.local)?\.json(?:$|[^/])/i;

export function isBlockedBrainMapStaticPath(pathname: string): boolean {
  return BRAIN_MAP_STATIC_PATH_RE.test(pathname);
}
