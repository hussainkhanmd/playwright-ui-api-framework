import { test as base } from './api.fixtures.js';
import { buildPost } from '../../../data/factories/post.factory.js';
import { buildUser } from '../../../data/factories/user.factory.js';
import type { Post, CreatePostInput } from '../../api/schemas/post.schema.js';
import type { User, CreateUserInput } from '../../api/schemas/user.schema.js';

/**
 * Test-data dependency injection.
 *
 * `factory` — pure faker builders (no I/O).
 * `seed`    — creates rows via the API and **deletes them in teardown**, in
 *             reverse order. Tests never leave state behind, and never depend on
 *             data a previous test created.
 */
export interface DataFixtures {
  factory: {
    post: typeof buildPost;
    user: typeof buildUser;
  };
  seed: {
    post(overrides?: Partial<CreatePostInput>): Promise<Post>;
    user(overrides?: Partial<CreateUserInput>): Promise<User>;
  };
}

export const test = base.extend<DataFixtures>({
  factory: async ({}, use) => {
    await use({ post: buildPost, user: buildUser });
  },

  seed: async ({ api, logger }, use) => {
    const cleanup: Array<() => Promise<void>> = [];

    const seed: DataFixtures['seed'] = {
      async post(overrides) {
        const created = await api.posts.create(buildPost(overrides));
        cleanup.push(() => api.posts.remove(created.id));
        logger.info({ id: created.id }, 'seeded post');
        return created;
      },
      async user(overrides) {
        const created = await api.users.create(buildUser(overrides));
        cleanup.push(() => api.users.remove(created.id));
        logger.info({ id: created.id }, 'seeded user');
        return created;
      },
    };

    await use(seed);

    for (const undo of cleanup.reverse()) {
      try {
        await undo();
      } catch (err) {
        logger.warn({ err: String(err) }, 'seed teardown failed (continuing)');
      }
    }
  },
});
