#!/usr/bin/env node
/**
 * Admin operator-probes routes must use requireOperatorProbeAdminRoute (session or optional
 * OPERATOR_PROBE_ADMIN_SECRET + x-operator-probe-admin-key) — never x-alignment-context-key.
 * Discovers route.ts under src/app/api/admin/operator-probes/.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const PROBES_DIR = path.join(root, 'src', 'app', 'api', 'admin', 'operator-probes');
const CAPABILITIES = path.join(root, 'src', 'app', 'api', 'capabilities', 'route.ts');

const ALIGN_HEADER = 'x-alignment-context-key';
const PROBE_ADMIN_GUARD = 'requireOperatorProbeAdminRoute';

function read(p) {
  return fs.readFileSync(p, 'utf8');
}

function fail(msg) {
  console.error(`verify-operator-probes-auth-purity: ${msg}`);
  process.exit(1);
}

function collectRouteFiles() {
  if (!fs.existsSync(PROBES_DIR)) {
    fail(`missing ${PROBES_DIR}`);
  }
  /** @type {string[]} */
  const out = [];
  function walk(dir) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        walk(full);
      } else if (ent.name === 'route.ts') {
        out.push(full);
      }
    }
  }
  walk(PROBES_DIR);
  return out.sort();
}

const routes = collectRouteFiles();
if (routes.length === 0) {
  fail(`no route.ts under ${PROBES_DIR}`);
}

for (const file of routes) {
  const label = path.relative(root, file).split(path.sep).join('/');
  const text = read(file);
  if (text.includes(ALIGN_HEADER)) {
    fail(`${label}: must not reference ${ALIGN_HEADER}`);
  }
  if (!text.includes(PROBE_ADMIN_GUARD)) {
    fail(`${label}: expected ${PROBE_ADMIN_GUARD}`);
  }
}

const cap = read(CAPABILITIES);
if (!cap.includes("path: '/api/admin/operator-probes'")) {
  fail('capabilities/route.ts must list /api/admin/operator-probes');
}
if (!cap.includes("path: '/api/admin/operator-probes/:id'")) {
  fail('capabilities/route.ts must list /api/admin/operator-probes/:id');
}

console.log('verify-operator-probes-auth-purity: ok');
