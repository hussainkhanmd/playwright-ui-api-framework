import { test, expect } from '@common/fixtures/base.fixtures.js';

/**
 * API-based seeding with automatic teardown. The `seed` fixture creates rows
 * via the API and deletes them after the test — nothing is left behind, and no
 * test depends on another test's data.
 */
test.describe('API-seeded data @api @regression', () => {
  test('seeded rows exist during the test', async ({ seed, api }) => {
    const post = await seed.post({ title: 'seeded-and-readable' });
    const fetched = await api.posts.get(post.id);
    expect(fetched.title).toBe('seeded-and-readable');
  });

  test('multiple seeded rows are independent', async ({ seed, api }) => {
    const a = await seed.post({ userId: 1 });
    const b = await seed.post({ userId: 2 });
    expect(a.id).not.toBe(b.id);

    const forUser1 = await api.posts.list({ userId: 1 });
    expect(forUser1.some((p) => p.id === a.id)).toBe(true);
  });
});

/**
 * Teardown proof: test 1 seeds a row and remembers its id; the `seed` fixture
 * tears down when test 1 ends; test 2 confirms the row is gone.
 */
test.describe.serial('seed teardown @api @regression', () => {
  let seededId: number;

  test('seed a row', async ({ seed, api }) => {
    const post = await seed.post();
    seededId = post.id;
    expect((await api.posts.getRaw(seededId)).status).toBe(200);
  });

  test('the seeded row was deleted in teardown', async ({ api }) => {
    expect((await api.posts.getRaw(seededId)).status).toBe(404);
  });
});
