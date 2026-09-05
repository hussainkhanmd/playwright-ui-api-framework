import { assertStatus, type HttpClient } from '../client/http-client.js';
import { assertSchema } from '../../common/utils/validate.js';
import {
  postSchema,
  postListSchema,
  type Post,
  type CreatePostInput,
} from '../schemas/post.schema.js';

/**
 * `posts` resource client. Every method validates the response against the zod
 * schema before returning, so callers get a typed value and schema drift fails
 * loudly at the call site.
 */
export class PostsService {
  constructor(private readonly http: HttpClient) {}

  async list(params?: { userId?: number }): Promise<Post[]> {
    const res = await this.http.get('/posts', { params });
    assertStatus(res, 200, 'GET /posts');
    return assertSchema(res.body, postListSchema, 'GET /posts');
  }

  async get(id: number): Promise<Post> {
    const res = await this.http.get(`/posts/${id}`);
    assertStatus(res, 200, `GET /posts/${id}`);
    return assertSchema(res.body, postSchema, `GET /posts/${id}`);
  }

  async create(input: CreatePostInput): Promise<Post> {
    const res = await this.http.post('/posts', { data: input });
    assertStatus(res, 201, 'POST /posts');
    return assertSchema(res.body, postSchema, 'POST /posts');
  }

  async update(id: number, patch: Partial<CreatePostInput>): Promise<Post> {
    const res = await this.http.patch(`/posts/${id}`, { data: patch });
    assertStatus(res, 200, `PATCH /posts/${id}`);
    return assertSchema(res.body, postSchema, `PATCH /posts/${id}`);
  }

  async remove(id: number): Promise<void> {
    const res = await this.http.delete(`/posts/${id}`);
    assertStatus(res, 200, `DELETE /posts/${id}`);
  }

  /** Raw response accessor for negative tests (e.g. expect 404). */
  getRaw(id: number) {
    return this.http.get(`/posts/${id}`);
  }
}
