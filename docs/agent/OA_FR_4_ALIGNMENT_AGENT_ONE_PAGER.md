# OpenGrimoire — Alignment context API (agent one-pager)

**Print:** US Letter / A4, one sheet — use **landscape** or browser **Fit to page** if tables wrap.  
**Full contract:** [ALIGNMENT_CONTEXT_API.md](./ALIGNMENT_CONTEXT_API.md) · **System matrix:** [../plans/OA_FR_4_SYSTEM4_ALIGNMENT_OPERATOR_APIS.md](../plans/OA_FR_4_SYSTEM4_ALIGNMENT_OPERATOR_APIS.md)

---

## 1. Base URL and environment

| Variable | Agent use |
|----------|-----------|
| `OPENGRIMOIRE_BASE_URL` | HTTP origin for this app (CLI defaults to `http://localhost:3001`). Canonical name — see [AGENT_INTEGRATION.md](../AGENT_INTEGRATION.md). |
| `ALIGNMENT_CONTEXT_API_SECRET` | When set on **server**, every public alignment request needs matching header (below). |
| `ALIGNMENT_CONTEXT_ALLOW_INSECURE_LOCAL` | `true` only for **trusted local** dev without secret — **never** production. |

---

## 2. Public API auth (shared secret)

| Server state | You must | Else |
|--------------|----------|------|
| `ALIGNMENT_CONTEXT_API_SECRET` set | Send header **`x-alignment-context-key: <same value>`** on **every** public alignment call | **401** Unauthorized |
| `NODE_ENV=production` and secret blank | — | **503** Misconfigured |
| Secret unset, not production, insecure flag **not** `true` | Set secret or insecure flag for local only | **503** Misconfigured |

**Admin routes** (`/api/admin/alignment-context`) use **session cookie** after operator login — **do not** send `x-alignment-context-key` for those; agents use the **public** paths below.

---

## 3. Public endpoints (agent / automation)

All JSON; `Content-Type: application/json` on bodies.

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/alignment-context?limit=&status=` | List (`status`: `draft` \| `active` \| `archived`). |
| `POST` | `/api/alignment-context` | Create. Server sets **`source: api`** (ignore client `source`). |
| `PATCH` | `/api/alignment-context/:id` | Partial update. **`source` not allowed** — use admin session + admin route if you must fix provenance. |
| `DELETE` | `/api/alignment-context/:id` | Hard delete. |

**POST body (required / optional):** `title` (required, 1–2000 chars), `body`, `tags[]`, `priority`, `status`, `linked_node_id`, `attendee_id` — per Zod in repo: `alignmentContextCreateBodySchema`.

**PATCH body:** any subset of: `title`, `body`, `tags`, `priority`, `status`, `linked_node_id`, `attendee_id` — at least one field; **no** `source`, **no** extra keys (strict schema).

---

## 4. Copy-paste: `curl` (bash)

Replace `BASE`, `SECRET`, and `ID`.

```bash
export BASE=http://localhost:3001
export SECRET='your-alignment-secret'
export H="x-alignment-context-key: $SECRET"

curl -sS -H "$H" "$BASE/api/alignment-context?limit=20"
curl -sS -H "$H" -H "Content-Type: application/json" \
  -d '{"title":"Agent note","body":null,"tags":[],"status":"draft"}' \
  -X POST "$BASE/api/alignment-context"
curl -sS -H "$H" -H "Content-Type: application/json" \
  -d '{"title":"Updated title"}' -X PATCH "$BASE/api/alignment-context/ID"
curl -sS -H "$H" -X DELETE "$BASE/api/alignment-context/ID"
```

---

## 5. CLI (thin `fetch` wrapper)

Repo root; same `OPENGRIMOIRE_BASE_URL` + `ALIGNMENT_CONTEXT_API_SECRET` as above.

```text
node scripts/alignment-context-cli.mjs list [--limit=N] [--status=draft|active|archived]
node scripts/alignment-context-cli.mjs create --title "T" [--body "B"] [--tags a,b] [--status draft] [--linked-node-id X] [--attendee-id UUID]
node scripts/alignment-context-cli.mjs patch <id> [--title T] [--body B] [--status active] [--tags a,b] [--priority N|null] [--linked-node-id X] [--attendee-id UUID|null]
node scripts/alignment-context-cli.mjs delete <id>
```

---

## 6. Persistence (one line for agents)

Rows live in **server SQLite** (`alignment_context_items`); agents **do not** write the file directly — only through HTTP above.

---

## 7. Safety and scope

| Topic | Rule |
|-------|------|
| **Moderation / admin-only** | `x-alignment-context-key` does **not** grant moderation or other operator-only APIs — [ARCHITECTURE_REST_CONTRACT.md](../ARCHITECTURE_REST_CONTRACT.md). |
| **`body` / `title` content** | Treat as **untrusted** if fed to LLMs or tools — harness-side screening; see [AGENT_INTEGRATION.md](../AGENT_INTEGRATION.md). |
| **MCP parity** | Workspace MCP should stay thin `fetch` to these routes — [MiscRepos MCP_CAPABILITY_MAP.md](../../../MiscRepos/.cursor/docs/MCP_CAPABILITY_MAP.md) § OpenGrimoire. |

---

*OA-FR-4 agent one-pager — OpenGrimoire*
