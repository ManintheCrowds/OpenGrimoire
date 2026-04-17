# OpenGrimoire — agent-native audit (canonical)

**Role:** Gap report and **harness-facing scorecard** vs [ARCHITECTURE_REST_CONTRACT.md](./ARCHITECTURE_REST_CONTRACT.md) and [AGENT_INTEGRATION.md](./AGENT_INTEGRATION.md). This file is **not** a substitute for those contracts.

**Last updated:** 2026-04-16

---

## Related artifacts (GUI + product matrices)

| Artifact | Scope |
|----------|--------|
| [docs/audit/gui-2026-04-16-opengrimoire-survey.md](./audit/gui-2026-04-16-opengrimoire-survey.md) | System 1 — survey / moderation GUI matrix + desk audit |
| [docs/audit/gui-2026-04-16-opengrimoire-data-viz.md](./audit/gui-2026-04-16-opengrimoire-data-viz.md) | System 2 — data viz GUI matrix, dimension action items, architecture strategist synthesis |
| [docs/plans/OA_FR_1_SYSTEM1_SURVEY_MODERATION.md](./plans/OA_FR_1_SYSTEM1_SURVEY_MODERATION.md) | OA-FR-1 REQ/AC |
| [docs/plans/OA_FR_2_SYSTEM2_DATA_VISUALIZATION.md](./plans/OA_FR_2_SYSTEM2_DATA_VISUALIZATION.md) | OA-FR-2 REQ/AC |

**Harness backlog:** decomposed rows live in [MiscRepos `.cursor/state/pending_tasks.md`](../../MiscRepos/.cursor/state/pending_tasks.md) under **PENDING_OPENGRIMOIRE_AGENT_NATIVE_DECOMPOSED** (IDs `OGAN-01` …).

---

## Eight-agent scorecard (2026-04-16)

**Method:** Eight parallel **explore** subagents (compound **agent-native-audit** workflow), one per principle, against OpenGrimoire (System 2 slice + shared survey/API). **Synthesis below** is editorial; see per-principle bullets for caveats (e.g. dual definitions of “full parity”).

### Overall score summary

| Core principle | Score | Approx. % | Status |
|----------------|-------|-----------|--------|
| 1 Action parity | **4 / 15** full UI-equivalent without browser; **7 / 15** raw survey/quote bytes via HTTP | 27% strict · 47% data | ❌ |
| 2 Tools as primitives | **3 / 3** survey viz HTTP surfaces are thin reads; E2E = workflow (CI only) | 100% API | ✅ |
| 3 Context injection | **3 / 8** context types present (repo self-score) | 38% | ❌ |
| 4 Shared workspace | Single SQLite + same GET gates | 8.5 / 10 | ✅ |
| 5 CRUD completeness | HTTP over entities touching viz | ~55% strict · ~80% viz-read-scoped | ⚠️ |
| 6 UI integration | Survey POST / moderation → open `/visualization` refresh | **2 / 10** immediacy | ❌ |
| 7 Capability discovery | Seven discovery mechanisms | **4 / 7** | ⚠️ |
| 8 Prompt-native features | **0 / 8** viz behaviors defined as LLM prompts (all CODE) | 0% prompt | ⚠️ (expected for code-first viz) |

**Blended agent-native posture (this slice): ~54%** if principle 8 counts as neutral 50%; **lower** if prompt-native is mandatory product doctrine.

**Status legend:** ✅ ≈ 80%+ · ⚠️ roughly 50–79% or structural tradeoff · ❌ below 50% or blocking for that principle.

---

### 1 — Action parity (subagent c15dc530)

| User action | Agent without browser |
|-------------|------------------------|
| `GET /api/survey/visualization?all=1`, `GET /api/survey/approved-qualities` | **Full** (same gate family as UI) |
| Constellation **rows** via `?all=0&showTestData=` | **Full** |
| Alluvial/Chord tab, auto-play, theme, admin color prefs, Three camera/modes | **Browser only** |
| `/test-chord` mock chord | **Browser only** |

**Score:** **4 / 15** actions with full non-UI parity for **entire visible outcome**; **7 / 15** with **data byte** parity.

**Recommendations (abridged):** Optional **viz bundle GET** (rows + optional `processVisualizationData` output); extend OpenAPI bodies; mark `/test*` non-contractual in capabilities; persist operator prefs via API if agents must set them.

---

### 2 — Tools as primitives (subagent 1bd43be6)

Executable viz-related capabilities in-tree are **`GET` route handlers** + **`GET /api/capabilities`** — each is a **primitive** read. **No** first-party MCP server in this repo; [AGENT_TOOL_MANIFEST.md](./AGENT_TOOL_MANIFEST.md) maps to HTTP. Playwright specs are **workflow** (appropriate for CI, not agent tools).

**Score:** **N/A** for MCP count; **100%** of in-repo **HTTP tools** touching viz are primitive-shaped.

