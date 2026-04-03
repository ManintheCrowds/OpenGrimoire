# Unified agent tool manifest (HTTP + workspace MCP)

**Owning repo:** OpenGrimoire (this repository; clone folder often `OpenAtlas`).  
**Update policy:** Change this file in the **same PR** as any new public `src/app/api/` route, MCP-facing script, or harness doc that alters the agent surface. Keep tiers aligned with [HARNESS_ACTION_TIERS.md](./agent/HARNESS_ACTION_TIERS.md) and the normative matrix in [ARCHITECTURE_REST_CONTRACT.md](./ARCHITECTURE_REST_CONTRACT.md).

**Machine-readable index:** `GET /api/capabilities` — [src/app/api/capabilities/route.ts](../src/app/api/capabilities/route.ts).  
**Integration entry:** [AGENT_INTEGRATION.md](./AGENT_INTEGRATION.md).

---

## Risk tiers (summary)

| Tier | Meaning (OpenGrimoire HTTP) |
|------|-----------------------------|
| **read** | Safe to repeat; GET (and documented idempotent reads). |
| **mutate** | POST/PATCH/DELETE or writes; may create side effects or duplicates if retried blindly. |
| **shell** | Not an HTTP surface here — harness/OS execution (see **Workspace MCP** below). |

---

## HTTP surfaces (OpenGrimoire)

Each row: **name**, **tier**, **doc / contract link** (see matrix for auth).

| Name | Tier | Documentation |
|------|------|----------------|
| Capabilities manifest | read | [ARCHITECTURE_REST_CONTRACT.md](./ARCHITECTURE_REST_CONTRACT.md), `GET /api/capabilities` |
| Partial OpenAPI | read | [DISCOVERY_STABILITY_GATE.md](./engineering/DISCOVERY_STABILITY_GATE.md), `GET /api/openapi` |
| Alignment context (public API) | read / mutate | [ALIGNMENT_CONTEXT_API.md](./agent/ALIGNMENT_CONTEXT_API.md); GET list vs POST create / PATCH / DELETE |
| Clarification queue (public API) | read / mutate | [CLARIFICATION_QUEUE_API.md](./agent/CLARIFICATION_QUEUE_API.md) |
| Brain-map graph | read | [AGENT_INTEGRATION.md](./AGENT_INTEGRATION.md) § Brain map |
| Survey submit (Sync Session) | mutate | [SYNC_SESSION_HANDOFF.md](./agent/SYNC_SESSION_HANDOFF.md), `POST /api/survey` |
| Survey visualization / approved quotes | read | [ARCHITECTURE_REST_CONTRACT.md](./ARCHITECTURE_REST_CONTRACT.md) § Survey reads |
| Study / SRS API | read / mutate | [docs/learning/README.md](./learning/README.md) |
| Auth login/session | mutate / read | [ARCHITECTURE_REST_CONTRACT.md](./ARCHITECTURE_REST_CONTRACT.md) |
| Admin BFF routes (`/api/admin/*`) | read / mutate | Operator session; same matrix |

**Retry semantics:** [ADR_IDEMPOTENCY_AND_RETRY.md](./agent/ADR_IDEMPOTENCY_AND_RETRY.md).

---

## Workspace MCP (sibling harness)

MCP tools are **not** served by this app. They are configured in the Cursor host (multi-root workspace) and documented in the **MiscRepos** capability map.

| Name | Tier | Documentation |
|------|------|----------------|
| MCP servers (playwright, docker, sqlite, git, …) | read / mutate / shell (per tool) | Sibling clone: [`MiscRepos/.cursor/docs/MCP_CAPABILITY_MAP.md`](../../MiscRepos/.cursor/docs/MCP_CAPABILITY_MAP.md) |
| Harness scripts via `run_terminal_cmd` | shell | [MiscRepos `.cursor/docs/COMMANDS_README.md`](../../MiscRepos/.cursor/docs/COMMANDS_README.md); map § **harness** in MCP_CAPABILITY_MAP |

**Arc_Forge workspace stub (enabled servers + link):** [Arc_Forge/docs/WORKSPACE_MCP_REGISTRY.md](../../Arc_Forge/docs/WORKSPACE_MCP_REGISTRY.md) (when **Arc_Forge** is a sibling folder of this repo under your GitHub directory).

---

## PR checklist (new tool or route)

1. Update [ARCHITECTURE_REST_CONTRACT.md](./ARCHITECTURE_REST_CONTRACT.md) entity × HTTP × auth matrix.  
2. Update [src/app/api/capabilities/route.ts](../src/app/api/capabilities/route.ts) and run `npm run verify:capabilities`.  
3. Add or adjust a row in **this manifest** (HTTP or pointer to MCP map).  
4. Add a **changelog / release-note line** when contract or capabilities change ([CONTRIBUTING.md](../CONTRIBUTING.md)).  
5. For agent-facing behavior, align PR review with [AGENT_HARNESS_IMPROVEMENT_PROGRAM_2026-04-03.md](./research/AGENT_HARNESS_IMPROVEMENT_PROGRAM_2026-04-03.md) meta-principles.
