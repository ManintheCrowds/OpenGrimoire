# ce-review — optional step (deferred)

**Wave:** MCP hardening + OpenGrimoire System 2 audit (2026-04-18)

Per plan phase 3, **ce-review** runs when a dedicated PR/branch closes **OG-GUI-AUDIT-*** scope. This hygiene wave did not open a new OG-GUI PR; GUI evidence is Playwright-substituted per `BROWSER_REVIEW_REPORT.md` in this folder.

**When a PR exists:** run compound **ce-review** with explicit `base:` or PR number per that skill’s rules (clean worktree for checkout modes), targeting the branch that implements OG-GUI-AUDIT / System 2 fixes.

### OG-PR-4 — merge gate (compound `/ce-review`)

Before merging OpenGrimoire PRs that touch System 2 / agent-native posture:

1. Run **compound `/ce-review`** on the PR branch (or equivalent structured review), for example **`mode: report-only`** with **`base: origin/master`** so the diff is scoped to what the PR introduces.
2. Optionally steer the review with **`plan: docs/plans/OA_FR_2_SYSTEM2_DATA_VISUALIZATION.md`** when the change is visualization- or capabilities-related.
3. Record outcomes against [AGENT_NATIVE_AUDIT_OPENGRIMOIRE.md](../../../AGENT_NATIVE_AUDIT_OPENGRIMOIRE.md): **AN1** (and related items) stay **open** until policy sign-off documents a formal **waive** or **`split_done`** — do not treat green CI alone as closure of agent-native audit rows.

### OG-PR closure verification (2026-04-21)

Automatable subset executed on OpenGrimoire **`master`** (agent session):

- **Git:** `git status` clean; `git ls-files` confirms OGAN deliverables tracked (`PLAYWRIGHT_VIZ_HARNESS_SELECTORS.md`, `docs/archive/*`, `e2e/visualization-constellation-*.spec.ts`, `e2e/visualization-mock-banner.spec.ts`, `surveyVisualizationFetch.ts`).
- **Local:** `npm run verify` exit **0**; `npm run test:e2e` exit **0** (50 passed, 2 skipped).
- **CI:** `gh run list --workflow CI` shows **success** on latest `master` pushes (same commit family as viz / E2E fixes).
- **Spot routes:** `npx playwright test e2e/visualization.spec.ts e2e/auth-alignment-constellation.spec.ts` exit **0** (covers `/visualization` + `/constellation` shells).

**Not done here (operator-owned):** compound **`/ce-review`** on the merge-candidate PR branch. **AN1** (2026-04-23): Playwright second-`GET` sub-proof under **OGAN-01** **waived doc-only**; harness row set **`done`** + `split_done_tasks_to_completed.py` per [AGENT_NATIVE_AUDIT_OPENGRIMOIRE.md](../../../AGENT_NATIVE_AUDIT_OPENGRIMOIRE.md) § *OGAN backlog — closure policy* and § *AN1 harness closure*.

### OG-PR-4 status (2026-04-21)

**Harness rows (`pending_tasks` § Post-OGAN PR / merge hygiene):** **AN1** closed **2026-04-23** (waived Playwright second-`GET` sub-proof + `split_done`). **OG-PR-4** remains **`pending`**. This section records what is **done vs still open** so trackers and plans stay aligned.

| Gate | Status | Evidence / next step |
|------|--------|----------------------|
| **OG-PR-1…3, 5, 6** (automatable hygiene) | **Done on merged `master` (agent session)** | [§ OG-PR closure verification (2026-04-21)](#og-pr-closure-verification-2026-04-21) — git clean, tracked paths, `npm run verify`, `npm run test:e2e`, CI, spot Playwright. |
| **OG-PR-4** — compound **`/ce-review`** | **`pending` (operator)** | Policy still calls for compound **`/ce-review`** on the **merge-candidate PR branch** when that artifact is required. A **Cursor** session additionally produced a **`mode:report-only`** narrative review on **`master`** at tip equality with `origin/master` (empty strict diff) plus a supplemental slice from `a32c2e5` through `HEAD` for viz/nav/E2E/docs; **no blocking findings** were reported there. That narrative **does not replace** the PR-branch compound tool unless the operator explicitly accepts post-merge documentation as sufficient. |
| **AN1** — agent-native closure | **`done` (2026-04-23)** | Formal **waive** of OGAN-01 Playwright second-`GET` sub-proof + harness **`done`** + **`split_done_tasks_to_completed.py`**; canonical copy in [AGENT_NATIVE_AUDIT_OPENGRIMOIRE.md](../../../AGENT_NATIVE_AUDIT_OPENGRIMOIRE.md) § *AN1 harness closure* / *OGAN backlog — closure policy*. |
