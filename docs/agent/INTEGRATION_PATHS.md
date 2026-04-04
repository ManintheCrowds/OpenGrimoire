# OpenGrimoire — agent and harness integration paths

**Single entry (operators + agents):** [AGENT_INTEGRATION.md](../AGENT_INTEGRATION.md) — base URL, headers, CLI, brain-map policy.

**Purpose:** Recommended stack for **action parity** without inventing parallel business layers. There is **no** first-party OpenGrimoire MCP server in this repo; parity is **API-shaped** first.

**Normative contract:** [ARCHITECTURE_REST_CONTRACT.md](../ARCHITECTURE_REST_CONTRACT.md).

---

## Primary: HTTP + thin CLI

- **Alignment context:** Full list/create/patch/delete via [ALIGNMENT_CONTEXT_API.md](./ALIGNMENT_CONTEXT_API.md) and [`scripts/alignment-context-cli.mjs`](../../scripts/alignment-context-cli.mjs) (`list`, `create`, `patch`, `delete`).
- **Brain-map graph:** `GET /api/brain-map/graph` for the JSON document consumed by the viewer.

Set `OPENGRIMOIRE_BASE_URL` (or legacy `OPENGRIMOIRE_BASE_URL`) to your app origin (local dev defaults to port **3001** — see README). Set `ALIGNMENT_CONTEXT_API_SECRET` when the server enforces `x-alignment-context-key`.

---

## Browser automation (UI-only paths)

Where there is no stable API for a user action, use **Playwright** (CI truth), **Maestro** (optional YAML smoke), or generic browser MCP — see [e2e/maestro/README.md](../../e2e/maestro/README.md) and sibling-harness [Agent-Native-Testing.md](../../../docs/Agent-Native-Testing.md) (when `docs/` exists beside OpenGrimoire under `GitHub/`).

---

## Optional future: thin MCP over REST

A dedicated MCP server could expose **only** thin wrappers around existing endpoints — **not** a second orchestration or business layer. Workspace-wide MCP inventory: [`.cursor/docs/MCP_CAPABILITY_MAP.md`](../../../.cursor/docs/MCP_CAPABILITY_MAP.md).

**Checklist (if you add an MCP server elsewhere):** map tools 1:1 to existing HTTP methods — e.g. `alignment_context_list` → `GET /api/alignment-context`, `alignment_context_create` → `POST /api/alignment-context`, `alignment_context_patch` → `PATCH /api/alignment-context/:id`, `alignment_context_delete` → `DELETE /api/alignment-context/:id`, `brain_map_graph_get` → `GET /api/brain-map/graph`. Pass through the same headers (`x-alignment-context-key`, `x-brain-map-key`) and env-backed secrets; do not embed business rules beyond request shaping.

**Stub / pointer (no server in-repo):** [`scripts/mcp-opengrimoire/README.md`](../../scripts/mcp-opengrimoire/README.md).

Scoring note: product branding on a tool is **optional**; parity is measured by **REST + CLI + E2E**, not naming.
