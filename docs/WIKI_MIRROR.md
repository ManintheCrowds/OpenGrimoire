# LLM Wiki mirror in OpenGrimoire (`public/wiki`)

**Purpose:** Phase B **read-only** mirror of the vault folder `LLM-Wiki/` so operators can browse mirrored markdown inside OpenGrimoire at **`/wiki`**. **Canon = vault** — Obsidian (or your vault Git checkout) remains the authoring SSOT; this tree is disposable and one-way synced.

**Not in scope (yet):** search, in-browser edit, wikilink resolution to routes, menagerie / brain-map fusion.

---

## One-command sync (PowerShell)

From a **MiscRepos** clone (sibling of **OpenGrimoire** under the same parent folder), with your real paths:

```powershell
$env:OBSIDIAN_VAULT_ROOT = "D:/path/to/ObsidianVault"   # folder that contains LLM-Wiki/
$env:OPENGRIMOIRE_WIKI_SYNC_OUT = "D:/path/to/OpenGrimoire/public/wiki"
Set-Location D:\path\to\MiscRepos
.\local-proto\scripts\Run-LlmWikiScheduledPipeline.ps1 -SyncOpenGrimoireWiki -SkipStagingImport -SkipLint
```

**Requirements (script-enforced):**

- Vault must contain `LLM-Wiki/Sources/` (see `Run-LlmWikiScheduledPipeline.ps1`).
- `OPENGRIMOIRE_WIKI_SYNC_OUT` must point at `OpenGrimoire/public/wiki` (or another empty folder you then copy into `public/wiki`).

The script uses **robocopy** (`/E /XO`) from `LLM-Wiki/` to the destination — additive/update; it does not run compile (Entities/Topics/Synthesis) for you.

---

## Verify in the app

1. `cd OpenGrimoire && npm run dev` (default [http://localhost:3001](http://localhost:3001)).
2. Open **`/wiki`**. You should see either an index of `.md` files or the empty-state panel with the sync command.
3. Click a page link, or open `/wiki/Topics/YourTopic` (URL segments map to `public/wiki/Topics/YourTopic.md`).

Pages render as **HTML-escaped plaintext** inside `<pre>` (no markdown-to-HTML pipeline in this slice).

---

## Git hygiene

Mirrored files under `public/wiki/` are **gitignored** except **`public/wiki/.gitkeep`** so clones stay clean until you sync locally.

---

## See also

- [OPENGRIMOIRE_SYSTEMS_INVENTORY.md](./OPENGRIMOIRE_SYSTEMS_INVENTORY.md) § LLM Wiki vs OpenGrimoire  
- [MiscRepos `LLM_WIKI_SCHEDULED_PIPELINE.md`](../MiscRepos/local-proto/docs/LLM_WIKI_SCHEDULED_PIPELINE.md)  
- [OPENGRIMOIRE_BASE_FEATURES.md](./OPENGRIMOIRE_BASE_FEATURES.md) REQ-1–REQ-2  
