/**
 * EXPERIMENTAL — scaffold a draft spec from a user story / Gherkin snippet.
 *
 *   npm run ai:scaffold -- --story data/static/sample-story.md
 *   npm run ai:scaffold -- --story path/to/story.md --out tests/ui/my-feature.draft.spec.ts
 *
 * Output is a STARTING POINT for a human to finish, never committed automatically.
 * It is written with a `.draft.spec.ts` suffix and a TODO banner.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { config } from '../common/config/config.js';
import { completeText, unfence, assertAiEnabled } from './anthropic-client.js';

const FRAMEWORK_CONVENTIONS = `
You are scaffolding a Playwright + TypeScript test for this framework. Conventions:
- import { test, expect } from '@common/fixtures/base.fixtures.js'  (NEVER from '@playwright/test')
- UI fixtures available: loginPage, inventoryPage, cartPage, checkoutPage, theInternet.{frames,shadowDom,fileTransfer,windows}
- API fixtures available: api.{posts,users,auth,http}, seed.{post,user}, factory.{post,user}, apiAuth
- Tag the describe/test title: @smoke|@regression + @ui|@api|@e2e
- Web-first assertions only (expect(locator).toHaveText(...)). No page.waitForTimeout.
- Prefer page objects over raw selectors.
Return ONLY the TypeScript file contents. No commentary, no code fence.
`.trim();

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40);
}

async function main(): Promise<void> {
  assertAiEnabled();

  const storyPath = arg('story');
  if (!storyPath) throw new Error('Usage: npm run ai:scaffold -- --story <path> [--out <path>]');

  const story = readFileSync(path.resolve(config.rootDir, storyPath), 'utf8').trim();
  const title = story.split('\n')[0]?.replace(/^#*\s*/, '') ?? 'feature';
  const outPath = path.resolve(
    config.rootDir,
    arg('out') ?? `tests/ui/${slugify(title)}.draft.spec.ts`,
  );

  if (existsSync(outPath) && arg('force') === undefined) {
    throw new Error(`${outPath} exists. Pass --force to overwrite.`);
  }

  const body = unfence(
    await completeText(`User story / scenario:\n\n${story}`, {
      system: FRAMEWORK_CONVENTIONS,
      maxTokens: 2048,
    }),
  );

  const banner =
    `// ⚠️  AI-SCAFFOLDED DRAFT — review, run, and fix before committing.\n` +
    `// Generated from: ${storyPath}\n\n`;
  writeFileSync(outPath, banner + body + '\n');

  console.log(`Draft written to ${path.relative(config.rootDir, outPath)}`);
  console.log('Next: read it, run it, replace guessed selectors with page objects.');
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
