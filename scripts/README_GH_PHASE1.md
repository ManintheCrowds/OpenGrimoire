# GitHub: Phase 1 agent-harness labels and issues

## Prerequisites

1. [GitHub CLI](https://cli.github.com/) (`gh`) on PATH.
2. One-time authentication: `gh auth login` (HTTPS, browser or token).
3. Run from repo root or anywhere; script detects `origin` as `owner/repo`.
4. Set the CLI default to the canonical GitHub name: `gh repo set-default ManintheCrowds/OpenGrimoire` (ensures `gh issue create` targets the renamed repo).

## Create labels and eight issues

```powershell
cd path\to\OpenGrimoire
.\scripts\gh-phase1-setup.ps1
```

- **Dry run** (print `gh` commands only): `.\scripts\gh-phase1-setup.ps1 -DryRun`
- **Other repo:** `.\scripts\gh-phase1-setup.ps1 -Repo "owner/other-repo"`

The script:

1. Creates labels: `agent-harness`, `P1`, `P2`, `P4`, `P12`, `ci`, `documentation` (ignores "already exists").
2. **Wave A:** P1.1, P2.1, P4.1, P12.1 using bodies under [gh-phase1-bodies/](gh-phase1-bodies/) (GitHub `blob/master` links).
3. **Wave B:** P1.2, P4.2, P12.2, P2.2 with `Depends on #N` filled from Wave A issue numbers.

Re-running creates **duplicate issues**; delete old issues first if you need a clean slate.

## Manual alternative

Copy-paste from [docs/research/AGENT_HARNESS_PHASE1_ISSUES.md](../docs/research/AGENT_HARNESS_PHASE1_ISSUES.md).
