/**
 * Playwright global setup.
 *
 *  1. Boot the local json-server mock (unless disabled or an external API_BASE_URL
 *     is pointed elsewhere).
 *  2. (M3) Log in once via the API and persist storageState for UI projects.
 *
 * Returning a function registers it as the matching global teardown, so the
 * mock server is always stopped even if the run is interrupted.
 */
import type { FullConfig } from '@playwright/test';
import { config } from '../src/common/config/config.js';
import { rootLogger } from '../src/common/logger/logger.js';
import { startMockServer, type MockServerHandle } from '../mocks/json-server/server.js';

const log = rootLogger.child({ scope: 'global-setup' });

async function globalSetup(_config: FullConfig): Promise<() => Promise<void>> {
  let mock: MockServerHandle | undefined;

  const wantsLocalMock = config.mock.autoStart && config.urls.api.includes(`:${config.mock.port}`);

  if (wantsLocalMock) {
    mock = await startMockServer(config.mock.port);
    log.info({ url: mock.url }, 'json-server mock started');
  } else {
    log.info({ api: config.urls.api }, 'using external API base URL; mock not started');
  }

  // M3 will add: authenticate via API here and write .auth/storageState.json

  return async () => {
    if (mock) {
      await mock.stop();
      log.info('json-server mock stopped');
    }
  };
}

export default globalSetup;
