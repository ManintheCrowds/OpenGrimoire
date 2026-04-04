# Refactor-reuse memo: alignment / context channel

> **Historical (2026-04):** References to `src/lib/supabase/*` describe an **earlier** stack; the app now uses **SQLite + Drizzle**.

**Date:** 2026-03-19  
**Question:** Before adding alignment/context storage, what can we reuse?

## Existing implementation (found)

| Area | Location | Role |
|------|----------|------|
| Survey fetch + realtime | `src/components/DataVisualization/shared/useVisualizationData.ts` | Supabase `survey_responses` + `attendees`, validation, dedupe, channel subscribe |
| Supabase client | `src/lib/supabase/client.ts` | Anon client, debug gating |
| Types | `src/lib/supabase/types.ts` (generated) | Typed rows |
| Brain map ingest | `GET /api/brain-map/graph`, `public/brain-map-graph.json` | Static operator context graph |
| Harness state | `portfolio-harness/.cursor/state/*` | Handoff, preferences, decision log (outside OpenGrimoire DB) |

## Overlap analysis

- **Survey pipeline** is specialized for `SurveyResponse` shape and visualization. Reusing it for arbitrary alignment text would **couple** unrelated concerns unless alignment is stored **on** `survey_responses` (Approach A in the design doc).
- **Brain map** solves **co-access graph** from files, not structured Q&A. Reuse as **read-only context** for agents (export JSON) alongside DB alignment rows — complementary, not duplicate.
- **Harness markdown** already holds decisions; duplicating that in Supabase without sync creates **two truths**. Prefer either file-only (Approach C) or DB-only with optional export to vault (Approach B).

## Recommendation

| Path | Verdict | Rationale |
|------|---------|-----------|
| New alignment entity in Supabase | **New table + thin hook** | Avoid overloading `useVisualizationData`; add `useAlignmentContext` or server route that mirrors Supabase patterns from existing client |
| JSONB on `survey_responses` | **Adapt** existing hook | Add optional field to select list only when feature flag on; keep validation separate |
| Agent export | **Reuse** brain map JSON + **new** alignment endpoint | Single “context bundle” can compose graph + alignment rows in one server route later |

**Explicit:** Do **not** copy-paste the full realtime subscription pattern until alignment rows need live updates; start with read + optional mutate via API route.

## Conclusion

**Reuse:** Supabase client setup, RLS discipline, debug/logging policy from visualization work.  
**Adapt:** If Approach A, extend types and query in `useVisualizationData` behind a feature flag.  
**New:** If Approach B (recommended in design doc), new migration + dedicated fetch layer to keep survey code readable.
