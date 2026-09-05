import { test, expect } from '@common/fixtures/base.fixtures.js';

/**
 * API authentication: login through the service layer, per-worker token reuse,
 * and an authenticated request context.
 */
test.describe('API auth @api @regression', () => {
  test('valid credentials return a token', async ({ api }) => {
    const auth = await api.auth.login('standard_user', 'secret_sauce');
    expect(auth.token).toMatch(/mock-static-token/);
    expect(auth.username).toBe('standard_user');
  });

  test('unknown credentials fail', async ({ api }) => {
    await expect(api.auth.login('nobody', 'nope')).rejects.toThrow(/Login failed/);
  });

  test('the worker token is reused, not re-fetched per test', async ({ apiAuth }) => {
    expect(apiAuth.token).toMatch(/mock-static-token/);
    expect(apiAuth.username).toBe('standard_user');
  });

  test('authedRequest carries the bearer token', async ({ authedRequest }) => {
    const res = await authedRequest.get('/posts/1');
    expect(res.ok()).toBeTruthy();
  });
});
