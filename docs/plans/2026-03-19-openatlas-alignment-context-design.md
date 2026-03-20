# Design: alignment and context questions (OpenAtlas + Supabase)

**Status:** Approved — **Approach B** (new `alignment_context_items` table).  
**Date:** 2026-03-19 (design); approval recorded when alignment was confirmed as a first-class product surface with agent-facing read/CRUD.

## Goal

Use OpenAtlas and its data plane (survey + related tables) as a **structured channel** for alignment and context questions: capture operator or user intent, constraints, and priorities so humans **and** agents can consume the same canonical store (not only charts).

## Requirements (numbered)

1. **Capture:** Create/update/delete alignment or context items (text, optional tags, priority, links to sessions or graph nodes).
2. **Consume:** Visualization and authorized automation (export, API, future MCP) read the same records under policy.
3. **Governance:** Separate **public demo** vs **operator-only** data (RLS, roles, or separate Supabase project for prod).
4. **Traceability:** Provenance fields: `source` (ui | import | api), `created_at`, optional `created_by`.

## Acceptance criteria (testable)

- Given a new alignment record, when an authorized client loads it, the record appears **without** logging row payloads in the browser console by default.
- Given RLS, when an anonymous client queries protected alignment rows, access is denied per policy.
- Given an export or agent read path, only columns allowed by policy are returned.

---

## Approach A — Extend `survey_responses` (JSONB)

**Idea:** Add nullable `alignment_context jsonb` (or `operator_notes jsonb`) on `survey_responses` keyed by attendee/session.

**Pros:** One pipeline (`useVisualizationData`, existing types); minimal new tables.  
**Cons:** Mixes intake survey semantics with ongoing alignment; harder to query “all open alignment questions” without scanning surveys.

**Fit:** Small teams, alignment tied 1:1 to an intake respondent.

---

## Approach B — New `alignment_context_items` table

**Idea:** Dedicated table: `id`, `title`, `body`, `tags text[]`, `priority`, `status`, `linked_node_id` (optional FK to a stable graph id string), `source`, `created_at`, `updated_at`, optional `attendee_id` FK.

**Pros:** Clear CRUD; RLS per table; agents query one entity.  
**Cons:** New migration, hooks, and possibly a small admin UI.

**Fit:** Product direction where alignment is **first-class** and not 1:1 with survey rows.

---

## Approach C — Harness files as source of truth (`.cursor/state`)

**Idea:** Keep alignment in markdown/JSON under `portfolio-harness/.cursor/state/`; OpenAtlas reads via export or sync job into static JSON (like brain map).

**Pros:** No Supabase dependency for operators; git-auditable.  
**Cons:** Not editable by non-technical users via the web app; sync complexity; two sources of truth unless Supabase is write-through.

**Fit:** Operator-only, developer-centric workflows.

---

## Recommendation

**Approach B** for long-term clarity and agent-native CRUD, **unless** you require zero new tables — then **Approach A** with strict JSON schema validation and a thin “alignment view” in the UI.

**Next step after approval:** Implementation plan (migrations, RLS sketch, one read API route, optional minimal UI), reusing `useVisualizationData` patterns only where overlap is real (see refactor-reuse memo).

## Approval

- [x] **Chosen approach: B** — dedicated table for clean CRUD, RLS, and agent queries.  
- [x] **Rationale:** Alignment is a real product surface; agents need stable access to the same rows as the UI (via policy-bound API/export later).  
- [ ] Approver (name / initials): _______________ (optional)  
- Notes: _______________
