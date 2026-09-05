import { test, expect } from '@common/fixtures/base.fixtures.js';
import { request } from '@playwright/test';
import path from 'node:path';
import { PactV4, MatchersV3 } from '@pact-foundation/pact';
import { config } from '@common/config/config.js';
import { HttpClient } from '@api/client/http-client.js';
import { PostsService } from '@api/services/posts.service.js';

/**
 * Consumer-driven contract test (Pact v4).
 *
 * This asserts the shape *our* client depends on, independent of any running
 * server, and writes a pact file to `reports/pacts/`. In a full setup that file
 * is published to a Pact Broker and verified against the real provider in the
 * provider's own pipeline — see ARCHITECTURE.md "Contract testing".
 *
 * Note it reuses the real `PostsService` + its zod schema: the contract and the
 * runtime validation stay in lock-step.
 */
const { like, integer, string } = MatchersV3;

const pact = new PactV4({
  consumer: 'playwright-framework',
  provider: 'posts-api',
  dir: path.resolve(config.rootDir, 'reports/pacts'),
});

test.describe('posts-api contract @api @contract', () => {
  test('GET /posts/:id returns the shape PostsService expects', async () => {
    await pact
      .addInteraction()
      .given('a post with id 1 exists')
      .uponReceiving('a request for post 1')
      .withRequest('GET', '/posts/1')
      .willRespondWith(200, (b) => {
        b.headers({ 'Content-Type': 'application/json' });
        b.jsonBody(
          like({
            id: integer(1),
            userId: integer(1),
            title: string('a title'),
            body: string('a body'),
          }),
        );
      })
      .executeTest(async (mockServer) => {
        const ctx = await request.newContext({ baseURL: mockServer.url });
        try {
          const posts = new PostsService(new HttpClient(ctx, { baseLabel: 'pact' }));
          const post = await posts.get(1); // throws if the response breaks the zod schema
          expect(post).toMatchObject({ id: 1, userId: 1 });
        } finally {
          await ctx.dispose();
        }
      });
  });
});
