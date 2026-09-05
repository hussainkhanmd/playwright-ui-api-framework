import { assertStatus, type HttpClient } from '../client/http-client.js';
import { assertSchema } from '../../common/utils/validate.js';
import { authTokenSchema, type AuthToken } from '../schemas/auth.schema.js';

/**
 * Authentication against the mock backend.
 *
 * The local json-server exposes an `auth` collection; we query it by
 * credentials and normalise the row to `{ token, username }`. M3 uses this to
 * log in once and hand a `storageState` to the UI projects.
 */
export class AuthService {
  constructor(private readonly http: HttpClient) {}

  async login(username: string, password: string): Promise<AuthToken> {
    const res = await this.http.get<Array<{ token?: string; username?: string }>>('/auth', {
      params: { username, password },
    });
    assertStatus(res, 200, 'GET /auth');

    const row = Array.isArray(res.body) ? res.body[0] : undefined;
    if (!row) {
      throw new Error(`Login failed: no auth row for username "${username}"`);
    }
    return assertSchema({ token: row.token, username: row.username }, authTokenSchema, 'login');
  }
}
