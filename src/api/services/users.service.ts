import { assertStatus, type HttpClient } from '../client/http-client.js';
import { assertSchema } from '../../common/utils/validate.js';
import {
  userSchema,
  userListSchema,
  type User,
  type CreateUserInput,
} from '../schemas/user.schema.js';

/** `users` resource client. */
export class UsersService {
  constructor(private readonly http: HttpClient) {}

  async list(): Promise<User[]> {
    const res = await this.http.get('/users');
    assertStatus(res, 200, 'GET /users');
    return assertSchema(res.body, userListSchema, 'GET /users');
  }

  async get(id: number): Promise<User> {
    const res = await this.http.get(`/users/${id}`);
    assertStatus(res, 200, `GET /users/${id}`);
    return assertSchema(res.body, userSchema, `GET /users/${id}`);
  }

  async create(input: CreateUserInput): Promise<User> {
    const res = await this.http.post('/users', { data: input });
    assertStatus(res, 201, 'POST /users');
    return assertSchema(res.body, userSchema, 'POST /users');
  }

  async remove(id: number): Promise<void> {
    const res = await this.http.delete(`/users/${id}`);
    assertStatus(res, 200, `DELETE /users/${id}`);
  }

  getRaw(id: number) {
    return this.http.get(`/users/${id}`);
  }
}
