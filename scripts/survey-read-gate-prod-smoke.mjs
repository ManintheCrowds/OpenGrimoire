#!/usr/bin/env node
/**
 * OG-GUI-10: Production-mode smoke for checkSurveyReadGate on survey read routes.
 * Runs `npm run build` once (unless SKIP_BUILD=1), then sequential `next start` profiles
 * with NODE_ENV=production and asserts HTTP status + minimal JSON for each case.
 *
 * First line of SURVEY_READ_GATE_UNAUTHORIZED_JSON_DETAIL (SSOT in survey-read-gate-public-messages.ts).
 */
import { execSync, spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { setTimeout as delay } from 'node:timers/promises';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const require = createRequire(import.meta.url);
const nextCli = require.resolve('next/dist/bin/next');

/** One port per profile so a slow shutdown cannot satisfy readiness for the next server. */
const PORT_DENY = process.env.SURVEY_READ_PROD_SMOKE_PORT_DENY ?? '3010';
const PORT_PUBLIC = process.env.SURVEY_READ_PROD_SMOKE_PORT_PUBLIC ?? '3011';
const PORT_VIZ = process.env.SURVEY_READ_PROD_SMOKE_PORT_VIZ ?? '3012';
const PORT_ALIGN = process.env.SURVEY_READ_PROD_SMOKE_PORT_ALIGN ?? '3013';

function baseForPort(port) {
  return `http://127.0.0.1:${port}`;
}
const PATH_VIZ = '/api/survey/visualization';
const PATH_APPROVED = '/api/survey/approved-qualities';

const VIZ_SECRET = 'og-gui-10-prod-smoke-viz';
const ALIGN_SECRET = 'og-gui-10-prod-smoke-align';

/** Keep in sync with survey-read-gate-public-messages.ts SURVEY_READ_GATE_UNAUTHORIZED_JSON_DETAIL opening. */
const UNAUTH_DETAIL_PREFIX = 'In production, survey read endpoints require';

const STRIP_KEYS = [
  'SURVEY_VISUALIZATION_ALLOW_PUBLIC',
  'SURVEY_VISUALIZATION_API_SECRET',
  'ALIGNMENT_CONTEXT_KEY_ALLOWS_SURVEY_READ',
];

function fail(msg) {
  console.error(`survey-read-gate-prod-smoke: ${msg}`);
  process.exit(1);
}

function inheritedEnv() {
  const e = { ...process.env };
  for (const k of STRIP_KEYS) delete e[k];
  delete e.ALIGNMENT_CONTEXT_API_SECRET;
  return e;
}

const BASE_PROD = {
  ...inheritedEnv(),
  NODE_ENV: 'production',
  OPENGRIMOIRE_SESSION_SECRET: 'og-gui-10-prod-smoke-session-secret-min-32-chars!!',
};

function runBuild() {
  if (process.env.SKIP_BUILD === '1') {
    console.log('survey-read-gate-prod-smoke: SKIP_BUILD=1, skipping npm run build');
    return;
  }
  if (!fs.existsSync(path.join(root, '.next'))) {
    console.log('survey-read-gate-prod-smoke: running npm run build...');
  } else {
    console.log('survey-read-gate-prod-smoke: running npm run build (use SKIP_BUILD=1 to skip)...');
  }
  execSync('npm run build', { cwd: root, stdio: 'inherit', env: { ...process.env } });
}

/**
 * @param {Record<string, string | undefined>} extra
 * @param {string} port
 */
function startNext(extra, port) {
  const env = { ...BASE_PROD, ...extra };
  const child = spawn(process.execPath, [nextCli, 'start', '-p', port], {
    cwd: root,
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: false,
  });
  let stderr = '';
  child.stderr?.on('data', (chunk) => {
    stderr += chunk.toString();
  });
  child.stdout?.on('data', () => {});
  return { child, getStderr: () => stderr };
}

/**
 * @param {string} base
 * @param {() => string} getStderr
 */
async function waitForReady(base, getStderr, maxSec = 90) {
  for (let i = 0; i < maxSec; i++) {
    try {
      const res = await fetch(`${base}/api/capabilities`);
      if (res.ok) {
        if (i > 0) console.log(`survey-read-gate-prod-smoke: server ready after ${i + 1}s`);
        return;
      }
    } catch {
      /* retry */
    }
    await delay(1000);
  }
  fail(`timeout waiting for ${base}/api/capabilities\n${getStderr()}`);
}

/**
 * @param {string} base
 * @param {string} p
 * @param {Record<string, string>} headers
 * @param {number} expectStatus
 * @param {(body: unknown) => void} [checkBody]
 */
async function getJson(base, p, headers, expectStatus, checkBody) {
  const res = await fetch(`${base}${p}`, { headers });
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = null;
  }
  if (res.status !== expectStatus) {
    fail(`GET ${p} expected ${expectStatus} got ${res.status}: ${text.slice(0, 500)}`);
  }
  if (checkBody) checkBody(body);
}

