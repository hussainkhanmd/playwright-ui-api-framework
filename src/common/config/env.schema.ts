import { z } from 'zod';

/**
 * Single source of truth for every environment variable the framework reads.
 *
 * Design choice: validate config once, at the edge, and fail fast. Everywhere
 * else in the codebase consumes the already-parsed, fully-typed `config`
 * object from `config.ts` — no raw `process.env` access, no `!` assertions,
 * no "undefined leaked into a URL" bugs.
 */

const booleanish = z
  .enum(['true', 'false', '1', '0', ''])
  .transform((v) => v === 'true' || v === '1')
  .default(false);

// Same shape as `booleanish` but defaults to `true` — for flags that should be
// on unless explicitly disabled (e.g. the offline mock backend).
const booleanishDefaultTrue = z
  .enum(['true', 'false', '1', '0', ''])
  .transform((v) => v !== 'false' && v !== '0')
  .default(true);

const optionalUrl = z.url().optional();

export const envSchema = z
  .object({
    TEST_ENV: z.enum(['dev', 'staging', 'prod']).default('dev'),

    // Optional hard overrides for URLs resolved by environments.ts.
    UI_BASE_URL: optionalUrl,
    API_BASE_URL: optionalUrl,
    THE_INTERNET_BASE_URL: optionalUrl,

    MOCK_SERVER_PORT: z.coerce.number().int().positive().default(3001),
    // On unless explicitly disabled: API tests target the local mock by default,
    // so CI (which has no .env file) must still auto-start it.
    MOCK_SERVER_AUTO_START: booleanishDefaultTrue,

    UI_USERNAME: z.string().min(1).default('standard_user'),
    UI_PASSWORD: z.string().min(1).default('secret_sauce'),

    CI: booleanish,
    HEADLESS: z
      .enum(['true', 'false', '1', '0', ''])
      .transform((v) => v !== 'false' && v !== '0')
      .default(true),
    DEFAULT_TIMEOUT_MS: z.coerce.number().int().positive().default(30_000),
    RETRIES: z.coerce.number().int().min(0).max(5).optional(),
    WORKERS: z
      .string()
      .optional()
      .transform((v) => (v && v.trim() !== '' ? v : undefined)),

    LOG_LEVEL: z
      .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
      .default('info'),

    // Experimental AI layer — never required for a normal run.
    AI_FEATURES_ENABLED: booleanish,
    ANTHROPIC_API_KEY: z.string().min(1).optional(),
    AI_MODEL: z.string().min(1).default('claude-sonnet-5'),

    SLACK_WEBHOOK_URL: optionalUrl,
    TEAMS_WEBHOOK_URL: optionalUrl,
  })
  .refine((c) => !c.AI_FEATURES_ENABLED || !!c.ANTHROPIC_API_KEY, {
    message: 'AI_FEATURES_ENABLED=true requires ANTHROPIC_API_KEY to be set.',
    path: ['ANTHROPIC_API_KEY'],
  });

export type Env = z.infer<typeof envSchema>;
