import { faker } from '@faker-js/faker';
import type { CreatePostInput } from '../../src/api/schemas/post.schema.js';

/**
 * Dynamic `posts` test data. Pure — returns a plain object, performs no I/O.
 * Pass `overrides` to pin the fields a given test actually asserts on.
 */
export function buildPost(overrides: Partial<CreatePostInput> = {}): CreatePostInput {
  return {
    userId: faker.number.int({ min: 1, max: 10 }),
    title: faker.lorem.sentence({ min: 3, max: 8 }),
    body: faker.lorem.paragraphs(2),
    ...overrides,
  };
}
