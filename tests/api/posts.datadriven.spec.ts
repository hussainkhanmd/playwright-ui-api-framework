import { test, expect } from '@common/fixtures/base.fixtures.js';
import { loadJsonCases } from '@common/utils/data-files.js';
import type { CreatePostInput } from '@api/schemas/post.schema.js';

interface PostCase {
  name: string;
  input: CreatePostInput;
  expectStatus: number;
}

/**
 * Data-driven testing: one `test()` per row of an external JSON file. Swap the
 * file (or point at a CSV via `loadCsvCases`) to extend coverage without
 * touching the spec.
 */
const cases = loadJsonCases<PostCase>('data/datadriven/post-cases.json');

test.describe('POST /posts data-driven @api @regression', () => {
  for (const testCase of cases) {
    test(`creates: ${testCase.name}`, async ({ api }) => {
      const res = await api.http.post('/posts', { data: testCase.input });
      expect(res.status).toBe(testCase.expectStatus);
      expect(res.body).toMatchObject({ title: testCase.input.title });

      // clean up the row this case created
      const created = res.body as { id: number };
      await api.http.delete(`/posts/${created.id}`);
    });
  }
});
