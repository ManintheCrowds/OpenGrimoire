#!/usr/bin/env node
/**
 * OA-REST-2 / research-driven Phase A: every path in src/lib/openapi/openapi-document.ts
 * must exist on disk + in CAPABILITIES.routes; required public/agent paths must appear in OpenAPI.
 * Does not validate admin-only routes (partial spec by design).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const capFile = path.join(root, 'src', 'app', 'api', 'capabilities', 'route.ts');
const openApiFile = path.join(root, 'src', 'lib', 'openapi', 'openapi-document.ts');

/** Match Express-style :param to OpenAPI {param} for comparison. */
function toOpenApiPathStyle(p) {
  return p.replace(/:([a-zA-Z][a-zA-Z0-9_]*)/g, '{$1}');
}

function extractCapabilityPaths(source) {
  const paths = [];
  const re = /path:\s*'(\/api[^']*)'/g;
  let m;
  while ((m = re.exec(source)) !== null) {
    paths.push(m[1]);
  }
  return paths;
}

function extractOpenApiPathKeys(source) {
  const keys = [];
  const re = /\n\s+'(\/api[^']+)':\s*\{/g;
  let m;
  while ((m = re.exec(source)) !== null) {
    keys.push(m[1]);
  }
  return keys;
}

/** Non-admin routes that must appear in the partial OpenAPI document (contract parity). */
const REQUIRED_IN_OPENAPI = [
  '/api/capabilities',
  '/api/openapi',
  '/api/alignment-context',
  '/api/alignment-context/{id}',
  '/api/clarification-requests',
  '/api/clarification-requests/{id}',
  '/api/brain-map/graph',
  '/api/survey',
  '/api/survey/visualization',
  '/api/survey/approved-qualities',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/session',
  '/api/test-data/{dataset}',
  '/api/operator-probes/ingest',
];

function main() {
  const capSrc = fs.readFileSync(capFile, 'utf8');
  const oaSrc = fs.readFileSync(openApiFile, 'utf8');

  const capPaths = extractCapabilityPaths(capSrc);
  const capSet = new Set(capPaths.map(toOpenApiPathStyle));

  const openApiPaths = extractOpenApiPathKeys(oaSrc);
  const openApiSet = new Set(openApiPaths);

  const missingInCapabilities = openApiPaths.filter((p) => !capSet.has(p));
  const missingRequired = REQUIRED_IN_OPENAPI.filter((p) => !openApiSet.has(p));

  if (missingInCapabilities.length === 0 && missingRequired.length === 0) {
    console.log(
      `verify-openapi-coverage: OK (${openApiPaths.length} OpenAPI paths; ${REQUIRED_IN_OPENAPI.length} required present; all exist in CAPABILITIES.routes).`
    );
    process.exit(0);
  }

  console.error('verify-openapi-coverage: OpenAPI document out of sync with contract/capabilities.\n');
  if (missingInCapabilities.length) {
    console.error('OpenAPI paths not found in CAPABILITIES.routes (after :id -> {id} normalize):');
    missingInCapabilities.forEach((p) => console.error(`  - ${p}`));
  }
  if (missingRequired.length) {
    console.error('Required public/agent paths missing from openapi-document.ts:');
    missingRequired.forEach((p) => console.error(`  - ${p}`));
  }
  console.error('\nUpdate src/lib/openapi/openapi-document.ts and/or capabilities/route.ts (see ARCHITECTURE_REST_CONTRACT.md).');
  process.exit(1);
}

main();
