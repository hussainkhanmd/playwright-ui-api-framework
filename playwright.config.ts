import { defineConfig, devices } from '@playwright/test';
import { config } from './src/common/config/config.js';

/**
 * Playwright configuration.
 *
 * Projects:
 *   - chromium / firefox / webkit  : desktop cross-browser UI
 *   - mobile-chrome / mobile-safari : mobile-viewport emulation
 *   - api                          : NO browser launch — fast API-only runs
 *
 * Opinionated choices:
 *   - Retries only in CI. Locally retries=0 so flaky design is visible, not masked.
 *   - trace 'on-first-retry', video/screenshot 'retain-on-failure' — rich debug
 *     artifacts on failure without paying the cost on green runs.
 *   - 'blob' reporter in CI so sharded runs can be merged into one HTML/Allure report.
 */

const UI_DIRS = ['tests/ui', 'tests/e2e', 'tests/a11y', 'tests/visual'];

export default defineConfig({
  testDir: './tests',
  outputDir: './reports/test-results',
  fullyParallel: true,
  forbidOnly: config.isCI,
  retries: config.env.RETRIES ?? (config.isCI ? 2 : 0),
  workers: config.env.WORKERS ?? undefined,
  timeout: config.timeouts.default,
  expect: { timeout: 10_000 },

  reporter: [
    config.isCI ? ['blob'] : ['list'],
    ['html', { outputFolder: 'reports/html-report', open: 'never' }],
    ['allure-playwright', { resultsDir: 'reports/allure-results', detail: true }],
  ],

  globalSetup: './scripts/global-setup.ts',
  globalTeardown: './scripts/global-teardown.ts',

  use: {
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    headless: config.env.HEADLESS,
  },

  projects: [
    {
      name: 'api',
      testMatch: /tests\/(api|contract)\/.*\.spec\.ts/,
      use: { baseURL: config.urls.api },
    },
    {
      name: 'chromium',
      testMatch: uiTestMatch(),
      use: { ...devices['Desktop Chrome'], baseURL: config.urls.ui },
    },
    {
      name: 'firefox',
      testMatch: uiTestMatch(),
      use: { ...devices['Desktop Firefox'], baseURL: config.urls.ui },
    },
    {
      name: 'webkit',
      testMatch: uiTestMatch(),
      use: { ...devices['Desktop Safari'], baseURL: config.urls.ui },
    },
    {
      name: 'mobile-chrome',
      testMatch: uiTestMatch(),
      use: { ...devices['Pixel 7'], baseURL: config.urls.ui },
    },
    {
      name: 'mobile-safari',
      testMatch: uiTestMatch(),
      use: { ...devices['iPhone 14'], baseURL: config.urls.ui },
    },
  ],
});

function uiTestMatch(): RegExp {
  const group = UI_DIRS.map((d) => d.replace('tests/', '')).join('|');
  return new RegExp(`tests/(${group})/.*\\.spec\\.ts`);
}
