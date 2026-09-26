---
title: Unify OpenGrimoire brain-map static path guards (#57+#58+#59)
date: 2026-09-26
artifact_contract: ce-unified-plan/v1
artifact_readiness: implementation-ready
execution: code
product_contract_source: lfg-ce-plan-bootstrap
routing_class: shop_only
target_repo: ManintheCrowds/OpenGrimoire
---

# Plan: Unify brain-map static path guards + unblock CI check name

## Goal Capsule

**Objective:** Ship one OpenGrimoire PR that keeps #57 encode+normalize fail-closed gating and layers #58 (hyphen/tilde/`_` backups) and #59 (Finder/VS Code pre-extension duplicates) onto the **normalized** pathname — then fix branch-protection required check context `CI` (today only `verify-and-e2e` reports). Close superseded drafts #56/#58/#59.

**Authority:** Security > correctness > this plan. Do not merge #51 as this leak; do not expand to #55–#14.

**Stop when:** Unified PR open, unit tests green, CI decided (check named `CI` green), drafts closed. Human approving review still required (`required_approving_review_count: 1`).

## Product Contract

### Settled decisions (session)

| Decision | Provenance | Rejected alternative | Reason |
|----------|------------|----------------------|--------|
| session-settled: Slice = brain-map static only (#57–#59 + close #56) | user-directed | LFG entire OG backlog | Pending: picked slice only |
| session-settled: Do not merge #51 as this leak | user-approved | Treat CVE PR as same fix | Different class |
| session-settled: Do not land #58/#59 as-is | session | Merge drafts independently | They drop normalize and re-break encoding |
| session-settled: One unified PR | user-approved | Stack three merges | Regex conflict |
| session-settled: Fix required check name `CI` | session | UI-only protection edit | Durable in repo |

### Requirements

| ID | Requirement |
|----|-------------|
| R1 | Percent-encoded static graph URLs blocked after normalize (#57) |
| R2 | Hyphen/tilde/`_` backups after `.json` blocked (#58) |
| R3 | Finder/VS Code duplicates before `.json` blocked (#59) |
| R4 | Guard uses normalized pathname; fail-closed encodings not suffix-hits |
| R5 | `/api/brain-map/graph` and `/meta` not blocked |
| R6 | Actions publishes check named `CI` (protection context) |
| R7 | Close #56/#58/#59 superseded; no work on #55–#14 |

## Planning Contract

### Key Technical Decisions

| ID | Decision | Rejected | Reason |
|----|----------|----------|--------|
| KTD1 | session-settled: After normalize use `/^\/brain-map-graph[^/]*\.json(?:$|[^/])/i` | #59 regex without normalize | Encoding bypass |
| KTD2 | session-settled: Add job `CI` needing `verify-and-e2e` | Rename long job only | Minimal alias |
| KTD3 | session-settled: Branch from `master`; new PR | Force-push drafts | Clean review |

## Implementation Units

### U1. Unified static-path-guard + tests
- **Files:** `src/lib/brain-map/static-path-guard.ts`, `static-path-guard.test.ts`
- **Requirements:** R1–R5

### U2. CI check alias job
- **Files:** `.github/workflows/ci.yml`
- **Requirements:** R6

### U3. PR + close drafts
- **Requirements:** R7

## Verification Contract

```text
npx vitest run src/lib/brain-map/static-path-guard.test.ts
gh pr checks <pr>
```

## Definition of Done

- Unified PR vs `master`; tests green; check `CI` green; drafts closed; human review requested; #51 untouched
