/**
 * Playwright global teardown.
 *
 * The mock server is stopped by the function returned from global-setup (that
 * pattern guarantees cleanup even on interrupt). This hook is reserved for
 * cross-run housekeeping that needs no handle from setup — e.g. pruning stale
 * auth state so a future run cannot silently reuse an expired session.
 */
import { rm } from 'node:fs/promises';
import path from 'node:path';
import type { FullConfig } from '@playwright/test';
import { config } from '../src/common/config/config.js';
import { rootLogger } from '../src/common/logger/logger.js';

const log = rootLogger.child({ scope: 'global-teardown' });

async function globalTeardown(_config: FullConfig): Promise<void> {
  if (process.env.KEEP_AUTH_STATE === 'true') return;
  const authFile = path.join(config.rootDir, '.auth', 'storageState.json');
  await rm(authFile, { force: true });
  log.debug({ authFile }, 'removed persisted auth state');
}

export default globalTeardown;
