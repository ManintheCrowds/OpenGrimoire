#!/usr/bin/env node
/**
 * Poll GET /api/clarification-requests/:id until status is answered or superseded.
 *
 * Env:
 *   OPENGRIMOIRE_BASE_URL (or OPENGRIMOIRE_BASE_URL) — default http://localhost:3001
 *   ALIGNMENT_CONTEXT_API_SECRET — when server requires x-alignment-context-key (alignment + clarification when CLARIFICATION_QUEUE_API_SECRET is unset)
 *   CLARIFICATION_QUEUE_API_SECRET — optional; when set on the server, send x-clarification-queue-key with this value instead of x-alignment-context-key for clarification routes only
 *   Local dev without secret: server may use ALIGNMENT_CONTEXT_ALLOW_INSECURE_LOCAL=true
 *
 * Usage: node scripts/poll-clarification.mjs <uuid> [intervalMs]
 */
import process from 'node:process';

const id = process.argv[2];
const intervalMs = Number.parseInt(process.argv[3] ?? '3000', 10) || 3000;

if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
  console.error('Usage: node scripts/poll-clarification.mjs <uuid> [intervalMs]');
  process.exit(1);
}

const base =
  process.env.OPENGRIMOIRE_BASE_URL?.replace(/\/$/, '') ||
  process.env.OPENGRIMOIRE_BASE_URL?.replace(/\/$/, '') ||
  'http://localhost:3001';
const alignmentSecret = process.env.ALIGNMENT_CONTEXT_API_SECRET?.trim() ?? '';
const clarificationSecret = process.env.CLARIFICATION_QUEUE_API_SECRET?.trim() ?? '';

const headers = { Accept: 'application/json' };
if (clarificationSecret) {
  headers['x-clarification-queue-key'] = clarificationSecret;
} else if (alignmentSecret) {
  headers['x-alignment-context-key'] = alignmentSecret;
}

async function once() {
  const res = await fetch(`${base}/api/clarification-requests/${id}`, { headers });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    console.error('Non-JSON response', res.status, text.slice(0, 200));
    return null;
  }
  if (!res.ok) {
    console.error('HTTP', res.status, json);
    return null;
  }
  return json;
}

async function main() {
  console.error(`Polling ${base}/api/clarification-requests/${id} every ${intervalMs}ms`);
  for (;;) {
    const json = await once();
    if (json?.item) {
      const st = json.item.status;
      console.log(JSON.stringify(json.item, null, 2));
      if (st === 'answered' || st === 'superseded') {
        process.exit(0);
      }
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
