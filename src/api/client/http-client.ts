import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { Logger } from 'pino';
import { rootLogger } from '../../common/logger/logger.js';

/**
 * Thin wrapper over Playwright's `APIRequestContext`.
 *
 * Why not Axios / supertest / a REST-assured-style lib?
 *   - shares Playwright config, proxy and TLS settings
 *   - API calls appear in the same trace as UI steps
 *   - one auth story for API + UI
 *   - zero extra runtime dependency
 *
 * Structure a dedicated library would give us (a service layer, schema
 * validation) is provided by src/api/services/* and src/api/schemas/*.
 */

export interface HttpResponse<T = unknown> {
  status: number;
  ok: boolean;
  headers: Record<string, string>;
  body: T;
  raw: APIResponse;
}

export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  /** JSON body. Mutually exclusive with `form` / `multipart`. */
  data?: unknown;
  form?: Record<string, string | number | boolean>;
  timeout?: number;
  /** Do not throw on 4xx/5xx (default: never throws — callers assert status). */
  failOnStatusCode?: boolean;
}

type Method = 'get' | 'post' | 'put' | 'patch' | 'delete';

export class HttpClient {
  private readonly log: Logger;

  constructor(
    private readonly request: APIRequestContext,
    private readonly opts: { baseLabel?: string; defaultHeaders?: Record<string, string> } = {},
    logger: Logger = rootLogger,
  ) {
    this.log = logger.child({ scope: 'http', client: opts.baseLabel ?? 'api' });
  }

  get<T = unknown>(url: string, options?: RequestOptions) {
    return this.send<T>('get', url, options);
  }
  post<T = unknown>(url: string, options?: RequestOptions) {
    return this.send<T>('post', url, options);
  }
  put<T = unknown>(url: string, options?: RequestOptions) {
    return this.send<T>('put', url, options);
  }
  patch<T = unknown>(url: string, options?: RequestOptions) {
    return this.send<T>('patch', url, options);
  }
  delete<T = unknown>(url: string, options?: RequestOptions) {
    return this.send<T>('delete', url, options);
  }

  private async send<T>(
    method: Method,
    url: string,
    options: RequestOptions = {},
  ): Promise<HttpResponse<T>> {
    const started = Date.now();
    const res = await this.request[method](url, {
      headers: { ...this.opts.defaultHeaders, ...options.headers },
      params: options.params,
      data: options.data,
      form: options.form,
      timeout: options.timeout,
      failOnStatusCode: options.failOnStatusCode ?? false,
    });

    const durationMs = Date.now() - started;
    const status = res.status();
    const body = await parseBody<T>(res);

    this.log.info({ method: method.toUpperCase(), url, status, durationMs }, 'http response');
    if (status >= 400) {
      // 4xx is often an intentional negative assertion — keep it at debug.
      this.log.debug({ method: method.toUpperCase(), url, status, body }, 'http error body');
    }

    return { status, ok: res.ok(), headers: res.headers(), body, raw: res };
  }
}

/**
 * Assert an exact HTTP status, with a message that names the call. Shared by
 * every service so the "expected 201, got 500" check reads identically everywhere.
 */
export function assertStatus(response: HttpResponse, expected: number, label: string): void {
  if (response.status !== expected) {
    throw new Error(
      `${label}: expected HTTP ${expected}, got ${response.status}. Body: ${JSON.stringify(
        response.body,
      ).slice(0, 500)}`,
    );
  }
}

async function parseBody<T>(res: APIResponse): Promise<T> {
  const text = await res.text();
  if (text === '') return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}
