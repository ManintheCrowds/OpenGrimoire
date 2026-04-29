# OpenGrimoire Known Issues

## Microsoft Edge Tools may report stale `aria-selected="{expression}"` diagnostics

**Status:** observed during the OG local-first cockpit work on 2026-04-29.

**Surface:** `src/components/AdminPanel/index.tsx`, `/admin` cockpit tablist.

**Symptom:** Microsoft Edge Tools may continue to report:

```text
ARIA attributes must conform to valid values: Invalid ARIA attribute value: aria-selected="{expression}"
```

This can persist even after `AdminPanel` no longer contains `aria-selected={...}` expressions.

**Evidence gathered:**

- `ReadLints` on `src/components/AdminPanel/index.tsx` reported no linter errors after the tab source was changed to literal `aria-selected="true"` / `aria-selected="false"` branches.
- `npm run type-check` passed.
- `npx playwright test e2e/admin-moderation.spec.ts` passed.
- Runtime DOM inspection on authenticated `/admin` showed all cockpit tabs rendered `aria-selected` as `"true"` or `"false"`, with no invalid values and exactly one selected tab.
- Source search found no `aria-selected={...}` expressions in `src/components/AdminPanel/index.tsx`.

**Likely cause:** stale Edge Tools diagnostics, stale browser/dev-server bundle, or source mapping against an older TSX model.

**Operator workaround:**

1. Restart the Next dev server.
2. Hard reload `/admin`.
3. Reload the IDE window or restart Edge Tools diagnostics.
4. Confirm the current tablist source/bundle is loaded before treating the diagnostic as actionable.

**Do not fix by:** adding defensive ARIA guards, changing runtime tab state, or weakening accessibility semantics without runtime evidence. The rendered DOM already satisfies the `aria-selected` value contract when the current bundle is loaded.
