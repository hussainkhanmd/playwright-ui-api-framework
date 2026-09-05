/**
 * Playwright global setup.
 *
 * The mock backend is started per-worker by src/common/fixtures/api.fixtures.ts
 * (each worker gets its own isolated json-server), so nothing to boot here yet.
 *
 * M3 will add: authenticate once via the API and persist storageState for the
 * UI projects to reuse.
 */
import type { FullConfig } from '@playwright/test';
import { config } from '../src/common/config/config.js';
import { rootLogger } from '../src/common/logger/logger.js';

const log = rootLogger.child({ scope: 'global-setup' });

async function globalSetup(_config: FullConfig): Promise<void> {
  log.info(
    { testEnv: config.testEnv, ui: config.urls.ui, api: config.urls.api },
    'global setup complete',
  );
}

export default globalSetup;
