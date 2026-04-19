# OpenGrimoire — base product features (spec)

**Purpose:** Normative, testable requirements for the **operator-facing base camp**: context graph, alignment APIs, optional LLM Wiki mirror, and future agent visibility — without duplicating [OPENGRIMOIRE_SYSTEMS_INVENTORY.md](./OPENGRIMOIRE_SYSTEMS_INVENTORY.md) (systems inventory + links). **Workspace MCP matrix** stays in [MiscRepos `.cursor/docs/MCP_CAPABILITY_MAP.md`](../../MiscRepos/.cursor/docs/MCP_CAPABILITY_MAP.md).

**Engineering execution plan (waves, ADR-lite, CI hooks):** [docs/plans/OPENGRIMOIRE_BASE_FEATURES_ENGINEERING_PLAN.md](./plans/OPENGRIMOIRE_BASE_FEATURES_ENGINEERING_PLAN.md)

**Scope model:** **Hybrid** — wiki prose **SSOT** = Obsidian vault `LLM-Wiki/` (see [MiscRepos `LLM_WIKI_VAULT.md`](../../MiscRepos/local-proto/docs/LLM_WIKI_VAULT.md)). OpenGrimoire may host a **read-only mirror** and always shows **where truth lives**.

**Governance seam:** [OpenHarness `HANDOFF_FLOW.md`](../../OpenHarness/docs/HANDOFF_FLOW.md) and harness `state/` remain **portable**; OpenGrimoire stores **product** state (SQLite per [SYSTEMS_INVENTORY](./OPENGRIMOIRE_SYSTEMS_INVENTORY.md)). Harness docs **reference** OG URLs and alignment IDs; they do **not** own OG tables as SSOT.

### Reconciled audit status (vs engineering plan)

| REQ | Spec area | Product / docs reality (2026-04-16) | CI mechanical? |
|-----|-----------|--------------------------------------|------------------|
| REQ-1 | SSOT + mirror | Banner + read-only `/wiki` + [WIKI_MIRROR.md](./WIKI_MIRROR.md); file mtime on page | **Partial** — add mirror manifest (engineering plan Wave 4) |
| REQ-2 | Wiki viewer | Minimal `/wiki` index + page + empty state shipped | **Partial** — wikilink resolver + optional MD render tests |
| REQ-3 | Brain map | Routes + API + docs aligned | **Partial** — fixture/API test (engineering plan Wave 1/4) |
| REQ-4 | Alignment parity | Thin MCP pattern documented | **No** — golden REST vs MCP tests (Wave 2) |
| REQ-5 | Menagerie | Roadmap | **No** |
| REQ-6 | Links | Roadmap | **No** |
| REQ-7 | Audit | Roadmap | **No** |
| REQ-8 | Onboarding | MiscRepos PKM docs + `/wiki` live | **Partial** — optional Playwright (Wave 5) |
| REQ-9 | Harness seam | Docs good | **Optional** grep gate |
| REQ-10 | Completion signals | MiscRepos + vault runbooks | **Process** — optional validator script |

---

## REQ-1 — SSOT contract (wiki mirror)

| ID | Requirement | Acceptance criteria |
|----|-------------|---------------------|
| REQ-1.1 | Mirrored `LLM-Wiki/**` under the app (e.g. `public/wiki`) is **read-only consumption** in supported flows unless an explicit, documented toggle exists. | Operator doc and UI copy state “canon = vault”; no default write path from OG to vault via mirror. |
| REQ-1.2 | When serving mirrored pages, the operator can see **source path + sync metadata** (timestamp or build id; checksum when sync implements it). | One screen or doc section answers “where is truth?” without reading code. |

---

## REQ-2 — Wiki viewer / navigation (Phase B)

**Shipped (minimal):** `GET /wiki` lists `.md` files under `public/wiki` (cap 400); nested pages render as HTML-escaped plaintext in `<pre>` with mirror mtime. **Deferred:** wikilink routing, search, markdown-to-HTML, bundled sample mirror.

