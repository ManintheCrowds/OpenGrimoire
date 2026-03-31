# API route index

- **[ROUTE_INDEX.json](./ROUTE_INDEX.json)** — One JSON entry per `src/app/api/**/route.ts` (API path + file path). Regenerated with `npm run generate:route-index`; verified by `npm run verify:route-index` (part of `npm run verify`).
- **Normative contract:** [ARCHITECTURE_REST_CONTRACT.md](../ARCHITECTURE_REST_CONTRACT.md) entity matrix.
- **Partial OpenAPI:** `GET /api/openapi` or `GET /api/openapi.json` (rewrite) — source: [`src/lib/openapi/openapi-document.ts`](../../src/lib/openapi/openapi-document.ts).
