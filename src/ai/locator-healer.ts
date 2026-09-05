import type { Page, TestInfo } from '@playwright/test';
import { completeText, unfence, isAiEnabled } from './anthropic-client.js';
import { rootLogger } from '../common/logger/logger.js';

/**
 * EXPERIMENTAL — when a locator stops matching, ask Claude for alternatives
 * based on a DOM snapshot.
 *
 * SUGGEST-ONLY. This never rewrites a locator at runtime and is never called
 * automatically in CI — a self-healing selector that silently changes what a
 * test checks is worse than a red test. The output is logged and attached to
 * the report for a human to act on.
 */
const log = rootLogger.child({ scope: 'ai.locator-healer' });

export interface LocatorSuggestion {
  selector: string;
  strategy: string;
  confidence: 'high' | 'medium' | 'low';
  reason: string;
}

export async function suggestLocators(
  page: Page,
  brokenSelector: string,
  intent: string,
): Promise<LocatorSuggestion[]> {
  if (!isAiEnabled()) {
    log.debug('AI disabled — no locator suggestions');
    return [];
  }

  const html = (await page.locator('body').innerHTML()).slice(0, 8000);

  const prompt = [
    `A Playwright locator no longer matches: \`${brokenSelector}\``,
    `It was meant to select: ${intent}`,
    '',
    'Here is the current page body (truncated):',
    '```html',
    html,
    '```',
    '',
    'Suggest up to 3 replacement locators, preferring getByRole > getByLabel > getByTestId > text > CSS.',
    'Respond with ONLY a JSON array of objects: {selector, strategy, confidence, reason}.',
  ].join('\n');

  try {
    const raw = unfence(await completeText(prompt, { maxTokens: 1024 }));
    const suggestions = JSON.parse(raw) as LocatorSuggestion[];
    log.warn({ brokenSelector, suggestions }, 'locator healing suggestions (NOT applied)');
    return suggestions;
  } catch (err) {
    log.warn({ err: String(err) }, 'locator healing failed');
    return [];
  }
}

/** Run a suggestion pass and attach the result to the report. Returns nothing actionable by design. */
export async function attachLocatorSuggestions(
  page: Page,
  testInfo: TestInfo,
  brokenSelector: string,
  intent: string,
): Promise<void> {
  const suggestions = await suggestLocators(page, brokenSelector, intent);
  if (suggestions.length === 0) return;
  await testInfo.attach('locator-suggestions', {
    body: JSON.stringify({ brokenSelector, intent, suggestions }, null, 2),
    contentType: 'application/json',
  });
}
