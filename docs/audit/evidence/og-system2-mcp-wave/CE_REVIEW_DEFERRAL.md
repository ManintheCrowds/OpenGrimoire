# ce-review — optional step (deferred)

**Wave:** MCP hardening + OpenGrimoire System 2 audit (2026-04-18)

Per plan phase 3, **ce-review** runs when a dedicated PR/branch closes **OG-GUI-AUDIT-*** scope. This hygiene wave did not open a new OG-GUI PR; GUI evidence is Playwright-substituted per `BROWSER_REVIEW_REPORT.md` in this folder.

**When a PR exists:** run compound **ce-review** with explicit `base:` or PR number per that skill’s rules (clean worktree for checkout modes), targeting the branch that implements OG-GUI-AUDIT / System 2 fixes.
