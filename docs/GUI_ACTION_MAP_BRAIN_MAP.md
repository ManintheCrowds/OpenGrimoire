# GUI action map — Brain map / context atlas (OpenGrimoire + OpenHarness)

**Purpose:** Agent-native parity: enumerate **operator-facing** actions for the context graph, show where the **canonical UI** lives (this app), and how **OpenHarness** state flows into the graph. **Normative data/build notes:** [OPENGRIMOIRE_SYSTEMS_INVENTORY.md](OPENGRIMOIRE_SYSTEMS_INVENTORY.md) § Relationship to OpenHarness, § Which `build_brain_map.py`.

**Last reviewed:** 2026-04-05

---

## Canonical operator surface (OpenGrimoire)

| # | Human action | UI / route | API or data | Agent parity (tools) |
|---|--------------|------------|-------------|----------------------|
| 1 | Open context graph | `GET /context-atlas` (primary) or `GET /brain-map` (alias → same UI) | `GET /api/brain-map/graph` | `browser_navigate` / MCP browser to origin + path; or `fetch` / HTTP client to API |
| 2 | View graph (force layout, pan/zoom) | Same page — vis/D3 shell (see `src/components/BrainMap/`) | Same JSON | Same as human; E2E: `e2e/brain-map*.spec.ts` |
| 3 | Switch Graph / Table / layers (if UI exposes) | In-app tabs/controls | Mocked in a11y E2E | Snapshot + `getByRole` patterns per [audit/gui-2026-03-26.md](audit/gui-2026-03-26.md) |
| 4 | Refresh graph after rebuild | Refresh control (when present) | Re-reads static/API | Re-run build script, then reload or hit API |
| 5 | Use **local** merged graph (vault + multi-state) | Same routes | Prefer `public/brain-map-graph.local.json` when present ([README.md](../README.md)) | Read/write `public/` only via approved paths; agents use `build_brain_map.py` output |

**Secrets:** If `BRAIN_MAP_SECRET` / `NEXT_PUBLIC_BRAIN_MAP_SECRET` is set, API may require header — see [docs/security/NEXT_PUBLIC_AND_SECRETS.md](security/NEXT_PUBLIC_AND_SECRETS.md).

---

## Pulling **OpenHarness** into the graph (data, not UI)

OpenHarness does **not** host the Next.js viewer. Operators use **OpenGrimoire** for the GUI. The **graph JSON** can include nodes derived from **OpenHarness** handoff/state when you merge state roots:

1. Set `CURSOR_STATE_DIRS` (or `build_brain_map.py` `--state-dir`) to include **both** MiscRepos and OpenHarness `state/` paths — see [OPENGRIMOIRE_SYSTEMS_INVENTORY.md](OPENGRIMOIRE_SYSTEMS_INVENTORY.md) § “Why OpenHarness files may not appear” and the **Windows** example with `OpenHarness\state`.
2. Run **`MiscRepos/.cursor/scripts/build_brain_map.py`** (recommended) or the smaller **OpenHarness** copy for harness-only trees.
3. Output targets **`OpenGrimoire/public/brain-map-graph.local.json`** (default when using full script + vault/multi-root) or **`public/brain-map-graph.json`**.
4. Open **`/context-atlas`** — `GET /api/brain-map/graph` serves the file the app prefers.

**Agent parity:** Same as humans: run the Python builder with correct env/CLI, then verify the API or file on disk.

---

## Secondary: OpenHarness `scripts/brain_map_viewer.html` (static viewer)

Use when **Next.js is not running** (quick check of a JSON file) or in a **harness-only** clone. Same **graph schema** (`nodes` / `edges` as consumed by `toVisData` in the HTML).

| # | Human action | Mechanism | Agent parity |
|---|--------------|-----------|--------------|
| A | Open viewer | Double-click / open `OpenHarness/scripts/brain_map_viewer.html` in a browser | Cannot “click”; agent can open file URI if policy allows, or instruct operator |
| B | Load co-located JSON | If served from same directory as the file, `fetch('brain-map-graph.json')` | Place/copy generated JSON next to HTML or serve directory |
| C | Load arbitrary JSON | **Choose file** button or **drag-drop** `.json` onto dropzone | Human-only file picker; agent can write JSON to path and ask operator to open |
| D | Pan / zoom / hover node | vis-network default interaction | Browser automation for smoke |
| E | Empty / invalid file | Status text + dropzone | Assert status string in E2E if automated |

**Not duplicated in OpenGrimoire:** No admin, no API, no SQLite — file + vis-network only.

---

## Waiver vs full GUI map

- **OpenGrimoire** routes above are the **operator-facing** map for agent-native audits tied to this product.
- **OpenHarness** HTML is **documented here** so harness audits do not claim “no GUI” while ignoring the static viewer; full parity for the HTML file is **secondary** to `/context-atlas`.

---

## See also

- [OPENGRIMOIRE_SYSTEMS_INVENTORY.md](OPENGRIMOIRE_SYSTEMS_INVENTORY.md) — routes, APIs, build env
- [OpenHarness `docs/CHEATSHEET.md`](../../OpenHarness/docs/CHEATSHEET.md) — Agent invocation index (`brain_map_viewer.html`)
- [OpenHarness `scripts/brain_map_viewer.html`](../../OpenHarness/scripts/brain_map_viewer.html) — source
- [MiscRepos `build_brain_map.py`](../../MiscRepos/.cursor/scripts/build_brain_map.py) — canonical builder (sibling repo layout under `GitHub/`)
