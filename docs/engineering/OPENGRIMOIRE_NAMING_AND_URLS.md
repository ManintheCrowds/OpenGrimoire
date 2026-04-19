# OpenGrimoire naming, GitHub URLs, and local folder policy

**Status:** Active convention (2026-04). **Canonical GitHub repo:** [`ManintheCrowds/OpenGrimoire`](https://github.com/ManintheCrowds/OpenGrimoire) (default branch `master`). GitHub redirects from the old `OpenGrimoire` slug may still work; **do not** use `OpenGrimoire` in new links or docs.

## Naming

| Surface | Canonical | Legacy (allowed until cleaned up) |
|---------|-----------|-------------------------------------|
| Product / package | **OpenGrimoire** / `open-grimoire` | — |
| GitHub `owner/repo` | **`ManintheCrowds/OpenGrimoire`** | Redirect from `…/OpenGrimoire` |
| Local clone folder | **`OpenGrimoire`** | **`OpenGrimoire`** (rename when convenient) |
| Env vars | `OPENGRIMOIRE_*` (e.g. `OPENGRIMOIRE_BASE_URL`) | Older snippets sometimes duplicated the same `process.env.OPENGRIMOIRE_BASE_URL \|\|` twice — **removed** in 2026-04; use one canonical variable per [AGENT_INTEGRATION.md](../AGENT_INTEGRATION.md). |

## Tracking checklist (repo docs & automation)

- [x] Replace `github.com/.../OpenGrimoire/blob` with `.../OpenGrimoire/blob` in **scripts/gh-phase1-bodies/** and **gh-phase1-setup.ps1** defaults.
- [x] Bulk doc pass: prose **OpenGrimoire** → **OpenGrimoire** where it denoted the app/repo (env var names excluded).
- [x] README / CLAUDE / workspace layout: canonical folder **OpenGrimoire**.
- [ ] **Local:** Rename your disk folder from `OpenGrimoire` → `OpenGrimoire` when ready; update sibling path habits (`cd`, IDE multi-root).
- [ ] **GitHub Issues #1–#8:** Bodies created earlier may still show old blob URLs in the UI; GitHub redirects often fix clicks. Optional: edit issue bodies or add a single comment pointing here.
- [ ] **MiscRepos / OpenHarness:** Update cross-repo markdown that still says “OpenGrimoire” for this product (portfolio sweep — separate PRs).

## Changelog and releases

Project policy: **[CHANGELOG.md](../../CHANGELOG.md)** (human-readable delta) **and** [GitHub Releases](https://github.com/ManintheCrowds/OpenGrimoire/releases) for tagged versions. See [CONTRIBUTING.md](../../CONTRIBUTING.md) step 11.

## Arc_Forge and “merge into OpenGrimoire”?

**Recommendation: do not merge the Arc_Forge repository into OpenGrimoire as one codebase.**

| Factor | Arc_Forge | OpenGrimoire (this repo) |
|--------|-----------|---------------------------|
| Primary stack | Python (FastAPI, Flask workflow UI), Obsidian vault, campaign KB | Next.js, TypeScript, SQLite |
| Purpose | TTRPG campaign / RAG workbench | Context graph, Sync Session, alignment APIs |
| Size / coupling | Large assets, different release cadence | Web app + agent contract |

Merging would create a **monorepo** with unrelated lifecycles, duplicate “product” identity, and painful CI (Node + Python + game content). **Better patterns:**

- **Keep separate repos** with sibling-folder docs (current model) and links in [Arc_Forge `docs/WORKSPACE_MCP_REGISTRY.md`](../../../Arc_Forge/docs/WORKSPACE_MCP_REGISTRY.md).
- **Optional later:** a **meta** “portfolio” repo that only holds submodules or a workspace README — not a full merge.

Absolute GitHub links to this repo (`https://github.com/ManintheCrowds/OpenGrimoire/blob/master/...`) are **recommended** in Arc_Forge (and anywhere clones are not siblings) **in addition to** relative paths for local multi-root workspaces.

## Related

- [WORKSPACE_REPO_LAYOUT.md](../WORKSPACE_REPO_LAYOUT.md) — sibling layout decision.
- [DEPLOY_AND_VERIFY.md](./DEPLOY_AND_VERIFY.md) — build vs deploy certainty.
