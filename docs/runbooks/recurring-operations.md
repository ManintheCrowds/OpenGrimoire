# OpenGrimoire recurring operations

This runbook lists recurring operator workflows tied to the operator cockpit `Ops` panel.

## Recurring operations table

| Workflow | Schedule | Owner | Evidence |
|---|---|---|---|
| Survey read-gate production smoke | On pull request and push to main/master | OpenGrimoire maintainers | `.github/workflows/survey-visualization-prod-smoke.yml` |
| Admin moderation E2E smoke | On PR branch before merge (manual or CI) | OpenGrimoire maintainers | `e2e/admin-moderation.spec.ts` |
| Verify chain (lint/type/test/contracts) | Before merge and release | OpenGrimoire maintainers | `npm run verify` |

## Notes

- Keep this table aligned with the `Ops` panel response from `GET /api/admin/cockpit/ops`.
- Do not add synthetic automation rows. Only document workflows that exist in the repository.