| ID | Requirement | Acceptance criteria |
|----|-------------|---------------------|
| REQ-2.1 | Browse mirrored tree or equivalent static export; internal links resolve within mirror or deep-link to vault path scheme documented for operators. | **Partial:** index + per-page `/wiki/...` from mirror; `[[wikilinks]]` not resolved to routes yet. |
| REQ-2.2 | Broken mirror is a **visible** degraded state (banner or doc), not silent empty content. | **Met (minimal):** empty `public/wiki` shows banner + empty-state panel with sync command ([WIKI_MIRROR.md](./WIKI_MIRROR.md)). |

---

## REQ-3 — Brain Map consumption

| ID | Requirement | Acceptance criteria |
|----|-------------|---------------------|
| REQ-3.1 | Consume `brain-map-graph.json` (or `.local.json`) from disk per [README](../README.md) / env; document ports via MiscRepos [.cursor/docs/PORT_REGISTRY.md](../../MiscRepos/.cursor/docs/PORT_REGISTRY.md) where applicable. | Steps in [MiscRepos `BRAIN_MAP_E2E.md`](../../MiscRepos/docs/BRAIN_MAP_E2E.md) match actual default output path, route (`/context-atlas`), and port resolution; normative pipeline table in [MiscRepos `BRAIN_MAP_HUB.md`](../../MiscRepos/docs/BRAIN_MAP_HUB.md) § System 3 — REQ / AC. |
| REQ-3.2 | Multi-root: document `CURSOR_STATE_DIRS` and optional vault roots so **vault-cited** paths appear in `/context-atlas` when configured. | Cross-link to [OPENGRIMOIRE_SYSTEMS_INVENTORY.md](./OPENGRIMOIRE_SYSTEMS_INVENTORY.md) § LLM Wiki vs OpenGrimoire. |

---

## REQ-4 — Alignment context REST + MCP parity

| ID | Requirement | Acceptance criteria |
|----|-------------|---------------------|
| REQ-4.1 | Public alignment CRUD contract per [ALIGNMENT_CONTEXT_API.md](./agent/ALIGNMENT_CONTEXT_API.md); **workspace MCP tools** (not served by this repo) are thin `fetch` wrappers only — see [AGENT_TOOL_MANIFEST.md](./AGENT_TOOL_MANIFEST.md) § Workspace MCP and MiscRepos [MCP_CAPABILITY_MAP.md](../../MiscRepos/.cursor/docs/MCP_CAPABILITY_MAP.md). | Same payloads succeed via REST (CLI/curl) and MCP for list/create/patch/delete where exposed. |
| REQ-4.2 | No duplicate business logic in MCP layer. | Code review / doc states single source of truth for validation. |

---

## REQ-5 — Agent registry (menagerie v0, future-friendly)

| ID | Requirement | Acceptance criteria |
|----|-------------|---------------------|
| REQ-5.1 | **Agent** (or equivalent) entity: stable id, display name, role, model/tool **references** (not embedded secrets), workspace roots, optional link to harness policy doc. | List + detail available via API when feature ships; fields documented in OpenAPI or ADR. |
| REQ-5.2 | **No** bundled “run agent” workflow in OG — orchestration stays out of band (Cursor, scripts, external runners). | Product review confirms OG does not spawn subprocess agents by default. |

---

## REQ-6 — Link primitive

| ID | Requirement | Acceptance criteria |
|----|-------------|---------------------|
| REQ-6.1 | Support **references** between alignment rows, wiki paths (vault or mirror URI), and (when present) agent ids — as data the UI can render, not hard-coded stories. | Export or API returns link graph or join table suitable for Brain Map / future graph types. |

---

## REQ-7 — Audit / telemetry slice

