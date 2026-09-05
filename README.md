# Playwright Framework — Unified UI + API Test Automation

Production-grade test automation framework built on **Playwright + TypeScript (strict)**. One repo,
one toolchain, for both **UI** and **API** testing — layered architecture, dependency-injected
fixtures, contract tests, sharded CI, Allure reporting, and an isolated experimental AI layer.

[![CI](https://github.com/hussainkhanmd/playwright-ui-api-framework/actions/workflows/ci.yml/badge.svg)](https://github.com/hussainkhanmd/playwright-ui-api-framework/actions/workflows/ci.yml)
[![Allure Report](https://img.shields.io/badge/Allure-report-brightgreen)](https://hussainkhanmd.github.io/playwright-ui-api-framework/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
![Node](https://img.shields.io/badge/node-20_LTS-339933?logo=node.js&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-1.63-2EAD33?logo=playwright&logoColor=white)

<p align="center">
  <img src="docs/assets/allure-dashboard.png" alt="Allure report — 53 tests, 100% passing across the UI and API projects" width="900">
  <br>
  <em>Allure 3 report from a local <code>npm test</code> run — full UI + API suite, 100% green.</em>
</p>

---

## Why this exists

1. **Real project work** — a framework solid enough to run day-to-day regression and API suites.
2. **Learning** — a reference implementation of current Playwright practice (fixtures for DI, API/UI
   auth reuse, trace-first debugging, sharded CI).
3. **Portfolio** — demonstrates senior/lead QA engineering: layered architecture, documented
   trade-offs, CI/CD, and an isolated experimental AI-augmented layer.

## Quick start

```bash
nvm use 20                     # Node 20 LTS (or: brew install node@20)
npm ci
npx playwright install --with-deps
cp .env.example .env
npm run check:env              # validates config, prints resolved settings
npm test                       # full matrix
```

### Running subsets

| Command                                        | What runs                                   |
| ---------------------------------------------- | ------------------------------------------- |
| `npm run test:api`                             | API project only — **no browser launched**  |
| `npm run test:ui`                              | UI specs on Chromium                        |
| `npm run test:e2e`                             | Cross-layer (API seed → UI assert)          |
| `npm run test:a11y`                            | `@axe-core/playwright` scans                |
| `npm run test:visual`                          | Screenshot comparison                       |
| `npm run test:smoke` / `test:regression`       | Tag-filtered (`--grep`)                     |
| `npm run mock:start`                           | Long-running local json-server mock backend |
| `npm run report:allure && npm run report:open` | Build + open the Allure report              |

`npx playwright test tests/contract` runs the Pact consumer test. Add
`--project=firefox|webkit|mobile-chrome|mobile-safari` for a specific browser/viewport.
Full tag/selection/reporting reference: [docs/TESTING.md](./docs/TESTING.md).

## Architecture

```mermaid
flowchart TD
  spec["tests/** — ui · api · e2e · a11y · visual · contract · ai<br/>(tagged @smoke / @regression / @api / @ui / ...)"]
  base["src/common/fixtures/base.fixtures.ts<br/>single { test, expect } export = the DI seam"]
  subgraph fixtures["Fixture chain"]
    direction LR
    logf[logger] --> apif[api] --> dataf[data] --> authf[auth] --> pagesf[pages]
  end
  subgraph layers["Framework layers"]
    apilayer["src/api — http-client → services → zod schemas"]
    uilayer["src/ui — component objects → page objects"]
    common["src/common — typed config (zod), logger, utils"]
    ailayer["src/ai — EXPERIMENTAL, env-gated, isolated"]
  end
  backend["mocks/json-server (per-worker, default API target)<br/>SauceDemo + the-internet (UI targets)"]

  spec --> base --> fixtures
  apif --> apilayer
  pagesf --> uilayer
  fixtures --> common
  apilayer --> backend
  uilayer --> backend
```

Full rationale — POM vs. Screenplay, why Playwright's `request` context instead of a REST-assured-style
library, retry philosophy, the AI isolation boundary — lives in [ARCHITECTURE.md](./ARCHITECTURE.md).

## Folder structure

```
src/common/   typed config (zod, fail-fast), fixtures (DI), logger, reporting, utils
src/api/      http-client → per-resource services → zod response schemas → DTO types
src/ui/       component objects → page objects (+ locator-strategy.md)
src/ai/       experimental AI-augmented tooling (OFF unless AI_FEATURES_ENABLED=true)
data/         static reference data + files, faker factories, data-driven JSON/CSV
mocks/        local json-server mock backend (seeded, in-memory, offline)
tests/        specs only — ui/ api/ e2e/ a11y/ visual/ contract/ ai/ + auth.setup.ts
scripts/      global setup/teardown, env preflight
docker/       Dockerfile (official Playwright image)   ci/  Jenkinsfile
docs/         TESTING.md (tags, selection, reporting)
.github/      workflows: ci · allure-publish · notify
```

## Configuration

All config flows through `src/common/config/config.ts`: `.env` → **zod validation (fail fast)** →
per-environment URL resolution (`TEST_ENV=dev|staging|prod`). Nothing else reads `process.env`.
Secrets are never committed — `.env` is git-ignored; CI injects real values as secrets.

## CI/CD

| File                                   | Purpose                                                                                                                                                                                                                                              |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.github/workflows/ci.yml`             | Lint/typecheck → sharded matrix (`chromium`/`firefox`/`webkit` × 2 shards) + browser-less `api` job. Caches npm + Playwright browsers; uploads blob reports, Allure results, and traces/videos on failure; merges blob reports into one HTML report. |
| `.github/workflows/allure-publish.yml` | On `CI` completing on `main`: builds the Allure report (trend history via `actions/cache`) and deploys it to **GitHub Pages**.                                                                                                                       |
| `.github/workflows/notify.yml`         | Reusable — posts to Slack/Teams on `main` failure (no-op without the webhook secret).                                                                                                                                                                |
| `docker/Dockerfile`                    | Official Playwright image (`v1.63.0-noble`) for reproducible local/CI runs: `docker build -f docker/Dockerfile -t pwf . && docker run --rm pwf npm run test:api`.                                                                                    |
| `.gitlab-ci.yml`, `ci/Jenkinsfile`     | Reference ports of the same pipeline for cross-platform CI.                                                                                                                                                                                          |

**Repo setup after cloning:** enable Pages (Settings → Pages → _GitHub Actions_),
and optionally add `SLACK_WEBHOOK_URL` / `TEAMS_WEBHOOK_URL` secrets. Update the `OWNER/REPO` slug in
the badges above to your fork.

## AI-augmented layer (experimental, off by default)

`src/ai/` is an **isolated, env-gated** experiment — nothing in the core framework imports it, and the
default suite has zero AI dependency. Enable with `AI_FEATURES_ENABLED=true` + `ANTHROPIC_API_KEY`.

| Tool                              | Command / entry                                              | Guardrail                                                                                    |
| --------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| Schema-bound test-data generation | `generateData(zodSchema, { description })`                   | Output is parsed through the zod schema; disabled → points you at `data/factories/`          |
| Locator self-heal                 | `suggestLocators(page, brokenSelector, intent)`              | **Suggest-only** — logs + attaches to the report, never rewrites a locator, never runs in CI |
| Story → draft spec                | `npm run ai:scaffold -- --story data/static/sample-story.md` | Writes a `.draft.spec.ts` with a TODO banner; a human finishes and commits it                |

See [src/ai/README.md](./src/ai/README.md) for the full risk boundary.

### How this maps to AI-augmented test engineering leadership

The interesting part for an EM / Head of QA isn't the API calls — it's the **operating model**:

- **Determinism stays sacred.** AI lives behind a flag, outside the hot path, so the regression suite
  a team relies on is byte-identical with or without it. That's the difference between "we use AI" and
  "our suite got flaky."
- **Schemas and page objects are the contract the AI works against.** A generator that must satisfy a
  zod schema, a scaffolder that must use existing fixtures — the framework's structure is what makes
  AI output _reviewable_ instead of a liability.
- **Human-in-the-loop by construction.** Suggest-only healing and draft-only scaffolding keep a person
  accountable for what lands in `main`. AI compresses the boring 80%; it doesn't sign off.
- **The leadership pitch:** invest in the deterministic core first (typed config, DI, contracts,
  trace-first debugging); layer AI on as an accelerant with hard boundaries; measure it on
  cycle-time, not novelty.

## What's built

| Area                       | Highlights                                                                                                                                                                                            |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Foundation**             | ESM + TS strict, zod-validated fail-fast config, pino logging, ESLint/Prettier/Husky                                                                                                                  |
| **Fixtures (DI)**          | One `test` export; chain: logger → api → data → auth → pages                                                                                                                                          |
| **API**                    | `HttpClient` over `APIRequestContext`, per-resource services, zod response contracts, per-worker json-server isolation, `seed` fixture w/ auto-teardown, data-driven (JSON/CSV), live JSONPlaceholder |
| **Auth reuse**             | UI `setup` project → `storageState`; per-worker API token (`apiAuth`) + bearer context                                                                                                                |
| **UI**                     | Component objects → page objects (POM); SauceDemo e2e purchase flow; iframe, shadow DOM, file upload/download, multi-tab, multi-context                                                               |
| **Quality**                | axe-core a11y with ratcheting allowlist; visual regression with committed baselines; Pact consumer contract test                                                                                      |
| **Reporting**              | Allure 3 (no Java) + env/categories, Playwright HTML, custom slowest/flaky reporter, trace/video/log-on-failure                                                                                       |
| **CI/CD**                  | GitHub Actions sharded matrix + merged report + Allure→Pages + Slack/Teams notify; Docker; GitLab/Jenkins reference pipelines                                                                         |
| **AI (experimental, off)** | Schema-bound data gen, suggest-only locator heal, story→draft scaffolder — isolated & env-gated                                                                                                       |

Design rationale and trade-offs: [ARCHITECTURE.md](./ARCHITECTURE.md) · Contributing: [CONTRIBUTING.md](./CONTRIBUTING.md)

## License

MIT — see [LICENSE](./LICENSE).
