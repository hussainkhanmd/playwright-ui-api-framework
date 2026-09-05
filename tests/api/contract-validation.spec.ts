import { test, expect } from '@common/fixtures/base.fixtures.js';
import { z } from 'zod';
import { postSchema, postListSchema } from '@api/schemas/post.schema.js';
import { assertSchema, isValid } from '@common/utils/validate.js';

/**
 * Response-schema (contract) validation.
 *
 * The service layer already validates on every call; these tests exercise the
 * validation itself — happy path, drift detection, and negative HTTP cases.
 */
test.describe('response schema validation @api @smoke', () => {
  test('GET /posts satisfies the list schema', async ({ api }) => {
    const posts = await api.posts.list();
    expect(posts.length).toBeGreaterThanOrEqual(3);
    // `list()` returned only because assertSchema passed inside the service.
    expect(() => assertSchema(posts, postListSchema, 'posts')).not.toThrow();
  });

  test('a drifted response is rejected with a readable message', async ({ api }) => {
    const res = await api.http.get('/posts/1');
    const drifted = { ...(res.body as object), id: 'not-a-number', title: undefined };

    expect(isValid(drifted, postSchema)).toBe(false);
    expect(() => assertSchema(drifted, postSchema, 'GET /posts/1')).toThrow(
      /Schema validation failed for GET \/posts\/1[\s\S]*id/,
    );
  });

  test('GET /posts/:id for a missing row returns 404', async ({ api }) => {
    const res = await api.posts.getRaw(999_999);
    expect(res.status).toBe(404);
  });

  test('POST /posts with a malformed body still returns a 201 shape we can assert on', async ({
    api,
  }) => {
    // json-server is permissive; the point is that our schema is the gate.
    const res = await api.http.post('/posts', { data: { title: 42 } });
    expect(res.status).toBe(201);
    expect(isValid(res.body, postSchema.pick({ id: true }).partial())).toBe(true);
    expect(isValid(res.body, z.object({ title: z.string() }))).toBe(false);

    // don't leave a schema-invalid row behind for other specs on this worker
    await api.http.delete(`/posts/${(res.body as { id: number }).id}`);
  });
});
