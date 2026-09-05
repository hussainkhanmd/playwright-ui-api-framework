import { test as authTest } from './auth.fixtures.js';

/**
 * The single `test` object every spec imports.
 *
 *   import { test, expect } from '@common/fixtures/base.fixtures';
 *
 * Specs never import from '@playwright/test' directly — that keeps dependency
 * injection (page objects, API clients, seeded data, auth state, logging) in
 * one place and out of individual tests.
 *
 * Fixtures compose as a chain (each layer genuinely builds on the one before):
 *
 *   logger  ->  api  ->  data  ->  auth  ->  pages (M4)
 *
 * `base.fixtures` always re-exports the tail of that chain.
 */
export const test = authTest;

export { expect } from '@playwright/test';
