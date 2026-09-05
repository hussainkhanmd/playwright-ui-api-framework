/**
 * Local mock REST backend for deterministic, offline API tests.
 *
 * Two ways to use it:
 *   1. `npm run mock:start`            -> long-running server for local dev
 *   2. import { startMockServer }      -> booted/stopped by Playwright global setup
 *
 * The DB is loaded from an in-memory copy of db.json on every boot, so each run
 * starts from the same known state and nothing is written back to disk.
 */
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import type { Server } from 'node:http';
import jsonServer from 'json-server';

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));

export interface MockServerHandle {
  url: string;
  port: number;
  stop: () => Promise<void>;
}

function freshDb(): object {
  return JSON.parse(readFileSync(path.join(here, 'db.json'), 'utf8')) as object;
}

export async function startMockServer(port: number): Promise<MockServerHandle> {
  const app = jsonServer.create();
  const router = jsonServer.router(freshDb());
  const routes = require('./routes.json') as Record<string, string>;

  app.use(jsonServer.defaults({ logger: false }));
  app.use(jsonServer.rewriter(routes));
  app.use(router);

  const server: Server = await new Promise((resolve) => {
    const s = app.listen(port, () => resolve(s));
  });

  return {
    url: `http://127.0.0.1:${port}`,
    port,
    stop: () =>
      new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      }),
  };
}

// Direct execution: `npm run mock:start`
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const port = Number(process.env.MOCK_SERVER_PORT ?? 3001);
  startMockServer(port)
    .then((h) => {
      console.log(`json-server mock listening on ${h.url}  (Ctrl+C to stop)`);
    })
    .catch((err: unknown) => {
      console.error('Failed to start mock server:', err);
      process.exit(1);
    });
}
