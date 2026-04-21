# Survey POST bootstrap token — threat model

**Scope:** Optional **`SURVEY_POST_REQUIRE_TOKEN=true`** path: **`GET /api/survey/bootstrap-token`** mints a short-lived JWT; clients send **`x-survey-post-token`** on **`POST /api/survey`**. Implementation: [`survey-post-bootstrap.ts`](../../src/lib/survey/survey-post-bootstrap.ts), route [`bootstrap-token/route.ts`](../../src/app/api/survey/bootstrap-token/route.ts), verification in [`survey/route.ts`](../../src/app/api/survey/route.ts).

**Audit source:** [SECURITY_SENTINEL_OPENGRIMOIRE_GUI_2026-04-18.md](../audit/SECURITY_SENTINEL_OPENGRIMOIRE_GUI_2026-04-18.md) finding #8 — bootstrap token is **thin abuse control** vs a scripted same-origin client.

## What the control provides

| Property | Behavior |
|----------|----------|
| Token shape | HS256 JWT, claim **`purpose: survey_post`**, expiry **15 minutes** (`signSurveyPostBootstrapToken`). |
| Mint route | **`GET /api/survey/bootstrap-token`** — returns `{ token: null }` when the gate is off; otherwise `{ token, expiresIn: 900 }` or **503** if secret unset. **No** operator session required (public GET by design when enabled). |
| POST gate | Missing/invalid header → **401** with detail pointing at bootstrap GET ([SYNC_SESSION_HANDOFF §7](../agent/SYNC_SESSION_HANDOFF.md)). |

Together, this blocks **naive** drive-by `POST /api/survey` replays that do not first obtain a fresh token. It does **not** prove a human operator: any client that can complete the same steps as the Sync Session UI can submit.

## Same-origin scripted client (in scope)

**Intended consumers:** The in-app Sync Session flow uses `fetch('/api/survey/bootstrap-token')` then POST with header ([`useSyncSessionForm.ts`](../../src/lib/hooks/useSyncSessionForm.ts)). **Harnesses** on a trusted machine may do the same ([`scripts/examples/post-sync-session.mjs`](../../scripts/examples/post-sync-session.mjs)).

**Threat:** Malware, a compromised browser extension, or **automation driving a real browser profile** on the same origin can mint tokens and POST at full human rate — same as any SPA secret held in JS memory. **Mitigations outside this token:** middleware rate limits ([`middleware.ts`](../../middleware.ts)), optional **Turnstile** on POST ([OPERATIONAL_TRADEOFFS](../engineering/OPERATIONAL_TRADEOFFS.md)), monitoring, **`SURVEY_POST_BOOTSTRAP_SECRET`** rotation.

## Cross-site attacker (browser)

**Typical case:** Attacker-controlled **evil.com** page cannot read JSON from **`https://your-og.example/api/survey/bootstrap-token`** in JavaScript unless your app sends permissive **CORS** headers allowing that origin (Next.js defaults do **not** expose this GET cross-origin to arbitrary sites).

**Residual:** Attacker with **server-side** HTTP can still `GET` bootstrap and `POST` survey if the host is reachable from their infrastructure — equivalent to “anyone can call public POST” with one extra hop. The token mainly **segments** unauthenticated POST spam that omits the header; it does **not** authenticate humans.

## Product posture

- **Default off:** `SURVEY_POST_REQUIRE_TOKEN` unset → no bootstrap path; POST remains public with other controls only.
- **Public internet with sensitive intake:** Combine token gate with **Turnstile** and/or **edge/WAF** per [OPERATIONAL_TRADEOFFS](../engineering/OPERATIONAL_TRADEOFFS.md) § Survey POST abuse.

## Optional hardening backlog (not shipped)

Use only if product tightens **`SURVEY_POST_REQUIRE_TOKEN`** beyond “thin gate”:

1. **Rate-limit** `GET /api/survey/bootstrap-token` per client IP (extend middleware matcher + shared limiter pattern).
2. **Bind** JWT to a server-issued nonce stored in **HttpOnly cookie** or one-time server session so headless replay needs both cookie and JWT.
3. **Issue token only after** Turnstile (or similar) verify on a dedicated **POST** mint step — moves abuse cost upstream.
4. **Shorten TTL** below 15m for high-risk deployments (requires UX + hook timing review).
5. **Telemetry:** structured log line on mint + POST correlation id (avoid logging raw token).

## Related

- [SYNC_SESSION_HANDOFF.md](../agent/SYNC_SESSION_HANDOFF.md) §7 — HTTP errors and abuse table.
- [AGENT_INTEGRATION.md](../AGENT_INTEGRATION.md) — operator/agent quick reference.
- [DEPLOYMENT.md](../../DEPLOYMENT.md) — production checklist and E2E vs real secrets.
