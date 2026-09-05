import { test, expect } from '@common/fixtures/base.fixtures.js';

/**
 * Fast health check for the API project — no browser, hits the mock backend
 * through the service layer.
 */
test.describe('mock backend health @smoke @api', () => {
  test('posts and users resources are reachable and schema-valid', async ({ api }) => {
    const posts = await api.posts.list();
    expect(posts.length).toBeGreaterThanOrEqual(3);

    const users = await api.users.list();
    expect(users.length).toBeGreaterThanOrEqual(2);
  });
});
