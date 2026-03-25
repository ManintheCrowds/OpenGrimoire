# OpenGrimoire Local-First Integration Blueprint

## Canonical naming (initiative vs upstream)

- **OpenGrimoire** (one word) is this portfolio initiative: operator-wisdom and context pipelines that enrich the brain map (optional fields like `grimoire_tags`, `trust_score`, trust overlays) without breaking local-first guarantees. Use **OpenGrimoire** in titles and narrative about what we are building.
- **OpenCompass** is the upstream third-party LLM evaluation framework (GitHub `open-compass/opencompass`, Python package `opencompass/`, default summarizer CSV outputs). Keep the name **OpenCompass** when referring to that project, clone paths, CSV artifacts, stub scripts, and machine identifiers such as `source: "opencompass"`.
- **Pipeline phrasing:** The **OpenGrimoire** pipeline **ingests** OpenCompass default summarizer CSVs into `public/brain-map-graph.local.json` via trustgraph-local-repo scripts; do not describe the initiative as if it were the OpenCompass product itself.

Purpose: define how TrustGraph, OpenCompass (upstream), and OpenGrimoire concepts integrate into OpenAtlas without breaking local-first guarantees.

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

1. Document fields in `docs/BRAIN_MAP_SCHEMA.md` (optional extension section).
2. Add read-only UI hints in context atlas for new metadata if present.
3. Connect selected alignment-context entries to graph nodes via `linked_node_id`.

## Verification

- Existing graph files still render unchanged.
- New optional fields do not break API responses.
- UI degrades gracefully when fields are absent.
