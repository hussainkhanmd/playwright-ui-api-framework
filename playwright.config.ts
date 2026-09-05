import { defineConfig, devices } from '@playwright/test';
import { config } from './src/common/config/config.js';

/**
 * Playwright configuration.
 *
 * Projects:
 *   - setup                         : logs in once, saves storage state
 *   - chromium / firefox / webkit   : desktop cross-browser UI (depend on setup)
 *   - mobile-chrome / mobile-safari : mobile-viewport emulation (depend on setup)
 *   - api                           : NO browser launch — fast API-only runs
 *
 * Opinionated choices:
 *   - Retries only in CI. Locally retries=0 so flaky design is visible, not masked.
 *   - trace 'on-first-retry', video/screenshot 'retain-on-failure' — rich debug
 *     artifacts on failure without paying the cost on green runs.
 *   - 'blob' reporter in CI so sharded runs can be merged into one HTML/Allure report.
 *   - UI projects reuse one storage state (log in once) for speed; login.spec.ts
 *     opts out to cover the login flow itself.
 */

const UI_DIRS = ['ui', 'e2e', 'a11y', 'visual'];
const uiTestMatch = new RegExp(`tests/(${UI_DIRS.join('|')})/.*\\.spec\\.ts`);

const uiUse = {
  baseURL: config.urls.ui,
  storageState: config.paths.authState,
};

export default defineConfig({
  testDir: './tests',
  outputDir: './reports/test-results',
  fullyParallel: true,
  forbidOnly: config.isCI,
  retries: config.env.RETRIES ?? (config.isCI ? 2 : 0),
  workers: config.env.WORKERS ?? undefined,
  timeout: config.timeouts.default,
  expect: {
    timeout: 10_000,
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.02,
      animations: 'disabled',
      scale: 'css',
    },
  },

  reporter: [
    config.isCI ? ['blob'] : ['list'],
    ['html', { outputFolder: 'reports/html-report', open: 'never' }],
    [
      'allure-playwright',
      {
        resultsDir: 'reports/allure-results',
        detail: true,
        environmentInfo: {
          test_env: config.testEnv,
          ui_base_url: config.urls.ui,
          api_base_url: config.urls.api,
          node: process.version,
          ci: String(config.isCI),
        },
        categories: [
          {
            name: 'Product defects',
            matchedStatuses: ['failed'],
            messageRegex: '.*(expect|toHaveText|toBeVisible|Schema validation).*',
          },
          { name: 'Test infrastructure', matchedStatuses: ['broken'] },
          {
            name: 'Timeouts',
            matchedStatuses: ['failed', 'broken'],
            messageRegex: '.*(Timeout|timed out).*',
          },
        ],
      },
    ],
    ['./src/common/reporting/slowest-tests.reporter.ts'],
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
      testMatch: /tests\/(api|contract|ai)\/.*\.spec\.ts/,
      use: { baseURL: config.urls.api },
    },
    {
      name: 'setup',
      testMatch: /tests\/.*\.setup\.ts/,
      use: { baseURL: config.urls.ui },
    },
    {
      name: 'chromium',
      testMatch: uiTestMatch,
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], ...uiUse },
    },
    {
      name: 'firefox',
      testMatch: uiTestMatch,
      dependencies: ['setup'],
      use: { ...devices['Desktop Firefox'], ...uiUse },
    },
    {
      name: 'webkit',
      testMatch: uiTestMatch,
      dependencies: ['setup'],
      use: { ...devices['Desktop Safari'], ...uiUse },
    },
    {
      name: 'mobile-chrome',
      testMatch: uiTestMatch,
      dependencies: ['setup'],
      use: { ...devices['Pixel 7'], ...uiUse },
    },
    {
      name: 'mobile-safari',
      testMatch: uiTestMatch,
      dependencies: ['setup'],
      use: { ...devices['iPhone 14'], ...uiUse },
    },
  ],
});
