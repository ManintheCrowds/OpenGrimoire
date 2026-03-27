# Agent-Native Architecture Review: OpenAtlas (OpenGrimoire)

**Date:** 2026-03-26  
**Scope:** `c:\Users\Dell\Documents\GitHub\OpenAtlas` (Next.js app + APIs + docs).  
**Method:** Eight parallel codebase audits (one per principle), then compiled here.

---

## Overall score summary

Status column matches the **status legend** below (Excellent ≥80%, Partial 50–79%, Needs work <50%, N/A contract carve-out).

| Core principle | Score | Headline % | Status |
|----------------|-------|------------|--------|
| 1. Action Parity | 22/22 HTTP; 4/22 CLI-covered; 0 MCP | **100%** REST parity; **~18%** first-party CLI/MCP coverage | **Excellent** (REST); see dual-lens |
| 2. Tools as Primitives | 13/16 routes primitive + 1 CLI → **14/17** | **~82%** | **Excellent** |
| 3. Context Injection | **3/8** extended rubric; **3/3** primary harness surfaces | **38%** full rubric; **100%** primary data plane | **Needs work** (rubric); **Excellent** (contract lens — see note) |
| 4. Shared Workspace | Qualitative 7/10 | **~70%** | Partial |
| 5. CRUD Completeness | 1/5 strict full CRUD; **3/5** entity families with agent **write** HTTP | **20%** strict; **~60%** write-coverage lens | **Needs work** (strict); **Partial** (write-coverage — see note) |
| 6. UI Integration | 6/12 checks | **50%** | Partial (lower bound) |
| 7. Capability Discovery | Checklist **27/49** ≈ **55%** | **55%** (single headline); mean **~3.9/7** in §7 | Partial |
| 8. Prompt-Native (in-app) | 0/11 LLM-orchestrated features | **0%** (not applicable to product goals) | **N/A** (by design) |

**Note — Action parity:** At the **HTTP layer**, every documented API method is invocable by an agent with the same auth as an authorized human (**22/22**). **MCP tools** are **not** shipped in-repo; only **alignment-context-cli** covers a subset. See `docs/AGENT_INTEGRATION.md` (thin MCP backlog).

**Note — Principle 3 (improved framing):** The **38%** is an **8-row rubric** that expects in-app LLM prompt assembly. Against the **stated architecture** (harness owns prompts), the **three** first-class machine surfaces — `GET /api/capabilities`, alignment API, brain-map graph — are **fully exposed for injection upstream**, i.e. **3/3 = 100%** for “data the app is meant to feed agents.” Keep **Needs work** on the full rubric if you ever add an in-app agent shell.

**Note — Principle 5 (improved framing):** **20%** counts only entities with **Create+Read+Update+Delete** on the *same* resource type (**1/5** = alignment-as-document only). **Write-coverage lens:** among five audited families, **three** expose agent-usable **writes** — (1) alignment public API, (2) survey `POST` + moderation `PATCH`, (3) auth session establishment — while **graph** is read-only via HTTP and **admin** largely mirrors alignment with cookie auth. **3/5 = 60%** as a coarse “agent can change persisted state” score; strict per-entity CRUD remains **Needs work**.

**Note — Principle 8:** `docs/ARCHITECTURE_REST_CONTRACT.md` places system prompts and prompt bundles in harness/Cursor, not in-app. **0%** = no in-app LLM orchestration; **exclude from blended “readiness”** scores below.

### Multi-axis scorecard (replaces single blended %)

| Axis | What it measures | Score | Notes |
|------|------------------|-------|--------|
| **A. Agent connectivity** | REST parity + primitive-shaped APIs + primary harness data surfaces | **~94%** | Mean of 100% (REST), 82% (primitives), 100% (3/3 surfaces) |
| **B. Product integration** | Shared workspace, UI refresh after agent/backend changes, capability discovery | **~58%** | Mean of 70%, 50%, 55% |
| **C. Strict entity CRUD** | Full CRUD per entity type | **20%** | Unchanged; survey/graph/session are intentionally asymmetric |
| **D. First-party tooling** | Shipped CLI + MCP per operation | **~18%** | Alignment CLI only; MCP backlog |

**Do not** average A–D into one headline without naming the axis. For **“can agents use this app as documented?”** lead with **Axis A**. For **“does the UI feel live when agents change data?”** use **Axis B**. Principle **8** is **out of scope** for OpenGrimoire’s current contract.

**Residual risks (agent-native angle):**

