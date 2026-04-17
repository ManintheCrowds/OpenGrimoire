#!/usr/bin/env node
/**
 * OA-FR-1 AC3: moderation admin routes must not reference alignment-agent auth.
 * Exit 1 if moderation handlers mention x-alignment-context-key or omit admin guard.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const MOD_QUEUE = path.join(root, 'src', 'app', 'api', 'admin', 'moderation-queue', 'route.ts');
const MOD_PATCH = path.join(root, 'src', 'app', 'api', 'admin', 'moderation', '[responseId]', 'route.ts');
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

for (const [label, file] of [
  ['moderation-queue', MOD_QUEUE],
  ['moderation PATCH', MOD_PATCH],
]) {
  if (!fs.existsSync(file)) {
    fail(`missing file ${file}`);
  }
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
