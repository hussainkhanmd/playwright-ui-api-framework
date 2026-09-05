/**
 * Playwright global teardown.
 *
 * The `setup` project regenerates the auth storage state on every run, and
 * per-worker mock servers stop with their worker fixtures, so there is nothing
 * to tear down globally today. Kept as a wired hook for future cross-run
 * housekeeping (e.g. publishing run metadata).
 */
import type { FullConfig } from '@playwright/test';
import { rootLogger } from '../src/common/logger/logger.js';

async function globalTeardown(_config: FullConfig): Promise<void> {
  rootLogger.child({ scope: 'global-teardown' }).debug('global teardown complete');
}

export default globalTeardown;