- **Untrusted content:** Alignment `title`/`body` and survey text are not LLM-sanitized in-app; harness must apply SCP / containment before model ingestion (`docs/AGENT_INTEGRATION.md`).
- **Manifest drift:** New routes must update `GET /api/capabilities` and pass `npm run verify:capabilities` (`scripts/verify-capabilities-routes.mjs`).
- **Session scope:** Admin cookie endpoints (`/api/admin/*`) are a high-value target; keep env and SameSite posture documented for deploys.
- **Key power:** `ALIGNMENT_CONTEXT_API_SECRET` can unlock more than alignment if coupled to survey read gates — see security appendix.

### Status legend

- **Excellent (80%+):** Tools as Primitives; Action Parity at REST layer; Context Injection **only** under “primary harness surfaces” lens (3/3).
- **Partial (50–79%):** Shared Workspace; UI Integration; Capability Discovery; CRUD under **write-coverage** lens (~60%).
- **Needs work (<50%):** Context Injection on **full 8-type rubric** (38%); CRUD on **strict full CRUD per entity** (20%).
- **N/A / by design:** Prompt-Native **in-app** (0% — no embedded LLM per contract).

---

## Top 10 recommendations by impact

| Priority | Action | Principle | Effort |
|----------|--------|-----------|--------|
| 1 | Ship thin MCP (or document canonical `curl` recipes) for high-traffic routes beyond alignment CLI | Action Parity | M |
| 2 | Remove or implement `realtime` flag on `useVisualizationData` (dead param misleads) | UI Integration | S |
| 3 | Align E2E empty-state selector with real DOM or add `data-testid` / landmark | Capability Discovery / QA | S |
| 4 | Document brain-map rebuild cadence + `.local.json` vs committed JSON for one truth | Shared Workspace | S |
| 5 | Add `/help` or drawer linking `docs/USAGE_GUIDE.md`, capabilities, alignment rules | Capability Discovery | S–M |
| 6 | If survey is agent-relevant: narrow REST primitives or document `POST /api/survey` as UI workflow only | Tools as Primitives / CRUD | M |
| 7 | Optional polling or `router.refresh` after survey submit for visualization consumers | UI Integration | M |
| 8 | Standardize harness “OpenGrimoire context block” template (capabilities + alignment + graph) | Context Injection | S (docs) |
| 9 | Clarify Supabase-as-legacy in developer guide vs SQLite runtime | Shared Workspace | S |
| 10 | Optional OpenAPI or `/.well-known` alias to `/api/capabilities` — **done when:** one discovery URL returns 200 with route list or redirects to capabilities JSON | Capability Discovery | M |

---

## What is working well

1. **Hand-maintained `GET /api/capabilities`** + `verify:capabilities` script keeps the manifest honest.  
2. **Alignment context**: full CRUD over HTTP, shared SQLite with admin UI, thin CLI for public API.  
3. **Brain map**: single read path via `/api/brain-map/graph`; clear secret/header story in docs.  
4. **`/capabilities` page** + nav entry: strong operator-facing discovery.  
5. **Explicit architecture contract** (`ARCHITECTURE_REST_CONTRACT.md`, `AGENT_INTEGRATION.md`) reduces ambiguity about what belongs in-app vs harness.

---

## Per-principle summaries (from sub-audits)

### 1. Action Parity

- **User actions:** 22 API method surfaces; client `fetch` mapped in admin, brain map, survey, visualization, capabilities, auth, test-data.  
- **Agent path:** Same REST; no first-party MCP. CLI: `alignment-context-cli.mjs` only.  
- **Score:** **22/22 (100%)** REST; low if scoring MCP/CLI coverage only. **Enumeration:** match `routes` in `src/app/api/capabilities/route.ts` (expanded methods) and verify with `npm run verify:capabilities` / `scripts/verify-capabilities-routes.mjs`.

### 2. Tools as Primitives

- **13/16** API routes classified **primitive**; **3/16 workflow-style** (survey POST, visualization GET, approved-qualities GET).  
- **+1** surface = `alignment-context-cli.mjs` (primitive) → **14/17** HTTP+CLI agent-facing tools. **~82%** primitive. No in-repo MCP.

### 3. Context Injection

- **No in-app LLM**; harness fetches capabilities, alignment, brain-map JSON.  
- **3/8** rubric rows for external injectable surfaces (aligned with prior `docs/AGENT_NATIVE_AUDIT_OPENGRIMOIRE.md`).

### 4. Shared Workspace

- Alignment + survey share SQLite; brain map is file-backed with **out-of-band** writes via builder.  
- **7/10** — split authority on graph, not a shadow agent DB.

### 5. CRUD Completeness

