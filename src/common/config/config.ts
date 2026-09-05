import { fileURLToPath } from 'node:url';
import path from 'node:path';
import dotenv from 'dotenv';
import { envSchema, type Env } from './env.schema.js';
import { environments, type EnvironmentUrls } from './environments.js';

/**
 * Typed, validated configuration. Import `config` anywhere; never touch
 * `process.env` directly outside this module.
 *
 *   parse .env  ->  zod validation (fail fast)  ->  resolve per-env URLs
 */

// this file: <root>/src/common/config/config.ts  ->  up 4 to <root>
const rootDir = path.resolve(fileURLToPath(import.meta.url), '../../../..');

// Load .env if present. CI injects real env vars, so a missing file is fine.
dotenv.config({ path: path.join(rootDir, '.env'), quiet: true });

function parseEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('\n');
    throw new Error(
      `\nInvalid environment configuration. Fix the following, then re-run:\n${issues}\n\n` +
        `Tip: copy .env.example to .env, or run \`npm run check:env\` for details.\n`,
    );
  }
  return result.data;
}

const env = parseEnv();

const profile: EnvironmentUrls = environments[env.TEST_ENV];

export interface AppConfig {
  readonly env: Env;
  readonly rootDir: string;
  readonly testEnv: Env['TEST_ENV'];
  readonly urls: EnvironmentUrls;
  readonly credentials: { username: string; password: string };
  readonly mock: { port: number; autoStart: boolean; url: string };
  readonly timeouts: { default: number };
  readonly ai: { enabled: boolean; model: string; apiKey?: string };
  readonly paths: { authState: string };
  readonly isCI: boolean;
}

export const config: AppConfig = {
  env,
  rootDir,
  testEnv: env.TEST_ENV,
  urls: {
    ui: env.UI_BASE_URL ?? profile.ui,
    api: env.API_BASE_URL ?? profile.api,
    theInternet: env.THE_INTERNET_BASE_URL ?? profile.theInternet,
  },
  credentials: { username: env.UI_USERNAME, password: env.UI_PASSWORD },
  mock: {
    port: env.MOCK_SERVER_PORT,
    autoStart: env.MOCK_SERVER_AUTO_START,
    url: `http://127.0.0.1:${env.MOCK_SERVER_PORT}`,
  },
  timeouts: { default: env.DEFAULT_TIMEOUT_MS },
  ai: {
    enabled: env.AI_FEATURES_ENABLED,
    model: env.AI_MODEL,
    apiKey: env.ANTHROPIC_API_KEY,
  },
  paths: { authState: path.join(rootDir, '.auth', 'saucedemo.json') },
  isCI: env.CI,
};

export type { Env };
