import { defineConfig } from '@playwright/test';

/**
 * Config used **only** by `npx playwright merge-reports` in CI.
 *
 * Blob reports come from two kinds of machine: the standard GitHub runners
 * (workspace `/home/runner/work/...`) and the Dockerized `visual-tests` job
 * (workspace `/__w/...`). They record different absolute `testDir` paths, and
 * `merge-reports` refuses to merge across them unless a config pins `testDir`
 * to the real location.
 */
export default defineConfig({
  testDir: './tests',
});
