#!/usr/bin/env node
/**
 * Fail if docs/api/ROUTE_INDEX.json is out of sync with App Router route.ts files under src/app/api.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const apiRoot = path.join(root, 'src', 'app', 'api');
const indexFile = path.join(root, 'docs', 'api', 'ROUTE_INDEX.json');

function collectRouteFiles(dir, rel = '') {
  const out = [];
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const nextRel = rel ? path.join(rel, name.name) : name.name;
    const full = path.join(dir, name.name);
    if (name.isDirectory()) {
      out.push(...collectRouteFiles(full, nextRel));
    } else if (name.name === 'route.ts') {
      const routeDir = path.dirname(nextRel);
      out.push({
        path: dirToApiPath(routeDir),
        file: path.join('src', 'app', 'api', nextRel).split(path.sep).join('/'),
      });
    }
  }
  return out;
}

function dirToApiPath(routeDir) {
  if (!routeDir || routeDir === '.') {
    return '/api';
  }
  const segments = routeDir.split(path.sep).map((seg) =>
    seg.startsWith('[') && seg.endsWith(']') ? `:${seg.slice(1, -1)}` : seg
  );
  return `/api/${segments.join('/')}`;
}

function main() {
  const expected = collectRouteFiles(apiRoot).sort((a, b) => a.path.localeCompare(b.path));
  if (!fs.existsSync(indexFile)) {
    console.error(`verify-route-index: missing ${indexFile}. Run: node scripts/generate-route-index.mjs`);
    process.exit(1);
  }
  const raw = JSON.parse(fs.readFileSync(indexFile, 'utf8'));
  const indexed = Array.isArray(raw.routes) ? raw.routes : [];
  const byPath = (arr) => new Map(arr.map((r) => [r.path, r.file]));

  const expMap = byPath(expected);
  const idxMap = byPath(indexed);

  const missing = [...expMap.keys()].filter((p) => !idxMap.has(p));
  const extra = [...idxMap.keys()].filter((p) => !expMap.has(p));
  const fileMismatch = [...expMap.keys()].filter((p) => idxMap.has(p) && idxMap.get(p) !== expMap.get(p));

  if (missing.length === 0 && extra.length === 0 && fileMismatch.length === 0) {
    console.log(`verify-route-index: OK (${expected.length} routes match ROUTE_INDEX.json).`);
    process.exit(0);
  }

  console.error('verify-route-index: ROUTE_INDEX.json out of sync with src/app/api.\n');
  if (missing.length) {
    console.error('On disk, missing from index:');
    missing.forEach((p) => console.error(`  - ${p} -> ${expMap.get(p)}`));
  }
  if (extra.length) {
    console.error('In index, no matching route on disk:');
    extra.forEach((p) => console.error(`  - ${p}`));
  }
  if (fileMismatch.length) {
    console.error('Path match but file path differs:');
    fileMismatch.forEach((p) =>
      console.error(`  - ${p}: disk=${expMap.get(p)} index=${idxMap.get(p)}`)
    );
  }
  console.error('\nRun: node scripts/generate-route-index.mjs');
  process.exit(1);
}

main();
