import { test, expect } from '@common/fixtures/base.fixtures.js';
import { isAiEnabled, assertAiEnabled } from '@ai/anthropic-client.js';
import { generateData } from '@ai/test-data-generator.js';
import { z } from 'zod';

/**
 * The AI layer must be provably inert when disabled — this is the guard that
 * keeps the experimental surface from affecting normal runs.
 *
 * Run with AI_FEATURES_ENABLED=true + ANTHROPIC_API_KEY to exercise the live
 * path (kept out of the default suite on purpose).
 */
test.describe('AI layer isolation @ai', () => {
  test('is disabled by default', () => {
    expect(isAiEnabled()).toBe(false);
  });

  test('throws a clear error instead of silently no-op-ing', () => {
    expect(() => assertAiEnabled()).toThrow(/AI features are disabled|ANTHROPIC_API_KEY/);
  });

  test('generateData refuses when disabled and points at the factories', async () => {
    await expect(
      generateData(z.object({ name: z.string() }), { description: 'people' }),
    ).rejects.toThrow(/data\/factories/);
  });
});
