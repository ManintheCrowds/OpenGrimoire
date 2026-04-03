# OpenGrimoire Troubleshooting

Symptom / Cause / Fix format. See [.cursor/docs/TROUBLESHOOTING_AND_PLAYBOOKS.md](../.cursor/docs/TROUBLESHOOTING_AND_PLAYBOOKS.md) for the index.

## Cannot find module './XXX.js'

**Symptom:** Server error `Error: Cannot find module './638.js'` (or similar chunk ID) when loading a page. Next.js dev overlay shows the error.

**Cause:** Stale or corrupted `.next` build cache. Webpack chunk IDs can mismatch after interrupted builds, hot reload races, or switching between `next build` and `next dev`.

**Fix:**

1. Stop the dev server (Ctrl+C).
2. Run `npm run clean` (removes `.next` and `node_modules/.cache`).
3. Run `npm run dev` again.

Or use `npm run dev:clean` to clean and start in one step.

## EADDRINUSE: address already in use :::3001

**Symptom:** `Error: listen EADDRINUSE: address already in use :::3001` when starting `npm run dev`.

**Cause:** A previous dev server process is still running on port 3001.

**Fix:**

1. Kill the process using port 3001. On Windows PowerShell:
   ```powershell
   $p = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -First 1
   if ($p) { Stop-Process -Id $p -Force }
   ```
2. Run `npm run dev` again.

## PowerShell: The token '&&' is not a valid statement separator

**Symptom:** `cd D:\portfolio-harness\OpenGrimoire && npm run dev` fails with parser error.

**Cause:** PowerShell does not support `&&` for chaining commands (unlike Bash).

**Fix:** Use `;` instead of `&&`, or run commands separately:

```powershell
Set-Location D:\portfolio-harness\OpenGrimoire; npm run dev
```

Or:

```powershell
cd D:\portfolio-harness\OpenGrimoire
npm run dev
```
