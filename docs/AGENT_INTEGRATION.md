# OpenGrimoire — agent and automation integration (single entry)

**Normative HTTP rules:** [ARCHITECTURE_REST_CONTRACT.md](./ARCHITECTURE_REST_CONTRACT.md) (entity × HTTP × auth matrix).

## Quick reference

| Item | Value |
|------|--------|
| Local dev URL | **`http://localhost:3001`** (`npm run dev` in this repo) |
| Base URL for scripts | **`OPENGRIMOIRE_BASE_URL`** (legacy alias: **`OPENATLAS_BASE_URL`**) — must match origin including port |
| Alignment CLI | **`node scripts/alignment-context-cli.mjs`** (`list`, `create`, `patch`, `delete`) |
| Machine-readable routes | **`GET /api/capabilities`** — human UI: **`/capabilities`** |
| Alignment secret | Set **`ALIGNMENT_CONTEXT_API_SECRET`**; send header **`x-alignment-context-key`** on each public alignment request when enforced |
| Brain map | **`GET /api/brain-map/graph`** only (not bare `/brain-map-graph.json`); when **`BRAIN_MAP_SECRET`** is set: **`x-brain-map-key`** matching the secret **or** operator session cookie (same-origin UI sends **`credentials: 'include'`**) |
| Admin / operator | **`POST /api/auth/login`** with password; session cookie (**`OPENGRIMOIRE_SESSION_SECRET`**, **`OPENGRIMOIRE_ADMIN_PASSWORD`** or hash) — see [OPENGRIMOIRE_ADMIN_ROLE.md](./admin/OPENGRIMOIRE_ADMIN_ROLE.md) |
| Survey reads (PII) in production | **`GET /api/survey/visualization`**, **`GET /api/survey/approved-qualities`** require admin session, alignment header, **`SURVEY_VISUALIZATION_API_SECRET`** + **`x-survey-visualization-key`**, or **`SURVEY_VISUALIZATION_ALLOW_PUBLIC=true`**. Development is unrestricted. Details: [ARCHITECTURE_REST_CONTRACT.md](./ARCHITECTURE_REST_CONTRACT.md) § Survey read endpoints. |

## Canonical naming (UX vs system)

- **Sync Session (UX):** User-facing workflow label for the structured alignment one-on-one.
- **Alignment Context (system):** Persisted artifacts and API resources used by Sync Sessions.
- **Sync Session Record (entity language):** A single captured outcome, stored in alignment-context data.

## Base URL and port

| Environment | Origin |
|-------------|--------|
| Local `npm run dev` | **`http://localhost:3001`** (see `package.json`) |
| Production | Your deployed origin |

Set **`OPENGRIMOIRE_BASE_URL`** in scripts and CLIs to match (including port). Legacy alias: **`OPENATLAS_BASE_URL`** (still read by the alignment CLI if unset).

## Headers

| Header | When |
|--------|------|
| `x-alignment-context-key` | Must match `ALIGNMENT_CONTEXT_API_SECRET` when that env var is set (public alignment API). |
| `x-brain-map-key` | When `BRAIN_MAP_SECRET` is set: must match for programmatic access, unless the request uses a valid operator session cookie instead (`GET /api/brain-map/graph`). |

**Brain map JSON:** Do not fetch `/brain-map-graph.json` or `/brain-map-graph.local.json` from the site root — those paths return **404**. Use **`GET /api/brain-map/graph`** only.

## Local development: alignment API

Without `ALIGNMENT_CONTEXT_API_SECRET`, the server returns **503** unless you set:

`ALIGNMENT_CONTEXT_ALLOW_INSECURE_LOCAL=true` (development only; never on public hosts).

Alternatively, set a real `ALIGNMENT_CONTEXT_API_SECRET` and send it on each request.

## Machine-readable surface

- **`GET /api/capabilities`** — routes, auth hints, workflow notes (hand-maintained; same PR as API changes when possible).
- Human-friendly view: **`/capabilities`** in the app.

