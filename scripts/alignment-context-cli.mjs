#!/usr/bin/env node
/**
 * Thin CLI for /api/alignment-context (agent/harness parity).
 * Env: OPENGRIMOIRE_BASE_URL (default http://localhost:3001 — matches OpenGrimoire `npm run dev`);
 * legacy alias OPENATLAS_BASE_URL still read if OPENGRIMOIRE_BASE_URL is unset,
 * ALIGNMENT_CONTEXT_API_SECRET (required when server enforces it), or server must have
 * ALIGNMENT_CONTEXT_ALLOW_INSECURE_LOCAL=true for local dev without a secret.
 *
 * Usage:
 *   node scripts/alignment-context-cli.mjs list [--status=draft|active|archived]
 *   node scripts/alignment-context-cli.mjs create --title "T" [--body "B"] [--tags a,b]
 *   node scripts/alignment-context-cli.mjs patch <id> [--title T] [--body B] [--status active] ...
 *   node scripts/alignment-context-cli.mjs delete <id>
 */

const BASE = (
  process.env.OPENGRIMOIRE_BASE_URL ||
  process.env.OPENATLAS_BASE_URL ||
  'http://localhost:3001'
).replace(/\/$/, '');
const SECRET = (process.env.ALIGNMENT_CONTEXT_API_SECRET || '').trim();

function headers(json = false) {
  const h = {};
  if (json) h['Content-Type'] = 'application/json';
  if (SECRET) h['x-alignment-context-key'] = SECRET;
  return h;
}

async function main() {
  const [, , cmd, ...rest] = process.argv;
  if (!cmd || cmd === '-h' || cmd === '--help') {
    console.error(`Usage: node scripts/alignment-context-cli.mjs <list|create|patch|delete> [args]`);
    process.exit(cmd ? 0 : 1);
  }

  try {
    if (cmd === 'list') {
      let status = null;
      const limitArg = rest.find((a) => a.startsWith('--limit='));
      const statusArg = rest.find((a) => a.startsWith('--status='));
      const limit = limitArg ? limitArg.split('=')[1] : '50';
      if (statusArg) status = statusArg.split('=')[1];
      const q = new URLSearchParams({ limit });
      if (status) q.set('status', status);
      const res = await fetch(`${BASE}/api/alignment-context?${q}`, { headers: headers() });
      const text = await res.text();
      if (!res.ok) {
        console.error(res.status, text);
        process.exit(1);
      }
      console.log(JSON.stringify(JSON.parse(text), null, 2));
      return;
    }

    if (cmd === 'create') {
      const title = getOpt(rest, '--title');
      if (!title) {
        console.error('create requires --title');
        process.exit(1);
      }
      const body = getOpt(rest, '--body') ?? undefined;
      const tagsRaw = getOpt(rest, '--tags');
      const tags = tagsRaw ? tagsRaw.split(',').map((s) => s.trim()).filter(Boolean) : [];
      const status = getOpt(rest, '--status') || 'draft';
      const payload = { title, body: body ?? null, tags, status };
      const linked = getOpt(rest, '--linked-node-id');
      if (linked) payload.linked_node_id = linked;
      const attendee = getOpt(rest, '--attendee-id');
      if (attendee) payload.attendee_id = attendee;
      const res = await fetch(`${BASE}/api/alignment-context`, {
        method: 'POST',
        headers: headers(true),
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      if (!res.ok) {
        console.error(res.status, text);
        process.exit(1);
      }
      console.log(JSON.stringify(JSON.parse(text), null, 2));
      return;
    }

    if (cmd === 'patch') {
      const id = rest[0];
      if (!id || id.startsWith('--')) {
        console.error('patch requires <id> as first arg');
        process.exit(1);
      }
      const opts = rest.slice(1);
      const payload = {};
      const t = getOpt(opts, '--title');
      if (t !== undefined) payload.title = t;
      const b = getOpt(opts, '--body', true);
      if (b !== undefined) payload.body = b === '' ? null : b;
      const st = getOpt(opts, '--status');
      if (st) payload.status = st;
      const tagsRaw = getOpt(opts, '--tags');
      if (tagsRaw !== undefined) {
        payload.tags = tagsRaw === '' ? [] : tagsRaw.split(',').map((s) => s.trim()).filter(Boolean);
      }
      const pr = getOpt(opts, '--priority');
      if (pr !== undefined) payload.priority = pr === 'null' ? null : Number(pr);
      const linked = getOpt(opts, '--linked-node-id', true);
      if (linked !== undefined) payload.linked_node_id = linked || null;
      if (Object.keys(payload).length === 0) {
        console.error('patch needs at least one --field');
        process.exit(1);
      }
      const res = await fetch(`${BASE}/api/alignment-context/${id}`, {
        method: 'PATCH',
        headers: headers(true),
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      if (!res.ok) {
        console.error(res.status, text);
        process.exit(1);
      }
      console.log(JSON.stringify(JSON.parse(text), null, 2));
      return;
    }

    if (cmd === 'delete') {
      const id = rest[0];
      if (!id) {
        console.error('delete requires <id>');
        process.exit(1);
      }
      const res = await fetch(`${BASE}/api/alignment-context/${id}`, {
        method: 'DELETE',
        headers: headers(),
      });
      const text = await res.text();
      if (!res.ok) {
        console.error(res.status, text);
        process.exit(1);
      }
      console.log(text);
      return;
    }

    console.error('Unknown command:', cmd);
    process.exit(1);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

function getOpt(argv, name, emptyStringOk = false) {
  const i = argv.findIndex((a) => a === name || a.startsWith(`${name}=`));
  if (i < 0) return undefined;
  const eq = argv[i].indexOf('=');
  if (eq >= 0) return argv[i].slice(eq + 1) || (emptyStringOk ? '' : undefined);
  const next = argv[i + 1];
  if (next && !next.startsWith('--')) return next;
  return emptyStringOk ? '' : undefined;
}

main();
