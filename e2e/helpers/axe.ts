import { AxeBuilder } from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';

/** Compact axe violation list for expect() messages. */
export function violationSummary(violations: { id: string; nodes: { html: string }[] }[]): string {
  return violations
    .map((v) => `${v.id}: ${v.nodes.map((n) => n.html).slice(0, 5).join(' | ')}`)
    .join('\n');
}

export type AxeAnalyzeOptions = {
  /** CSS selectors to exclude (e.g. WebGL canvas). */
  exclude?: string | string[];
};

/** Run axe and assert zero violations. */
export async function expectNoAxeViolations(page: Page, options: AxeAnalyzeOptions = {}): Promise<void> {
  let builder = new AxeBuilder({ page });
  const exclude = options.exclude;
  if (exclude) {
    const list = Array.isArray(exclude) ? exclude : [exclude];
    for (const sel of list) {
      builder = builder.exclude(sel);
    }
  }
  const { violations } = await builder.analyze();
  expect(violations, violationSummary(violations)).toHaveLength(0);
}
