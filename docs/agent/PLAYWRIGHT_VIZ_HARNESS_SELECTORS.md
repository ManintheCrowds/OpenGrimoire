# Playwright harness selectors — survey visualization (`/visualization`, `/constellation`)

**Purpose:** Stable hooks for **external harnesses** and CI (Playwright) so agents do not scrape incidental class names. **Normative HTTP/query** semantics stay in [ARCHITECTURE_REST_CONTRACT.md](../ARCHITECTURE_REST_CONTRACT.md), [AGENT_INTEGRATION.md](../AGENT_INTEGRATION.md), and `GET /api/capabilities` → `ui_surfaces`.

**Automation:** Network drift guard: [`e2e/visualization-constellation-network-shape.spec.ts`](../../e2e/visualization-constellation-network-shape.spec.ts). A11y smoke (shell only, `canvas` excluded): [`e2e/visualization-constellation-a11y.spec.ts`](../../e2e/visualization-constellation-a11y.spec.ts).

---

## Stable element IDs (`vizLayoutIds.ts`)

Defined in [`src/components/DataVisualization/shared/vizLayoutIds.ts`](../../src/components/DataVisualization/shared/vizLayoutIds.ts):

| Export | DOM `id` | Used for |
|--------|-----------|----------|
| `OPENGRIMOIRE_VIZ_MAIN_PANEL_ID` | `opengrimoire-viz-main-panel` | Main `role="tabpanel"` for alluvial/chord |
| `OPENGRIMOIRE_VIZ_TAB_ALLUVIAL_ID` | `opengrimoire-viz-tab-alluvial` | Alluvial tab label target |
| `OPENGRIMOIRE_VIZ_TAB_CHORD_ID` | `opengrimoire-viz-tab-chord` | Chord tab label target |

Playwright: `page.locator('#opengrimoire-viz-main-panel')`, etc.

---

## `data-testid`

| Value | Route / component | Notes |
|-------|-------------------|--------|
| `alluvial-diagram` | `/visualization` | Wrapper around Alluvial SVG |
| `chord-diagram` | `/visualization` | Wrapper around Chord |
| `opengrimoire-viz-mock-data-banner` | `/visualization` | Mock cohort banner ([`MockSurveyDataBanner`](../../src/components/DataVisualization/shared/MockSurveyDataBanner.tsx)) |
| `nav-link-visualization` | Global nav | Used in [`e2e/smoke.spec.ts`](../../e2e/smoke.spec.ts) |

---

## `data-region` (A2UI-style hints)

From [`EnhancedVisualizationHeader`](../../src/components/DataVisualization/shared/EnhancedVisualizationHeader.tsx) and main viz shell:

| Region | Meaning |
|--------|---------|
| `opengrimoire-viz-header` | Header strip |
| `opengrimoire-viz-wordmark` | Title / branding |
| `opengrimoire-viz-quote-slot` | Rotating approved quotes |
| `opengrimoire-viz-controls` | Tabs + auto-play |
| `opengrimoire-viz-canvas` | Diagram panel ([`DataVisualization/index.tsx`](../../src/components/DataVisualization/index.tsx)) |
| `opengrimoire-viz-mock-data-banner` | Same as test id (banner root) |

Optional **`data-usage-hint`** on the header root documents operator intent for agents (string set in `DataVisualization`).

---

## `/constellation` (Three / Zustand)

- **Heading:** `getByRole('heading', { name: 'Constellation View' })` ([`constellation/page.tsx`](../../src/app/constellation/page.tsx)).
- **Loading copy:** `getByText('Loading visualization...')` (dynamic import fallback).
- **GL surface:** `canvas` (no `data-testid` on the WebGL layer today — exclude from axe; see OGAN-15 spec).

---

## Survey `GET` shape (assert in network specs)

| Route | Expected query (SSOT [`surveyVisualizationFetch.ts`](../../src/lib/visualization/surveyVisualizationFetch.ts)) |
|-------|------------------------------------------------------------------------------------------------------------------|
| `/visualization` | `all=1` (no `showTestData`) |
| `/constellation` | `all=0` + `showTestData=true|false` from [`visualizationStore`](../../src/store/visualizationStore.ts) (defaults **true**; drift-tested vs `/visualization` in [`e2e/visualization-constellation-network-shape.spec.ts`](../../e2e/visualization-constellation-network-shape.spec.ts)) |

---

## Maintenance

When adding operator-facing viz surfaces, add **`data-region`** / **`data-testid`** in the same PR and extend this list (OGAN-17 policy).
