import { AxeBuilder } from '@axe-core/playwright';
import type { Page, TestInfo } from '@playwright/test';
import type { Result } from 'axe-core';

/**
 * Accessibility scan helper.
 *
 * Runs axe-core against the current page, always attaches the full violation
 * list to the report, and returns violations **minus a documented allowlist**
 * of pre-existing issues. Teams ratchet accessibility debt down over time
 * rather than blocking CI on day one — the allowlist makes that explicit and
 * reviewable.
 */
export const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] as const;

export interface ScanOptions {
  /** axe rule ids that are known-broken and tracked elsewhere (e.g. a ticket). */
  allow?: string[];
  tags?: readonly string[];
  /** Restrict the scan to a CSS selector. */
  include?: string;
}

export async function scanA11y(
  page: Page,
  testInfo: TestInfo,
  options: ScanOptions = {},
): Promise<Result[]> {
  const { allow = [], tags = WCAG_TAGS, include } = options;

  let builder = new AxeBuilder({ page }).withTags([...tags]);
  if (include) builder = builder.include(include);

  const results = await builder.analyze();

  await testInfo.attach('axe-results', {
    body: JSON.stringify(results.violations, null, 2),
    contentType: 'application/json',
  });

  return results.violations.filter((v) => !allow.includes(v.id));
}

/** Compact, readable summary for assertion messages. */
export function summarise(violations: Result[]): string {
  if (violations.length === 0) return 'no violations';
  return violations
    .map((v) => `${v.id} (${v.impact ?? 'n/a'}, ${v.nodes.length} node[s]) — ${v.help}`)
    .join('\n');
}