- **Full CRUD** on one primary entity: **alignment context** (documents).  
- Graph nodes: read-only API; survey: create + gated reads + moderation PATCH; auth session: login/session/logout (not generic entity PATCH).  
- **Strict 1/5 entities** full CRUD. **Write-coverage lens:** **3/5** families with agent writes → **~60%** (see table note).

### 6. UI Integration

- Admin alignment: refresh after mutations + focus/visibility. Brain map: cache-bust + Reload.  
- Visualization/approved quotes: mount-only fetch; **`realtime` unused**.  
- **6/12** integration checks.

### 7. Capability Discovery

- Strong: `/capabilities`, API manifest, metadata, brain map empty copy.  
- Weak: help route, slash commands in-repo, structured onboarding.  
- **Metrics:** (A) **27/49** = sum of 0–7 scores across 7 mechanisms in sub-audit checklist; (B) **~3.9/7** = mean strength per mechanism — different views of the same pass, not duplicate percentages. E2E vs `.empty-state` mismatch flagged.

### 8. Prompt-Native Features

- **0/11** features driven by **in-app LLM orchestration** — **intentional** per `ARCHITECTURE_REST_CONTRACT.md`. Copy/config could still move to JSON/CMS without an LLM (separate from this score).

---

## References

- `docs/AGENT_INTEGRATION.md`  
- `docs/ARCHITECTURE_REST_CONTRACT.md`  
- `docs/agent/INTEGRATION_PATHS.md`  
- `docs/AGENT_NATIVE_AUDIT_OPENGRIMOIRE.md`  
- `src/app/api/capabilities/route.ts`  
- `docs/audit/gui-2026-03-26.md` (related GUI/E2E context)  
- `docs/USAGE_GUIDE.md`  
- `scripts/verify-capabilities-routes.mjs` (route ↔ manifest parity)

---

## Appendix A — Critic review (meta)

**Pass (first compile):** false — internal consistency (legend vs rows 2–3; row 1 status). **Pass (second pass):** addressed — status column aligned to legend; Tools-as-Primitives marked Excellent; Context Injection **Needs work** on full rubric with explicit **contract lens** upgrade; CRUD dual lens added; single blended % replaced by **multi-axis scorecard** (critic recommendation). **Second critic cycle:** rating_quality_pass false → **fixes applied in doc** (2026-03-26 follow-up).

---

## Appendix B — Security sentinel (agent surfaces)

Prioritized findings from static review (no live pentest):

| Sev | Topic | Recommendation (abbrev) | Status |
|-----|--------|-------------------------|--------|
| High | `NEXT_PUBLIC_BRAIN_MAP_SECRET` exposes gate in client bundle | Server-only secret or signed URLs; see `docs/security/NEXT_PUBLIC_AND_SECRETS.md` | **Addressed (Track M):** `GET /api/brain-map/graph` accepts operator session when `BRAIN_MAP_SECRET` is set; UI uses `credentials: 'include'`; doc in `NEXT_PUBLIC_AND_SECRETS.md`. |
| High | `x-alignment-context-key` may unlock survey PII reads (`survey-read-gate`) | Split keys: separate secret for survey visualization vs alignment | **Addressed:** alignment key for survey reads only if `ALIGNMENT_CONTEXT_KEY_ALLOWS_SURVEY_READ=true`; default off. |
| Medium | PATCH alignment may allow `source` tampering | Restrict `source` to server/admin-only | **Addressed:** public `PATCH` uses schema without `source`; admin route retains `source`. |
| Medium | No rate limits on alignment / brain-map APIs | Per-IP / per-key throttles | Open |
| Medium | In-memory rate limit weak under multi-instance | Shared limiter in production | Open |
| Medium | Anonymous survey flood (NULL email duplicates) | Stronger caps, honeypot, or session soft-id | Open |
| Low | Untrusted alignment body for downstream LLM | Harness SCP; optional consumer flags | Open |
| Low | CSRF | `SameSite=lax` today; verify if cross-origin credentialed admin added | Open |
| Low | No CSP globally | Tighten as UI grows | Open |
| Low | `test-data` route | Allowlist if ever reads files; keep dev-only | Open |
| Info | Public capabilities aids recon | Acceptable for agent-native; trim if needed | Open |
| Info | `ALIGNMENT_CONTEXT_ALLOW_INSECURE_LOCAL` / survey public flags | Fail closed in prod deploy checks | Open |

Full narrative: security-sentinel sub-agent output in session (Agent ID `05fac08e-8f22-4918-a516-7ad61b7a2024`).
