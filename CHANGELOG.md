# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-09-05

First stable release. The framework is feature-complete for day-to-day UI + API
regression work, with CI/CD, reporting, and contract testing in place.

### Added

- **Core (M0–M1)** — TypeScript (strict) bootstrap, typed/validated config layer,
  dependency-injected Playwright fixtures, central `playwright.config.ts` with
  per-project setup.
- **API layer (M2)** — service-object HTTP layer, Zod response-schema validation
  with readable drift messages, per-worker mock isolation.
- **Auth reuse (M3)** — UI `storageState` setup project and a per-worker API
  token, fetched once and reused across tests.
- **UI layer (M4)** — component + page objects, a cross-layer e2e flow
  (API seed → UI assert), and edge-case coverage (iframes, shadow DOM,
  file upload/download, multi-window/multi-context).
- **Quality gates (M5)** — accessibility scans and visual-regression snapshots.
- **Reporting (M6)** — Allure 3 (Java-free Node CLI), a custom reporter,
  environment info, categories, trend history, and a tag taxonomy
  (`@smoke`, `@regression`, `@api`, `@ui`, `@visual`, `@a11y`, `@contract`, `@ai`).
- **CI/CD (M7)** — GitHub Actions with a sharded browser matrix
  (`chromium`/`firefox`/`webkit` × 2 shards) plus a browser-less `api` job,
  blob-report merge, Allure → GitHub Pages publish, a Docker image, and
  reference GitLab CI / Jenkins pipelines.
- **AI-augmented layer (M8)** — isolated, env-gated (`AI_FEATURES_ENABLED`)
  experiment under `src/ai/`; nothing in the core framework imports it and the
  default suite has zero AI dependency.
- **Contract testing (M9)** — a Pact consumer contract test for the posts API.

### Changed

- Visual regression is now its own **chromium-only** `visual` project (was
  fanned across all three browsers via the shared UI `testMatch`). It runs in a
  dedicated CI job inside the pinned Playwright image so Linux screenshot
  baselines are byte-stable. New `Update visual baselines` workflow
  (`workflow_dispatch`) regenerates and commits them from that same image.
- Screenshot baselines renamed `*-chromium-darwin.png` → `*-visual-darwin.png`
  to match the new project; `*-visual-linux.png` baselines added for CI.
- `merge-report` CI job skips cleanly when the test jobs were skipped
  (e.g. after a `quality` failure) instead of erroring on missing blob reports,
  and merges cross-runner blobs via `playwright.merge.config.ts`.
- `allure-publish` workflow runs only when CI concluded `success`.

### Fixed

- `MOCK_SERVER_AUTO_START` defaulted to `false`, so CI (no `.env` file) started
  no mock backend and every API test failed with `ECONNREFUSED`. Now defaults
  to `true`.
- The `setup` project runs on chromium regardless of the matrix browser; the
  `firefox`/`webkit` CI shards didn't install chromium, so every dependent test
  failed. CI now installs chromium alongside the matrix browser.
- Broken `OWNER/REPO` placeholder links in the README badges.
- Prettier formatting of the committed VS Code workspace file (unblocked CI).

[1.0.0]: https://github.com/hussainkhanmd/playwright-ui-api-framework/releases/tag/v1.0.0
