# Private research layout (consulting / strategy)

**Purpose:** Sensitive consulting notes, client-adjacent templates, and long-form strategy research **do not** belong in the public OpenGrimoire tree. They live under **`docs/private/`**, which is **gitignored** and stays on trusted machines only.

## Where files go

| Path (repo root relative) | Use |
|---------------------------|-----|
| `docs/private/research/` | Bittensor evaluation, subnet atlas, consulting package templates, janitorial/SEO scope notes, and similar artifacts |

**This file** (`PRIVATE_RESEARCH_LAYOUT.md`) is **public** and safe to commit: it only describes layout, not content.

## Expected filenames (optional convention)

If you use the layout from the internal consulting prep, typical names include:

- `BITTENSOR_EVALUATION.md`
- `SUBNET_STRATEGIC_ATLAS.md`
- `CONSULTING_PACKAGES_TEMPLATE.md`
- `JANITORIAL_LOCAL_BUSINESS_AGENT_SCOPE.md`

Rename or split as you prefer; keep the directory gitignored.

## Ops

- **Backup:** Sync `docs/private/` via your own encrypted vault, second private repo, or machine backup—**not** a public remote path.
- **Clones:** Fresh public clones will **not** contain `docs/private/`; recreate from your vault when needed.
- **Verify:** `git status` should **never** list files under `docs/private/` once `.gitignore` is applied.

## Agents

See [AGENTS.md](../../AGENTS.md) for how assistants should treat optional local-only research vs shipped product docs.
