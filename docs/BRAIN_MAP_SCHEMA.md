# Brain map / context graph JSON schema

This document describes the payload returned by `GET /api/brain-map/graph`. The API prefers **`public/brain-map-graph.local.json`** when that file exists (personal or vault-inclusive builds; gitignored by default), otherwise **`public/brain-map-graph.json`**. The file is produced by `portfolio-harness/.cursor/scripts/build_brain_map.py` (or `BRAIN_MAP_OUTPUT`).

## Top-level object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `nodes` | array | yes | Graph vertices |
| `edges` | array | yes | Undirected co-access edges |
| `generated` | string | yes | ISO 8601 UTC timestamp when the file was built |
| `sessionCount` | number | yes | Number of sessions aggregated |
| `sourceRoots` | array | no | When present: `{ path, label }[]` — roots merged into this file. State roots use `label` as the session-id prefix in `edges[].sessions` (e.g. `openharness:handoff_latest`). Vault roots appear as `label` prefixed with `vault:` (e.g. `vault:notes`). Omitted in older files; UI ignores if unknown. |

## Node object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Stable id (normalized path, forward slashes) |
| `group` | string | yes | One of: `core`, `memory`, `publishing`, `tools`, `skills`, `general` (from builder path rules) |
| `accessCount` | number | yes | How many sessions referenced this path |
| `path` | string | yes | Display path (usually matches `id`) |
| `layer` | string | no | `state` (`.cursor/state` ingest) or `vault` (markdown vault). If omitted, UI treats nodes as **`state`** for filtering. |
| `constraint` | string | no | Short human-readable rule or decision tied to this artifact |
| `provenance` | string | no | Provenance: `handoff`, `vault`, or `git` (field name avoids clashing with edge `source` id) |
| `risk_tier` | string | no | `low`, `medium`, `high`, `critical` (aligns with harness risk tiers) |
| `review_status` | string | no | `draft`, `reviewed`, `stale` |

The builder emits `id`, `group`, `accessCount`, `path`, **`layer`**, **`provenance`**, and vault-specific `id`/`path` prefixes (`vault/<label>/...`). Optional fields such as `constraint` / `risk_tier` are for forward-compatible enrichments.

## Edge object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `source` | string | yes | Source node id |
| `target` | string | yes | Target node id |
| `weight` | number | yes | Co-access count |
| `sessionType` | string | yes | Edge coloring: `strategy`, `memory`, `publishing`, `infrastructure`, `research`, `general` |
| `sessions` | string[] | yes | Session ids that contributed. With **multi-root** ingest, ids are `label:session` (e.g. `portfolio-harness:2026-03-19`, `openharness:handoff_latest`). Single-root legacy builds use unprefixed ids such as `handoff_latest`. Vault sessions use `vault_label:session_id`. |
| `constraint` | string | no | Optional; same semantics as node |
| `provenance` | string | no | Optional provenance (`handoff` \| `vault` \| `git`) |
| `layer` | string | no | `state` or `vault`; aligns with endpoint nodes. Omitted in legacy files (**treated as `state`** in the UI). |
| `risk_tier` | string | no | Optional |
| `review_status` | string | no | Optional |

## API behavior

- Route: [`src/app/api/brain-map/graph/route.ts`](../src/app/api/brain-map/graph/route.ts)
- Reads **`public/brain-map-graph.local.json` first** if present, else `public/brain-map-graph.json`.
- If `BRAIN_MAP_SECRET` is set, clients must send header `x-brain-map-key` with that value; otherwise 401.
- The UI may read a matching value from `NEXT_PUBLIC_BRAIN_MAP_SECRET`, which is **exposed in the browser bundle** — see [security/NEXT_PUBLIC_AND_SECRETS.md](./security/NEXT_PUBLIC_AND_SECRETS.md).
- Response `Cache-Control: no-store`.

## Backward compatibility

- Consumers must ignore unknown fields.
- New optional fields must not be required by the UI; the OpenAtlas viewer tolerates their absence.

## State ingest (builder)

Markdown under each configured `.cursor/state` root (`daily/`, `handoff_latest.md`, `handoff_archive/`, `decision-log.md`) is screened with **SCP** (`scp` package when installed) before path extraction—the same helper as vault ingest. **Injection** tier: that file is skipped (no nodes/edges from it). If `scp` is not importable, text is used as read (legacy behavior).

## Vault ingest (builder)

When `BRAIN_MAP_VAULT_ROOTS` (or `--vault-root`) is set, the builder walks `*.md` under each vault (skips `.obsidian`, `node_modules`, `.git`). Extracted text is screened with **SCP** (`scp` package when installed) before link extraction. Co-access edges come from wikilinks and file links in markdown. Default output file is `brain-map-graph.local.json` when `BRAIN_MAP_OUTPUT` is unset and at least one vault root is configured—see script docstring in `build_brain_map.py`.

## Future ingest extension points

- **Folder watch:** Watch `.cursor/state/**/*.md` (or `CURSOR_STATE_DIR`), debounce, rerun `build_brain_map.py`, overwrite JSON. The app refetches on navigation/refresh.
- **SQLite:** Optional local index (hashes, multi-repo merge) with a final write step that still outputs this JSON shape for the viewer.
- **PDF → graph (future):** If PDFs are ever ingested into a knowledge or brain-map pipeline, use the same **SCP + provenance** pattern as other untrusted text (file hash, parser version, no trust in extracted text without screening). See portfolio-harness [`docs/integrations/OPENDATALOADER_PDF.md`](../../docs/integrations/OPENDATALOADER_PDF.md); no product code until scope exists.

Local-first framing: [Open Local First](https://openlocalfirst.org/); if you keep a checkout of the author’s `local-first` notes next to this repo, see `../local-first/README.md`, `RESOURCES.md`, and `AI_SECURITY.md` for sync engines, data ownership, traceability, and HITL patterns when aggregating operator context.

## Backlog (not implemented)

- **Fedimint / Bitcoin:** Any mapping of ecosystem objects (e.g. guardians, modules, ecash) to graph nodes should be **documentation and optional node metadata only** until explicit product scope exists—no protocol integration claims.
- **On-chain or inscription text:** If ingest ever includes Bitcoin-sourced content, apply harness **SCP / provenance** gates before persisting or feeding to models (see portfolio-harness `BITCOIN_AGENT_CAPABILITIES` / `TOOL_SAFEGUARDS` references).
