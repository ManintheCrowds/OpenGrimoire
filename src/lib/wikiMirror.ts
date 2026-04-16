import fs from 'fs/promises';
import path from 'path';

/** Static subtree under `public/wiki` (Phase B read-only mirror). */
export const WIKI_PUBLIC_SEGMENT = 'wiki';

export function getWikiMirrorRoot(cwd: string = process.cwd()): string {
  return path.join(cwd, 'public', WIKI_PUBLIC_SEGMENT);
}

/**
 * Resolve a repo-relative path under `wikiRoot` and reject path traversal.
 * `relPosix` uses forward slashes, no leading slash (e.g. `Topics/Foo.md`).
 */
export function toSafeWikiAbsPath(relPosix: string, wikiRoot: string): string | null {
  const normalized = relPosix.replace(/\\/g, '/').replace(/^\/+/, '');
  const segments = normalized.split('/').filter(Boolean);
  if (segments.some((s) => s === '..')) return null;
  const abs = path.resolve(wikiRoot, ...segments);
  const rel = path.relative(wikiRoot, abs);
  if (rel.startsWith('..') || path.isAbsolute(rel)) return null;
  return abs;
}

export async function wikiMirrorHasAnyMarkdown(wikiRoot: string): Promise<boolean> {
  async function walk(dir: string): Promise<boolean> {
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return false;
    }
    for (const e of entries) {
      if (e.name.startsWith('.')) continue;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (await walk(full)) return true;
      } else if (e.isFile() && e.name.toLowerCase().endsWith('.md')) {
        return true;
      }
    }
    return false;
  }
  try {
    await fs.access(wikiRoot);
  } catch {
    return false;
  }
  return walk(wikiRoot);
}

/** Relative POSIX paths from mirror root, sorted, capped. */
export async function listMarkdownRelPaths(
  wikiRoot: string,
  maxFiles = 400
): Promise<string[]> {
  const out: string[] = [];
  async function walk(dir: string, relPrefix: string) {
    if (out.length >= maxFiles) return;
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      if (e.name.startsWith('.')) continue;
      const full = path.join(dir, e.name);
      const rel = relPrefix ? `${relPrefix}/${e.name}` : e.name;
      const relPosix = rel.split(path.sep).join('/');
      if (e.isDirectory()) {
        await walk(full, relPosix);
      } else if (e.isFile() && e.name.toLowerCase().endsWith('.md')) {
        out.push(relPosix);
      }
      if (out.length >= maxFiles) return;
    }
  }
  try {
    await fs.access(wikiRoot);
  } catch {
    return [];
  }
  await walk(wikiRoot, '');
  return out.sort((a, b) => a.localeCompare(b));
}

export type WikiReadResult = {
  relPosix: string;
  content: string;
  mtimeMs: number;
  size: number;
};

/**
 * Map URL slug segments to a single `.md` file under the mirror.
 * Appends `.md` when the last segment has no extension.
 */
export async function readWikiMirrorPage(
  slug: string[],
  wikiRoot: string
): Promise<WikiReadResult | null> {
  if (!slug.length) return null;
  let rel = slug.join('/').replace(/\\/g, '/').replace(/^\/+/, '');
  if (!rel.toLowerCase().endsWith('.md')) {
    rel = `${rel}.md`;
  }
  const abs = toSafeWikiAbsPath(rel, wikiRoot);
  if (!abs) return null;
  try {
    const st = await fs.stat(abs);
    if (!st.isFile()) return null;
    const content = await fs.readFile(abs, 'utf8');
    return {
      relPosix: rel.split(path.sep).join('/'),
      content,
      mtimeMs: st.mtimeMs,
      size: st.size,
    };
  } catch {
    return null;
  }
}
