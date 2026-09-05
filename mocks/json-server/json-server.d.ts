/**
 * Minimal ambient types for json-server 0.17's programmatic API.
 * (The package ships no types and @types/json-server lags the runtime.)
 */
declare module 'json-server' {
  import type { Server } from 'node:http';

  type Handler = (...args: unknown[]) => void;

  interface JsonServerApp {
    use(handler: Handler | Handler[]): void;
    listen(port: number, cb?: () => void): Server;
  }

  interface JsonServer {
    create(): JsonServerApp;
    router(
      source: string | object,
    ): Handler & { db: { getState(): unknown; setState(state: unknown): void } };
    defaults(opts?: {
      logger?: boolean;
      readOnly?: boolean;
      noCors?: boolean;
      bodyParser?: boolean;
      static?: string;
    }): Handler[];
    rewriter(routes: Record<string, string>): Handler;
    bodyParser: Handler;
  }

  const jsonServer: JsonServer;
  export default jsonServer;
}
