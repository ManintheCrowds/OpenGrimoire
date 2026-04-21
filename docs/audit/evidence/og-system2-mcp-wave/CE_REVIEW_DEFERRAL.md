# ce-review — optional step (deferred)

**Wave:** MCP hardening + OpenGrimoire System 2 audit (2026-04-18)

Per plan phase 3, **ce-review** runs when a dedicated PR/branch closes **OG-GUI-AUDIT-*** scope. This hygiene wave did not open a new OG-GUI PR; GUI evidence is Playwright-substituted per `BROWSER_REVIEW_REPORT.md` in this folder.

**When a PR exists:** run compound **ce-review** with explicit `base:` or PR number per that skill’s rules (clean worktree for checkout modes), targeting the branch that implements OG-GUI-AUDIT / System 2 fixes.

### OG-PR-4 — merge gate (compound `/ce-review`)

Before merging OpenGrimoire PRs that touch System 2 / agent-native posture:

1. Run **compound `/ce-review`** on the PR branch (or equivalent structured review), for example **`mode: report-only`** with **`base: origin/master`** so the diff is scoped to what the PR introduces.
2. Optionally steer the review with **`plan: docs/plans/OA_FR_2_SYSTEM2_DATA_VISUALIZATION.md`** when the change is visualization- or capabilities-related.
3. Record outcomes against [AGENT_NATIVE_AUDIT_OPENGRIMOIRE.md](../../../AGENT_NATIVE_AUDIT_OPENGRIMOIRE.md). **AN1** is **closed** (waive + `split_done`); **OG-PR-4** may close via PR-branch **`/ce-review`** or an explicit operator waive — see [§ OG-PR-4 operator waive (2026-04-21)](#og-pr-4-operator-waive-2026-04-21).

### OG-PR closure verification (2026-04-21)

Automatable subset executed on OpenGrimoire **`master`** (agent session):

- **Git:** `git status` clean; `git ls-files` confirms OGAN deliverables tracked (`PLAYWRIGHT_VIZ_HARNESS_SELECTORS.md`, `docs/archive/*`, `e2e/visualization-constellation-*.spec.ts`, `e2e/visualization-mock-banner.spec.ts`, `surveyVisualizationFetch.ts`).
- **Local:** `npm run verify` exit **0**; `npm run test:e2e` exit **0** (50 passed, 2 skipped).
- **CI:** `gh run list --workflow CI` shows **success** on latest `master` pushes (same commit family as viz / E2E fixes).
- **Spot routes:** `npx playwright test e2e/visualization.spec.ts e2e/auth-alignment-constellation.spec.ts` exit **0** (covers `/visualization` + `/constellation` shells).

**AN1 (2026-04-23):** Playwright second-`GET` sub-proof under **OGAN-01** **waived doc-only**; harness row **`done`** + `split_done_tasks_to_completed.py` per [AGENT_NATIVE_AUDIT_OPENGRIMOIRE.md](../../../AGENT_NATIVE_AUDIT_OPENGRIMOIRE.md) § *OGAN backlog — closure policy* and § *AN1 harness closure*.

### OG-PR-4 status (2026-04-21)

**Harness rows (`pending_tasks` § Post-OGAN PR / merge hygiene):** **AN1** closed **2026-04-23** (waived Playwright second-`GET` sub-proof + `split_done`). **OG-PR-4** closed **2026-04-21** via [operator waive](#og-pr-4-operator-waive-2026-04-21) + harness archive.

| Gate | Status | Evidence / next step |
|------|--------|----------------------|
| **OG-PR-1…3, 5, 6** (automatable hygiene) | **Done on merged `master` (agent session)** | [§ OG-PR closure verification (2026-04-21)](#og-pr-closure-verification-2026-04-21) — git clean, tracked paths, `npm run verify`, `npm run test:e2e`, CI, spot Playwright. |
| **OG-PR-4** — compound **`/ce-review`** | **`done` (waived 2026-04-21)** | No merge-candidate PR exists for the merged wave; operator accepts [§ OG-PR closure verification (2026-04-21)](#og-pr-closure-verification-2026-04-21) plus supplemental **`mode:report-only`** narrative on **`master`** (viz/nav/E2E/docs slice) as sufficient substitute for a retroactive PR-branch compound run. **Future PRs** that touch System 2 / agent-native paths should still run **`/ce-review`** on the PR head per § OG-PR-4 merge gate. |
| **AN1** — agent-native closure | **`done` (2026-04-23)** | Formal **waive** of OGAN-01 Playwright second-`GET` sub-proof + harness **`done`** + **`split_done_tasks_to_completed.py`**; canonical copy in [AGENT_NATIVE_AUDIT_OPENGRIMOIRE.md](../../../AGENT_NATIVE_AUDIT_OPENGRIMOIRE.md) § *AN1 harness closure* / *OGAN backlog — closure policy*. |

### OG-PR-4 operator waive (2026-04-21)

**Operator waiver:** The post-OGAN / System 2 agent-native hygiene work already lives on OpenGrimoire **`master`**; there is **no** open merge-candidate PR on which to run a good-faith compound **`/ce-review`** in the PR-shaped sense (base → head diff). Retroactively opening a PR would be process theater only. **Waived 2026-04-21:** **OG-PR-4** closes on **[§ OG-PR closure verification (2026-04-21)](#og-pr-closure-verification-2026-04-21)** (automatable hygiene) plus the recorded **`mode:report-only`** narrative on **`master`** (**no blocking findings**). Harness: MiscRepos **`pending_tasks.md`** row **OG-PR-4** → **`done`**, then **`split_done_tasks_to_completed.py`**. **Going forward:** any new OpenGrimoire PR that materially touches visualization, **`GET /api/capabilities`**, survey read surfaces, or observability admin paths should run compound **`/ce-review`** on that PR branch (optional **`plan: docs/plans/OA_FR_2_SYSTEM2_DATA_VISUALIZATION.md`**) before merge, per § OG-PR-4 merge gate above.
