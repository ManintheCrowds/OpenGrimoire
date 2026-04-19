#!/usr/bin/env node
/**
 * OA-FR-1 AC3: moderation admin routes must not reference alignment-agent auth.
 * Exit 1 if moderation handlers mention x-alignment-context-key or omit admin guard.
 * Discovers all route.ts files under src/app/api/admin/moderation-queue and .../moderation/.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const ADMIN_API = path.join(root, 'src', 'app', 'api', 'admin');
const CAPABILITIES = path.join(root, 'src', 'app', 'api', 'capabilities', 'route.ts');

const ALIGN_HEADER = 'x-alignment-context-key';
const ADMIN_GUARD = 'requireOpenGrimoireAdminRoute';
const CAP_SUBSTRING = 'operator_session_only_no_alignment_key';

function read(p) {
  return fs.readFileSync(p, 'utf8');
}

function fail(msg) {
  console.error(`verify-moderation-auth-purity: ${msg}`);
  process.exit(1);
}

/**
 * @returns {string[]} absolute paths to moderation route handlers
 */
function collectModerationRouteFiles() {
  if (!fs.existsSync(ADMIN_API)) {
    fail(`missing admin API dir ${ADMIN_API}`);
  }
  /** @type {string[]} */
  const out = [];
  function walk(dir) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        walk(full);
      } else if (ent.name === 'route.ts') {
        const rel = path.relative(ADMIN_API, full);
        const norm = rel.split(path.sep).join('/');
        if (norm.startsWith('moderation-queue/') || norm.startsWith('moderation/')) {
          out.push(full);
        }
      }
    }
  }
  walk(ADMIN_API);
  return out.sort();
}

const moderationRoutes = collectModerationRouteFiles();
if (moderationRoutes.length === 0) {
  fail(`no moderation route.ts files found under ${ADMIN_API} (expected moderation-queue and/or moderation/)`);
}

for (const file of moderationRoutes) {
  const label = path.relative(root, file).split(path.sep).join('/');
  const text = read(file);
  if (text.includes(ALIGN_HEADER)) {
    fail(`${label}: must not reference ${ALIGN_HEADER}`);
  }
  if (!text.includes(ADMIN_GUARD)) {
    fail(`${label}: expected ${ADMIN_GUARD}`);
  }
}

const cap = read(CAPABILITIES);
if (!cap.includes("path: '/api/admin/moderation-queue'")) {
  fail('capabilities/route.ts must list /api/admin/moderation-queue');
}
if (!cap.includes("path: '/api/admin/moderation/:responseId'")) {
  fail('capabilities/route.ts must list /api/admin/moderation/:responseId');
}
const capHits = (cap.match(new RegExp(CAP_SUBSTRING.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) ?? []).length;
if (capHits < 2) {
  fail(`capabilities/route.ts must mention ${CAP_SUBSTRING} for both moderation routes (found ${capHits})`);
}

console.log('verify-moderation-auth-purity: ok');
