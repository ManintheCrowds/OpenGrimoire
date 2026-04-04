# Agent-native architecture review: OpenGrimoire

**Scope:** [OpenGrimoire](../..) only (not full portfolio-harness). **Date:** 2026-03-19.

## Overall score summary

| Principle | Score | Approx. % | Status |
|-----------|-------|-----------|--------|
| Action parity | 0 / 8 | 0% | Needs work |
| Tools as primitives | 0 / 0 | N/A | Not implemented |
| Context injection | 2 / 6 | 33% | Needs work |
| Shared workspace | 3 / 4 | 75% | Partial |
| CRUD completeness | 4 / 6 | 67% | Partial |
| UI integration | 3 / 5 | 60% | Partial |
| Capability discovery | 3 / 7 | 43% | Needs work |
| Prompt-native features | 1 / 6 | 17% | Needs work |

**Blended heuristic (excluding N/A): ~35%** — strong as a **human-first** Next.js app; weak as an **agent-first** surface until APIs/tools exist.

**Status legend:** Excellent ≥80%; Partial 50–79%; Needs work &lt;50%.

---

## 1. Action parity

**User actions enumerated (representative):** load pages; submit survey / operator intake; sign in; admin workflows; view visualization; fetch brain map JSON; realtime subscribe to `survey_responses`.

**Agent tools:** None defined in-repo (no MCP server, no agent tool manifest).

| Action | Agent equivalent | Status |
|--------|------------------|--------|
| Survey submit | None | Missing |
| Admin moderation | None | Missing |
| Read visualization data | Script could use Supabase anon + RLS | Partial |
| Read brain map | HTTP GET `/api/brain-map/graph` | Partial |
| Login as user | None | Missing |
| CRUD alignment (future) | None | Missing |
| Realtime listen | None | Missing |
| Export aggregated context | None | Missing |

**Score: 0 / 8 (0%).**

---

## 2. Tools as primitives

No first-class agent tools ship with OpenGrimoire. **Score: N/A (0 tools).**  
**Guidance:** When adding automation, prefer small tools (`list_alignment`, `get_survey_summary`) over monolithic “run full analysis” workflows.

---

## 3. Context injection

| Context type | Injected for agents? | Location / notes |
|--------------|----------------------|------------------|
| Survey state | No | Client-only fetch |
| Brain map JSON | Could be fetched | Static file + API |
| User preferences | No | Not centralized for agents |
| Session / handoff | No | Lives in harness `.cursor/state`, not injected into app |
| Capability list | No | |
| Recent activity | No | |

**Score: 2 / 6** (brain map path + Supabase data *could* be wired; not prompt-injected today).

---

## 4. Shared workspace

| Store | User (UI) | Agent | Shared? |
|-------|-----------|-------|---------|
| Supabase tables | Yes (anon client) | Would use same project with keys/RLS | Yes *if* agent uses same DB |
| `brain-map-graph.json` | Yes | Yes via HTTP | Yes |
| Local `.cursor/state` | No (outside app) | Yes (editors) | Split workspace |

**Score: 3 / 4** (split between DB/graph vs harness files).

---

## 5. CRUD completeness

**Entities:** `attendees`, `survey_responses`, moderation-related tables (per migrations).

| Entity | Create | Read | Update | Delete | Notes |
|--------|--------|------|--------|--------|-------|
| Survey response | UI/API | UI + hook | Via Supabase | Policy-dependent | Agent CRUD missing |
| Attendee | Implicit with survey | Joined read | Partial | Partial | |
| Brain map | Build script | API | Rebuild | N/A | Not DB CRUD |

**Score: 4 / 6** (full parity not assessed for every admin path; agent side 0).

---

## 6. UI integration

| Agent action (hypothetical) | UI mechanism | Immediate? |
|-----------------------------|--------------|------------|
| Insert survey row | Realtime on `survey_responses` | Yes for viewers using hook |
| Update graph JSON | Manual refresh / rebuild | No push |
| Alignment rows (future) | TBD | TBD |

**Score: 3 / 5** (good Supabase realtime; no agent-driven updates tested).

---

## 7. Capability discovery

| Mechanism | Exists? | Quality |
|-----------|---------|---------|
| Onboarding | No | — |
| Help docs | Partial (`README`, guides) | Medium |
| UI hints | Low | |
| Agent self-describe | No | |
| Suggested prompts | No | |
| Empty states | Partial | |
| Slash commands | No | |

**Score: 3 / 7 (~43%).**

---

## 8. Prompt-native features

Most behavior is **code-defined** (React, API routes). Alignment copy in UI strings is not externalized as editable prompt templates.

**Score: 1 / 6** (~17%) — room to store operator “system context” in DB (see alignment design doc).

---

## Top 10 recommendations (by impact)

| Priority | Action | Principle | Effort |
|----------|--------|-----------|--------|
| 1 | Add server route(s) for read-only aggregates safe for agents (no PII in logs) | Action parity, Context | Medium |
| 2 | Introduce MCP or harness scripts that call the same routes as the UI | Action parity | Medium |
| 3 | Define CRUD tools as primitives for `alignment_context` once table exists | Tools, CRUD | Medium |
| 4 | Single “context bundle” export: brain map + alignment rows + survey stats | Context injection | Medium |
| 5 | Document agent-facing capabilities in `README` + `docs/security` boundaries | Discovery | Low |
| 6 | Tie RLS tests to agent service account / anon key smoke tests | Shared workspace | Medium |
| 7 | Replace `NEXT_PUBLIC_BRAIN_MAP_SECRET` with session-based auth for sensitive deploys | Security + parity | High |
| 8 | Event list or changelog UI when agent writes via API | UI integration | Medium |
| 9 | Store editable prompt / alignment blocks in DB, render in UI | Prompt-native | Medium |
| 10 | Capability index page listing routes + API contracts | Discovery | Low |

## Strengths

1. **Supabase realtime** gives a clear pattern for live UI when data changes.
2. **Brain map** path is a simple, cacheable contract for static context.
3. **Typed client** and RLS-aware design are the right base for future agent reads.
4. **Security docs** now centralize `NEXT_PUBLIC_*` and logging expectations.
5. **Separation** between demo visualization and operator harness files is architecturally clear.
