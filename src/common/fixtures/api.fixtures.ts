import { request as playwrightRequest, type APIRequestContext } from '@playwright/test';
import { test as base } from './logger.fixtures.js';
import { config } from '../config/config.js';
import { rootLogger } from '../logger/logger.js';
import { startMockServer, type MockServerHandle } from '../../../mocks/json-server/server.js';
import { HttpClient } from '../../api/client/http-client.js';
import { PostsService } from '../../api/services/posts.service.js';
import { UsersService } from '../../api/services/users.service.js';
import { AuthService } from '../../api/services/auth.service.js';

/**
 * API dependency injection with **per-worker backend isolation**.
 *
 *   mockServer  (worker)  one json-server per worker on a unique port, fresh
 *                          in-memory copy of db.json — parallel write tests
 *                          never collide on ids or pollute each other.
 *   apiContext  (worker)  an APIRequestContext bound to that worker's backend.
 *   api         (test)    HttpClient + per-resource service clients + logger.
 *
 * If an external `API_BASE_URL` is configured (not the local mock port), no
 * mock is started and every worker talks to that shared server instead.
 */

export interface ApiClients {
  http: HttpClient;
  posts: PostsService;
  users: UsersService;
  auth: AuthService;
}

interface ApiWorkerFixtures {
  mockServer: MockServerHandle | undefined;
  apiContext: APIRequestContext;
  apiBaseURL: string;
}

export interface ApiFixtures {
  api: ApiClients;
}

const usesLocalMock = config.mock.autoStart && config.urls.api.includes(`:${config.mock.port}`);

export const test = base.extend<ApiFixtures, ApiWorkerFixtures>({
  mockServer: [
    async ({}, use, workerInfo) => {
      if (!usesLocalMock) {
        await use(undefined);
        return;
      }
      const port = config.mock.port + workerInfo.workerIndex;
      const handle = await startMockServer(port);
      rootLogger.child({ scope: 'api.fixtures' }).info({ port }, 'worker mock started');
      await use(handle);
      await handle.stop();
    },
    { scope: 'worker' },
  ],

  apiBaseURL: [
    async ({ mockServer }, use) => {
      await use(mockServer?.url ?? config.urls.api);
    },
    { scope: 'worker' },
  ],

  apiContext: [
    async ({ apiBaseURL }, use) => {
      const ctx = await playwrightRequest.newContext({
        baseURL: apiBaseURL,
        extraHTTPHeaders: { 'Content-Type': 'application/json' },
      });
      await use(ctx);
      await ctx.dispose();
    },
    { scope: 'worker' },
  ],

  api: async ({ apiContext, logger }, use) => {
    const http = new HttpClient(apiContext, { baseLabel: 'api' }, logger);
    await use({
      http,
      posts: new PostsService(http),
      users: new UsersService(http),
      auth: new AuthService(http),
    });
  },
});
