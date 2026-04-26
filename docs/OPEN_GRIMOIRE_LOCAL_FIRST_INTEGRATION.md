# OpenGrimoire Local-First Integration Blueprint

## Canonical naming (initiative vs upstream)

- **OpenGrimoire** (one word) is this portfolio initiative: operator-wisdom and context pipelines that enrich the brain map (optional fields like `grimoire_tags`, `trust_score`, trust overlays) without breaking local-first guarantees. Use **OpenGrimoire** in titles and narrative about what we are building.
- **OpenCompass** is the upstream third-party LLM evaluation framework (GitHub `open-compass/opencompass`, Python package `opencompass/`, default summarizer CSV outputs). Keep the name **OpenCompass** when referring to that project, clone paths, CSV artifacts, stub scripts, and machine identifiers such as `source: "opencompass"`.
- **Pipeline phrasing:** The **OpenGrimoire** pipeline **ingests** OpenCompass default summarizer CSVs into `public/brain-map-graph.local.json` via trustgraph-local-repo scripts; do not describe the initiative as if it were the OpenCompass product itself.

Purpose: define how TrustGraph, OpenCompass (upstream), and OpenGrimoire concepts integrate into OpenGrimoire without breaking local-first guarantees.

## Local-first principles

- Keep brain map as file-backed JSON input (`public/brain-map-graph*.json`).
- Treat enrichments as optional metadata fields (backward-compatible).
- Use existing API seams; avoid introducing mandatory cloud dependencies.

## Integration surfaces

- Graph read path:
  - `src/app/api/brain-map/graph/route.ts`
- Context/intent CRUD path:
  - `src/app/api/alignment-context/route.ts`
  - `src/app/api/alignment-context/[id]/route.ts`
- UI consumption:
  - `src/app/context-atlas/page.tsx`
  - `src/components/BrainMap/BrainMapGraph.tsx`

**Context atlas scope:** The **`/context-atlas`** / **`/brain-map`** UI renders **graph JSON** from `GET /api/brain-map/graph` (optional OpenGrimoire **node/edge** metadata when present in the file). It does **not** embed alignment-context records or admin tables. Alignment is a **separate** surface (API + [`/admin/alignment`](../src/app/admin/alignment/page.tsx) when logged in). Agent-facing routes and headers: [AGENT_INTEGRATION.md](./AGENT_INTEGRATION.md).

## Open Brain bridge (separate from `GET /api/brain-map/graph`)

The handoff-derived **brain map** (nodes, co-access edges) and the **Open Brain** **structured memory service** (Postgres + pgvector, `POST /memory/*` ingest/search/context) are different systems. They must not be silently merged.

- **Canonical operator graph** in this app remains the JSON consumed by `GET /api/brain-map/graph` — it is *not* replaced by the memory service.
- The optional **Open Brain** service lives in the local-proto operator workspace: `local-proto/workspace/services/open-brain-memory/` (README, Docker, Alembic). The boundary and glossary: `local-proto/workspace/docs/adr/0001-open-brain-structured-memory-boundary.md` (sibling-clone path resolution is machine-specific; search those paths in your `GitHub/` or `e:/local-proto` layout).
- To **link** a node from the file-backed graph to a row in the Open Brain `entities` table, set **`metadata.brain_map_node_id`** on the entity you ingest to the same string as **`nodes[].id`** in the brain map JSON (same id space as [alignment `linked_node_id`](./AGENT_INTEGRATION.md) when a row references a graph node). Ingestion is one-way and explicit (no automatic dual-write to SQLite or the vault).
- The Karpathy **LLM Wiki** (Obsidian `LLM-Wiki/`) stays human SSOT; optional one-way export to ingest JSON: `local-proto/workspace/scripts/export_llm_wiki_to_ingest_json.py`.

## Optional schema extensions (non-breaking)

Node/edge optional fields:

- `trust_score` (number)
- `compass_axis` (string)
- `grimoire_tags` (string[])
- `insight_level` (string)

Keep all new fields optional and ignore-unknown in UI.

## OpenGrimoire lens

- Define OpenGrimoire as an operator-wisdom layer:
  - links heuristics and context patterns
  - references provenance and constraints
  - does not replace base graph semantics
- **OG-2 (design research):** [OPENGRIMOIRE_OG2_DF_DESIGN_MINING.md](research/OPENGRIMOIRE_OG2_DF_DESIGN_MINING.md) — Dwarf Fortress–inspired mapping ideas for traits, social simulation, and intent evolution (documentation only; optional brain-map hooks; scope in [OG2_BRAINSTORM_SCOPE.md](research/OG2_BRAINSTORM_SCOPE.md)).

## Implementation phases

1. Document fields in `docs/BRAIN_MAP_SCHEMA.md` (optional extension section). **Done.**
2. Add read-only UI hints in context atlas for new metadata if present. **Done** — optional columns / tooltips in `BrainMapGraph` when nodes carry OpenGrimoire fields.
3. **Connect alignment-context entries to graph nodes via `linked_node_id`:**
   - **Shipped (data + API + admin):** `linked_node_id` on alignment rows (SQLite), create/PATCH on [`/api/alignment-context`](./agent/ALIGNMENT_CONTEXT_API.md) and admin routes, operator UI at **`/admin/alignment`**, alignment CLI — same field for humans and automation.
   - **Not shipped in the main viewer:** The context-atlas graph does **not** show alignment titles, deep links from a selected node to `/admin/alignment`, or “focus node by alignment id.” Those would be follow-up UX if you want **visual** graph ↔ alignment parity; until then, parity is **behavioral** (same `linked_node_id` string as graph `id`, set via admin or API).

## Human vs agent parity (alignment + graph)

| Who | How they use linkage |
|-----|----------------------|
| **Operator (human)** | Session cookie → **`/admin/alignment`** (and related admin pages). |
| **Agent / script** | **`GET /api/brain-map/graph`**, **`GET`/`POST`/`PATCH` `/api/alignment-context`** with `x-alignment-context-key` when enforced, or **`node scripts/alignment-context-cli.mjs`** — see [AGENT_INTEGRATION.md](./AGENT_INTEGRATION.md). |

Do not assume the **context atlas** UI exposes alignment records; readers should use **admin** or **API/CLI** for alignment, and the graph viewer for file-backed nodes only.

## Verification

- Existing graph files still render unchanged.
- New optional fields do not break API responses.
- UI degrades gracefully when fields are absent.

## Historical audits (OG-1)

- **[OG-1 naming audit (archived)](../../MiscRepos/docs/archive/og1_opencompass_opengrimoire_audit.md)** — OpenGrimoire vs OpenCompass initiative wording (2026-03-24). Stub: [`MiscRepos/.cursor/state/og1_opencompass_opengrimoire_audit.md`](../../MiscRepos/.cursor/state/og1_opencompass_opengrimoire_audit.md).
- **[OG-1 narrative sweep (2026-04-01)](./engineering/OG1_NARRATIVE_SWEEP_2026-04-01.md)** — grep follow-up; no REFRAME issues in `OpenGrimoire/docs`.
- **Workspace layout decision:** [WORKSPACE_REPO_LAYOUT.md](./WORKSPACE_REPO_LAYOUT.md) · [GitHub `README-WORKSPACE.md`](../../README-WORKSPACE.md).
