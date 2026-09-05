import { defineConfig } from 'allure';

/**
 * Allure 3 report configuration (Node CLI — no Java).
 *
 * `historyPath` + `appendHistory` give trend charts across runs; in CI the
 * history file is cached between workflow runs (see allure-publish.yml).
 * `environmentInfo` and `categories` are supplied by the allure-playwright
 * reporter in playwright.config.ts.
 */
export default defineConfig({
  name: 'Playwright Framework',
  output: 'reports/allure-report',
  historyPath: 'reports/allure-history.jsonl',
  appendHistory: true,
  historyLimit: 20,
  plugins: {
    awesome: {
      options: {
        reportName: 'Playwright Framework — UI + API',
        singleFile: false,
      },
    },
  },
});
