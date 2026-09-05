import { test, expect } from '@common/fixtures/base.fixtures.js';

/**
 * Chained / dependent workflow: create -> read -> update -> delete, each step
 * consuming the previous step's result. `serial` so a failure early stops the
 * rest (a deleted-before-created scenario is meaningless).
 */
test.describe.serial('posts CRUD workflow @api @regression', () => {
  let createdId: number;

  test('create', async ({ api, factory, logger }) => {
    const input = factory.post({ userId: 7, title: 'CRUD chain post' });
    const post = await api.posts.create(input);

    expect(post.id).toBeGreaterThan(0);
    expect(post).toMatchObject({ userId: 7, title: 'CRUD chain post', body: input.body });
    createdId = post.id;
    logger.info({ createdId }, 'created');
  });

  test('read the created post', async ({ api }) => {
    const post = await api.posts.get(createdId);
    expect(post.title).toBe('CRUD chain post');
  });

  test('update via PATCH', async ({ api }) => {
    const updated = await api.posts.update(createdId, { title: 'CRUD chain post (edited)' });
    expect(updated).toMatchObject({ id: createdId, title: 'CRUD chain post (edited)', userId: 7 });
  });

  test('delete, then confirm it is gone', async ({ api }) => {
    await api.posts.remove(createdId);
    const res = await api.posts.getRaw(createdId);
    expect(res.status).toBe(404);
  });
});
