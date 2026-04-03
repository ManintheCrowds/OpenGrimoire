# Maestro flows (OpenGrimoire web)

Optional YAML-based E2E using [Maestro](https://github.com/mobile-dev-inc/Maestro). **Primary** regression coverage remains [Playwright](../) (`npm run test:e2e`); Maestro is a small, human-readable smoke for agent-native / cross-surface parity experiments.

## Prerequisites

- **Java 17+** — `java -version`
- **Maestro CLI** — [install](https://docs.maestro.dev/maestro-cli):  
  `curl -fsSL "https://get.maestro.mobile.dev" | bash`  
  On Windows, use WSL or follow [Maestro CLI](https://docs.maestro.dev/maestro-cli) for native install paths.
- **OpenGrimoire dev server** on `http://localhost:3001` (same as Playwright `baseURL` in `playwright.config.ts`).

## Run

```bash
cd OpenGrimoire
npm run dev -- -p 3001
# other terminal:
npm run test:maestro
```

Or: `maestro test e2e/maestro/smoke_web.yaml`

## Web flows

Maestro web uses a **`url`** header instead of `appId` ([Web Browsers](https://docs.maestro.dev/get-started/supported-platform/web-browser)). Chromium is managed by Maestro (beta).

## Policy

| Stack | Role |
|--------|------|
| **Playwright** | Main CI E2E (`e2e/*.spec.ts`), full routes and assertions |
| **Maestro** | Minimal smoke YAML (`smoke_web.yaml`); extend only if you want shared mobile+web syntax later |

Avoid duplicating every Playwright test in Maestro unless you standardize on one framework.
