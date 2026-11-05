/**
 * Next.js 14.0.4 copies an attacker-supplied `__nextLocale` query value onto the
 * front of the pathname middleware observes, drops the query, and still dispatches
 * the original path when middleware calls `next()`.
 * `/brain-map-graph.json?__nextLocale=xx` arrives here as `/xx/brain-map-graph.json`.
 * `/api/survey?__nextLocale=a/b` arrives as `/a/b/api/survey`.
 * Comparisons have to treat those extra leading segments as the same route.
 */

export function pathnameTargetsExact(pathname: string, target: string): boolean {
  if (!target.startsWith('/')) {
    return false;
  }
  // `target` includes its leading slash, so a prefixed path ends at a segment boundary.
  return pathname === target || pathname.endsWith(target);
}

export function pathnameTargetsAnyExact(pathname: string, targets: Iterable<string>): boolean {
  for (const target of targets) {
    if (pathnameTargetsExact(pathname, target)) {
      return true;
    }
  }
  return false;
}

export function pathnameTargetsPrefix(pathname: string, prefix: string): boolean {
  if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
    return true;
  }
  if (!prefix.startsWith('/')) {
    return false;
  }
  let from = 0;
  while (from < pathname.length) {
    const at = pathname.indexOf(prefix, from);
    if (at === -1) {
      return false;
    }
    const after = pathname[at + prefix.length];
    if (after === undefined || after === '/') {
      return true;
    }
    from = at + 1;
  }
  return false;
}