**Risk:** Stale docs pointing at missing `mcp-server/` paths — align manifests and audits.

---

### 3 — Context injection (subagent 7dc48113)

Dynamic LLM runtime injection: **no** (explicit non-goal in architecture docs). **Partial:** `GET /api/capabilities`, static docs, DOM `data-region` / `data-usage-hint`, `AGENT_TOOL_MANIFEST.md`. **Missing:** single JSON “context bundle” for dual-stack + query semantics; UI routes in capabilities; in-repo Cursor rules for viz.

**Score:** **3 / 8** ≈ **38%**.

---

### 4 — Shared workspace (subagent a517b9d4)

Single **`OPENGRIMOIRE_DB_PATH`** SQLite; user and gated agent hit same **`getVisualizationData`**. **Anti-patterns:** silent **mock fallback** in `useVisualizationData`; `?all=1` mixes test+live rows; legacy `loadSurveyData` path if revived.

**Score:** **8.5 / 10** (~**85%**).

---

### 5 — CRUD completeness (subagent 17df5450)

| Entity | Agent-relevant HTTP |
|--------|---------------------|
| Survey response | **C** POST; **R** bulk viz (no public by-id read); **U** partial via admin moderation; **D** none |
| Moderation | **R/U** via admin session; first PATCH upserts |
| Approved quotes | **R** only (derived) |

**Score:** **~55%** strict full CRUD; **~80%** if scoped to “viz is read-heavy”.

---

### 6 — UI integration (subagent 5d05adc0)

`useVisualizationData` and `useApprovedQuotes` fetch on **mount only** (`[]` deps). **No** poll/SSE. Admin moderation invalidates **queue** queries only — **not** public visualization. **Silent action:** DB changes while `/visualization` tab stays stale until remount/refresh/tab switch.

**Score:** **2 / 10** (~**20%**) for survey→viz immediacy.

---

### 7 — Capability discovery (subagent adb183fa)

Mechanisms: onboarding **partial**; help docs **strong**; UI hints **partial** (good on `DataVisualization`); ApiDiscoveryMirror **no self-describe** by design; suggested actions **partial**; empty states **partial**; slash commands **no**. **`GET /api/capabilities`** lists survey APIs but **not** `/visualization` as a workflow row.

**Score:** **4 / 7** (~**57%**).

---

### 8 — Prompt-native features (subagent a3772a35)

Alluvial/Chord/constellation lab: **CODE** (React + D3/Three). **0 / 8** rows classified as **PROMPT**-defined.

**Score:** **0%** prompt-native — **appropriate** for this product slice unless the roadmap adds a JSON/spec → renderer layer.

---

### Top 10 recommendations (by impact, deduped)

| Priority | Action | Principle |
|----------|--------|-------------|
| P1 | Add **refetch** path for viz + quotes after survey POST and after moderation (shared query key, `router.refresh`, focus, or interval). | UI integration |
| P2 | Extend **`GET /api/capabilities`** with `workflows` / `ui_surfaces` for `/visualization`, `/constellation`, query semantics (`all` vs `showTestData`). | Capability discovery · Context injection |
| P3 | Optional **GET** returning rows + optional **precomputed graph** for constellation mode (or document “must run `processVisualizationData` locally”). | Action parity |
| P4 | **Banner** when `isMockData` / empty API — kill silent mock confusion. | Shared workspace · Task success |
| P5 | **OpenAPI** response schemas for visualization + approved-qualities bodies. | Action parity · Tools |
| P6 | **Single client module** for visualization fetch query shapes (prevent `?all=1` drift). | Action parity · Architecture |
| P7 | **Archive or fix** root `## Master System Prompt*` file if still Supabase-stale. | Context injection |
| P8 | Mark **`/test*`** explicitly non-contractual in capabilities or agent docs. | Action parity |
| P9 | **Persist** theme/autoplay/color prefs via authenticated API if operators need agent parity. | Action parity |
| P10 | If prompt-native ever required: **versioned chart spec JSON** + thin renderer over existing D3. | Prompt-native |

---

### What is working well

1. **Thin HTTP primitives** for PII survey reads with a single gate implementation.  
2. **Single SQLite SSOT** for persisted survey data used by viz APIs.  
3. **`GET /api/capabilities` + AGENT_INTEGRATION** as the discovery spine for external agents.  
4. **DOM contract** (`data-region`, `data-testid`, `vizLayoutIds`) for browser automation.  
5. **Code-first D3/Three** — clear ownership; no fake “LLM drives layout” story.

---

## References

- [PUBLIC_SURFACE_AUDIT.md](./security/PUBLIC_SURFACE_AUDIT.md)
- [MiscRepos GUI audit portfolio index](../../MiscRepos/docs/audit/GUI_AUDIT_PORTFOLIO_INDEX.md)
