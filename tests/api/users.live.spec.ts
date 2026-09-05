import { test, expect } from '@common/fixtures/base.fixtures.js';
import { request as playwrightRequest } from '@playwright/test';
import { HttpClient } from '@api/client/http-client.js';
import { UsersService } from '@api/services/users.service.js';

/**
 * Live HTTP against a real public API (JSONPlaceholder) — proves the same
 * service + schema layer works unchanged against a real server, not just the
 * local mock. Tagged @regression so smoke runs stay fully offline.
 *
 * A dedicated request context is created here because the `api` project's
 * baseURL points at the local mock.
 */
const LIVE_BASE = 'https://jsonplaceholder.typicode.com';

test.describe('JSONPlaceholder live @api @regression', () => {
  test('GET /users returns schema-valid rows', async ({ logger }) => {
    const ctx = await playwrightRequest.newContext({ baseURL: LIVE_BASE });
    try {
      const users = new UsersService(new HttpClient(ctx, { baseLabel: 'jsonplaceholder' }, logger));
      const all = await users.list();
      expect(all).toHaveLength(10);
      expect(all[0]?.email).toContain('@');
    } finally {
      await ctx.dispose();
    }
  });

  test('GET /posts/1 round-trips through the schema', async ({ logger }) => {
    const ctx = await playwrightRequest.newContext({ baseURL: LIVE_BASE });
    try {
      const http = new HttpClient(ctx, { baseLabel: 'jsonplaceholder' }, logger);
      const res = await http.get('/posts/1');
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ id: 1, userId: expect.any(Number) });
    } finally {
      await ctx.dispose();
    }
  });
});
