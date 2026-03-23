#!/usr/bin/env node
/**
 * Compare App Router route.ts locations under src/app/api to path entries in
 * src/app/api/capabilities/route.ts (CAPABILITIES.routes[].path).
 * Exit 1 on mismatch. Does not validate HTTP methods or auth strings.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const apiRoot = path.join(root, 'src', 'app', 'api');
const capFile = path.join(apiRoot, 'capabilities', 'route.ts');

function collectRouteDirs(dir, rel = '') {
  const out = [];
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const nextRel = rel ? path.join(rel, name.name) : name.name;
    const full = path.join(dir, name.name);
    if (name.isDirectory()) {
      out.push(...collectRouteDirs(full, nextRel));
    } else if (name.name === 'route.ts') {
      out.push(path.dirname(nextRel));
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

function extractManifestPaths(source) {
  const paths = [];
  const re = /path:\s*'(\/api[^']*)'/g;
  let m;
  while ((m = re.exec(source)) !== null) {
    paths.push(m[1]);
  }
  return paths;
}

function main() {
  const capSrc = fs.readFileSync(capFile, 'utf8');
  const manifest = new Set(extractManifestPaths(capSrc));

  const routeDirs = collectRouteDirs(apiRoot);
  const fsPaths = new Set(routeDirs.map(dirToApiPath));

  const missingInManifest = [...fsPaths].filter((p) => !manifest.has(p)).sort();
  const extraInManifest = [...manifest].filter((p) => !fsPaths.has(p)).sort();

  if (missingInManifest.length === 0 && extraInManifest.length === 0) {
    console.log(
      `verify-capabilities-routes: OK (${fsPaths.size} routes match CAPABILITIES.routes paths).`
    );
    process.exit(0);
  }

  console.error('verify-capabilities-routes: CAPABILITIES.routes out of sync with src/app/api route.ts files.\n');
  if (missingInManifest.length) {
    console.error('Present on disk, missing from manifest path:');
    missingInManifest.forEach((p) => console.error(`  - ${p}`));
  }
  if (extraInManifest.length) {
    console.error('In manifest, no matching route.ts:');
    extraInManifest.forEach((p) => console.error(`  - ${p}`));
  }
  console.error('\nUpdate src/app/api/capabilities/route.ts and docs/ARCHITECTURE_REST_CONTRACT.md (see CONTRIBUTING.md).');
  process.exit(1);
}

main();
