import { test as loggerTest } from './logger.fixtures.js';

/**
 * The single `test` object every spec imports.
 *
 *   import { test, expect } from '@common/fixtures/base.fixtures';
 *
 * Specs never import from '@playwright/test' directly — that keeps dependency
 * injection (page objects, API clients, seeded data, auth state, logging) in
 * one place and out of individual tests. Each concern lives in its own
 * `*.fixtures.ts` module and is merged here as it is built:
 *
 *   M1  logger.fixtures      (done)
 *   M2  api.fixtures         service clients on APIRequestContext
 *   M2  data.fixtures        faker factories + API-seeded data w/ teardown
 *   M3  auth.fixtures        API login once -> storageState for UI
 *   M4  pages.fixtures       lazily-instantiated page objects
 */
export const test = loggerTest;

export { expect } from '@playwright/test';