function assert401Detail(body) {
  if (!body || typeof body !== 'object') fail('401 response: expected JSON object');
  if (body.error !== 'Unauthorized') fail(`401 response: expected error Unauthorized, got ${JSON.stringify(body.error)}`);
  const d = body.detail;
  if (typeof d !== 'string' || !d.includes(UNAUTH_DETAIL_PREFIX)) {
    fail(`401 response: detail must include SSOT prefix; got ${JSON.stringify(d)?.slice(0, 200)}`);
  }
}

function assert200Viz(body) {
  if (!body || typeof body !== 'object' || !('data' in body)) {
    fail('200 visualization: expected { data: ... }');
  }
}

function assert200Approved(body) {
  if (!body || typeof body !== 'object' || !('items' in body)) {
    fail('200 approved-qualities: expected { items: ... }');
  }
}

/**
 * @param {string} name
 * @param {string} port
 * @param {Record<string, string | undefined>} extraEnv
 * @param {(base: string) => Promise<void>} runTests
 */
async function withProfile(name, port, extraEnv, runTests) {
  const base = baseForPort(port);
  console.log(`survey-read-gate-prod-smoke: profile "${name}" on ${port}`);
  const { child, getStderr } = startNext(extraEnv, port);
  try {
    await waitForReady(base, getStderr);
    await runTests(base);
  } catch (e) {
    console.error(getStderr());
    throw e;
  } finally {
    child.kill('SIGTERM');
    await delay(2000);
    try {
      child.kill('SIGKILL');
    } catch {
      /* ignore */
    }
    await new Promise((resolve) => {
      const t = setTimeout(resolve, 5000);
      child.once('exit', () => {
        clearTimeout(t);
        resolve(undefined);
      });
    });
  }
}

async function main() {
  process.chdir(root);
  runBuild();

  await withProfile('deny', PORT_DENY, {}, async (base) => {
    await getJson(base, PATH_VIZ, {}, 401, assert401Detail);
    await getJson(base, PATH_APPROVED, {}, 401, assert401Detail);
  });

  await withProfile(
    'public',
    PORT_PUBLIC,
    { SURVEY_VISUALIZATION_ALLOW_PUBLIC: 'true' },
    async (base) => {
      await getJson(base, PATH_VIZ, {}, 200, assert200Viz);
      await getJson(base, PATH_APPROVED, {}, 200, assert200Approved);
    }
  );

  await withProfile('viz-key', PORT_VIZ, { SURVEY_VISUALIZATION_API_SECRET: VIZ_SECRET }, async (base) => {
    await getJson(base, PATH_VIZ, {}, 401, assert401Detail);
    await getJson(base, PATH_APPROVED, {}, 401, assert401Detail);
    await getJson(base, PATH_VIZ, { 'x-survey-visualization-key': 'wrong-key' }, 401, assert401Detail);
    await getJson(base, PATH_VIZ, { 'x-survey-visualization-key': VIZ_SECRET }, 200, assert200Viz);
    await getJson(base, PATH_APPROVED, { 'x-survey-visualization-key': VIZ_SECRET }, 200, assert200Approved);
  });

  await withProfile(
    'alignment-key',
    PORT_ALIGN,
    {
      ALIGNMENT_CONTEXT_KEY_ALLOWS_SURVEY_READ: 'true',
      ALIGNMENT_CONTEXT_API_SECRET: ALIGN_SECRET,
    },
    async (base) => {
      await getJson(base, PATH_VIZ, { 'x-alignment-context-key': ALIGN_SECRET }, 200, assert200Viz);
      await getJson(base, PATH_APPROVED, { 'x-alignment-context-key': ALIGN_SECRET }, 200, assert200Approved);
    }
  );

  console.log('survey-read-gate-prod-smoke: ok');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
