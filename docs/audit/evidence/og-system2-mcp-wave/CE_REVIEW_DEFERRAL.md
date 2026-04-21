# ce-review — optional step (deferred)

**Wave:** MCP hardening + OpenGrimoire System 2 audit (2026-04-18)

Per plan phase 3, **ce-review** runs when a dedicated PR/branch closes **OG-GUI-AUDIT-*** scope. This hygiene wave did not open a new OG-GUI PR; GUI evidence is Playwright-substituted per `BROWSER_REVIEW_REPORT.md` in this folder.

**When a PR exists:** run compound **ce-review** with explicit `base:` or PR number per that skill’s rules (clean worktree for checkout modes), targeting the branch that implements OG-GUI-AUDIT / System 2 fixes.

### OG-PR-4 — merge gate (compound `/ce-review`)

Before merging OpenGrimoire PRs that touch System 2 / agent-native posture:

1. Run **compound `/ce-review`** on the PR branch (or equivalent structured review), for example **`mode: report-only`** with **`base: origin/master`** so the diff is scoped to what the PR introduces.
2. Optionally steer the review with **`plan: docs/plans/OA_FR_2_SYSTEM2_DATA_VISUALIZATION.md`** when the change is visualization- or capabilities-related.
3. Record outcomes against [AGENT_NATIVE_AUDIT_OPENGRIMOIRE.md](../../../AGENT_NATIVE_AUDIT_OPENGRIMOIRE.md): **AN1** (and related items) stay **open** until policy sign-off documents a formal **waive** or **`split_done`** — do not treat green CI alone as closure of agent-native audit rows.