## CLI (alignment context)

```bash
node scripts/alignment-context-cli.mjs list
node scripts/alignment-context-cli.mjs create --title "Example" --body "Optional"
```

Env: `OPENGRIMOIRE_BASE_URL` (or legacy `OPENATLAS_BASE_URL`), `ALIGNMENT_CONTEXT_API_SECRET` (when the server enforces the secret).

## HTTP examples (curl)

Replace `BASE` with your origin (e.g. `http://localhost:3001`). When a secret env is set on the server, include the matching header.

**Capabilities manifest (public):**

```bash
curl -sS "$BASE/api/capabilities"
```

**Brain map graph** (when `BRAIN_MAP_SECRET` is set — header **or** session cookie):

```bash
curl -sS -H "x-brain-map-key: $BRAIN_MAP_SECRET" "$BASE/api/brain-map/graph"
# Logged-in browser: same-origin fetch with credentials: include (no header required).
```

**List alignment context** (add header when `ALIGNMENT_CONTEXT_API_SECRET` is set; on local dev without a secret you may need `ALIGNMENT_CONTEXT_ALLOW_INSECURE_LOCAL=true` per section above):

```bash
curl -sS -H "x-alignment-context-key: $ALIGNMENT_CONTEXT_API_SECRET" \
  "$BASE/api/alignment-context?limit=50"
```

**Create alignment item (POST):**

```bash
curl -sS -X POST -H "Content-Type: application/json" \
  -H "x-alignment-context-key: $ALIGNMENT_CONTEXT_API_SECRET" \
  -d '{"title":"From curl","body":"Optional body","status":"draft"}' \
  "$BASE/api/alignment-context"
```

See [agent/ALIGNMENT_CONTEXT_API.md](./agent/ALIGNMENT_CONTEXT_API.md) for `PATCH` / `DELETE` by id.

## Admin UI vs API

- **Admin** (`/admin`, `/admin/alignment`): Browser session via signed cookie after **`POST /api/auth/login`** (operator password from env). See [OPENGRIMOIRE_ADMIN_ROLE.md](./admin/OPENGRIMOIRE_ADMIN_ROLE.md).
- **Public alignment API:** shared-secret header (not the browser session).

## Backlog: async HITL intent survey

Future work: a **separate** form for **AI-posted questions** that humans resolve **asynchronously** (intent/context), distinct from the intake survey — see [HITL_INTENT_SURVEY_BACKLOG.md](./HITL_INTENT_SURVEY_BACKLOG.md).

## Optional: thin MCP over REST (backlog)

No first-party OpenGrimoire MCP server ships in-repo. A **future** MCP could expose only thin wrappers (`alignment_context_list`, `alignment_context_create`, `brain_map_graph_get`) around existing HTTP routes — **no** second domain layer. If you register tools in Cursor, add them to your workspace MCP capability map. See [agent/INTEGRATION_PATHS.md](./agent/INTEGRATION_PATHS.md).

## Untrusted content (LLM safety)

Alignment `body` / `title` may originate from external agents or pasted text; treat them as **untrusted** if a harness feeds them into an LLM or downstream tools. **OpenGrimoire does not replace harness-side screening:** apply **secure-contain-protect** and [TOOL_SAFEGUARDS.md](../../local-proto/docs/TOOL_SAFEGUARDS.md) (use your `local-proto` clone path if not nested under portfolio-harness). See also [ARCHITECTURE_REST_CONTRACT.md](./ARCHITECTURE_REST_CONTRACT.md) § Non-goals.

## Related docs

- [agent/ALIGNMENT_CONTEXT_API.md](./agent/ALIGNMENT_CONTEXT_API.md)
- [agent/INTEGRATION_PATHS.md](./agent/INTEGRATION_PATHS.md)
- [BRAIN_MAP_SCHEMA.md](./BRAIN_MAP_SCHEMA.md)
- [security/NEXT_PUBLIC_AND_SECRETS.md](./security/NEXT_PUBLIC_AND_SECRETS.md)
