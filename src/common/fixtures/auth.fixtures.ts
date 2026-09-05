import { request as playwrightRequest, type APIRequestContext } from '@playwright/test';
import { test as base } from './data.fixtures.js';
import { config } from '../config/config.js';
import { rootLogger } from '../logger/logger.js';
import { HttpClient } from '../../api/client/http-client.js';
import { AuthService } from '../../api/services/auth.service.js';

/**
 * API authentication reuse.
 *
 * `apiAuth` logs in **once per worker** via `AuthService` and hands every test
 * in that worker the same token — the API-side equivalent of the UI's
 * "log in once, reuse storage state" (see tests/auth.setup.ts).
 *
 * `authedRequest` is an `APIRequestContext` that carries `Authorization: Bearer
 * <token>` on every call, for tests that need to exercise protected endpoints.
 */
export interface ApiAuth {
  token: string;
  username: string;
}

interface AuthWorkerFixtures {
  apiAuth: ApiAuth;
  authedRequest: APIRequestContext;
}

export const test = base.extend<object, AuthWorkerFixtures>({
  apiAuth: [
    async ({ apiBaseURL }, use) => {
      const ctx = await playwrightRequest.newContext({ baseURL: apiBaseURL });
      const auth = new AuthService(new HttpClient(ctx, { baseLabel: 'auth' }, rootLogger));
      const { token, username } = await auth.login(
        config.credentials.username,
        config.credentials.password,
      );
      await ctx.dispose();
      rootLogger.child({ scope: 'auth.fixtures' }).info({ username }, 'worker authenticated');
      await use({ token, username });
    },
    { scope: 'worker' },
  ],

  authedRequest: [
    async ({ apiBaseURL, apiAuth }, use) => {
      const ctx = await playwrightRequest.newContext({
        baseURL: apiBaseURL,
        extraHTTPHeaders: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiAuth.token}`,
        },
      });
      await use(ctx);
      await ctx.dispose();
    },
    { scope: 'worker' },
  ],
});
