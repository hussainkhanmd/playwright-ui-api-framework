import { test, expect } from '@common/fixtures/base.fixtures.js';

/**
 * API project sanity check (M1). Confirms the `api` project runs with no
 * browser and can reach the mock backend. Service layer + schema validation
 * land in M2.
 */
test.describe('mock backend health @smoke @api', () => {
  test('GET /posts returns the seeded rows', async ({ request }) => {
    const res = await request.get('/posts');
    expect(res.ok()).toBeTruthy();
    const body = (await res.json()) as unknown[];
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThanOrEqual(3);
  });
});
