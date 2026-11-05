import { normalizeRequestPathname } from '../http/normalize-request-pathname';

/**
 * Direct static URLs under /public for brain-map graph JSON must be blocked.
 * Clients must use GET /api/brain-map/graph (optional BRAIN_MAP_SECRET / session).
 *
 * After normalizeRequestPathname:
 * - Percent-encoded spellings of the basename are comparable to decoded forms (#57).
 * - Suffixes after `.json` (`.bak`, `-copy`, `~`, `_old`) must block (#58).
 * - Finder/VS Code duplicates insert before `.json` (`local-copy`, ` copy`, `(1)`) (#59).
 * - The basename may sit behind extra segments. Next 14.0.4 prepends `__nextLocale`
 *   (`/xx/brain-map-graph.json`, `/a/b/brain-map-graph.local.json`) and still serves
 *   the original public file when this check misses.
 *
 * Fail-closed encodings (normalize !ok) are not suffix hits — middleware uses a generic 404.
 */
const BRAIN_MAP_STATIC_PATH_RE = /(?:^|\/)brain-map-graph[^/]*\.json(?:$|[^/])/i;

export function isBlockedBrainMapStaticPath(pathname: string): boolean {
  const normalized = normalizeRequestPathname(pathname);
  if (!normalized.ok) {
    return false;
  }
  return BRAIN_MAP_STATIC_PATH_RE.test(normalized.pathname);
}