| ID | Requirement | Acceptance criteria |
|----|-------------|---------------------|
| REQ-7.1 | Append-only **operator-visible** events for wiki sync completion/failure, alignment mutations, and (when implemented) agent lifecycle hooks. | Filter by agent id and time window in API or log contract documented. |
| REQ-7.2 | PII / redaction policy stub referenced from [MiscRepos `local-proto/docs/TOOL_SAFEGUARDS.md`](../../MiscRepos/local-proto/docs/TOOL_SAFEGUARDS.md) where applicable. | Doc link exists before storing sensitive fields. |

---

## REQ-8 — Operator onboarding

| ID | Requirement | Acceptance criteria |
|----|-------------|---------------------|
| REQ-8.1 | Documented path: clone → `npm install` / `npm run dev` → `/context-atlas` + optional wiki route or static files + sample alignment row (when env set). | Checklist row exists in [MiscRepos `CONTEXT_PKM_PREREQUISITES.md`](../../MiscRepos/docs/CONTEXT_PKM_PREREQUISITES.md) in lockstep with this spec. |
| REQ-8.2 | **One-clone** demo: Brain Map + OG UI runnable with MiscRepos state only; vault MCP optional. | [CONTEXT_PKM_E2E_DEMO.md](../../MiscRepos/docs/CONTEXT_PKM_E2E_DEMO.md) states minimal vs full path. |

---

## REQ-9 — Governance seam (OpenHarness)

| ID | Requirement | Acceptance criteria |
|----|-------------|---------------------|
| REQ-9.1 | Document what OpenHarness **must not** own (OG SQLite product tables, survey payloads) vs **may reference** (OG base URL, alignment ids, brain-map artifact paths). | One diagram or table in this doc or [SYSTEMS_INVENTORY](./OPENGRIMOIRE_SYSTEMS_INVENTORY.md) § Relationship to OpenHarness + pointer to OpenHarness `HANDOFF_FLOW.md`. |

---

## REQ-10 — Completion signals (agent sessions)

| ID | Requirement | Acceptance criteria |
|----|-------------|---------------------|
| REQ-10.1 | Operator runbooks (MiscRepos + vault meta) list **expected artifacts** per session type (ingest, compile, lint, alignment patch) — explicit completion, not “model stopped.” | Cross-link [MiscRepos `LLM_WIKI_VAULT.md`](../../MiscRepos/local-proto/docs/LLM_WIKI_VAULT.md) (Agent session templates). |

---

## Verification rollup

| Area | Doc / artifact |
|------|----------------|
| REST contract | [ARCHITECTURE_REST_CONTRACT.md](./ARCHITECTURE_REST_CONTRACT.md) |
| Integration | [agent/INTEGRATION_PATHS.md](./agent/INTEGRATION_PATHS.md) |
| Brain map E2E | [MiscRepos docs/BRAIN_MAP_E2E.md](../../MiscRepos/docs/BRAIN_MAP_E2E.md) |
| Brain map hub (REQ/AC) | [MiscRepos docs/BRAIN_MAP_HUB.md](../../MiscRepos/docs/BRAIN_MAP_HUB.md) |
| PKM unified demo | [MiscRepos docs/CONTEXT_PKM_E2E_DEMO.md](../../MiscRepos/docs/CONTEXT_PKM_E2E_DEMO.md) |
| MCP | [MiscRepos MCP_CAPABILITY_MAP § OpenGrimoire](../../MiscRepos/.cursor/docs/MCP_CAPABILITY_MAP.md) |
| Engineering waves + ADR-lite | [docs/plans/OPENGRIMOIRE_BASE_FEATURES_ENGINEERING_PLAN.md](./plans/OPENGRIMOIRE_BASE_FEATURES_ENGINEERING_PLAN.md) |

**Last updated:** 2026-04-16 (REQ-3.1 doc alignment: BRAIN_MAP_HUB System 3, E2E, PORT_REGISTRY, capabilities `ui_path`).
