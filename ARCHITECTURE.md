# Architecture & Design Rationale

This document explains _why_ the framework is shaped the way it is. It grows with each milestone.

## Guiding principles

1. **One toolchain.** UI and API tests share the Playwright runner, fixtures, reporting and CI.
   No second assertion library, no second runner.
2. **Validate at the edge, trust everywhere else.** Environment config is parsed and zod-validated
   once in `src/common/config/config.ts`. The rest of the codebase consumes a typed object.
3. **Dependency injection over instantiation.** Specs receive ready objects (page objects, service
   clients, seeded data, auth state, a logger) from fixtures. `new SomethingPage(page)` does not
   appear in tests.
4. **Fail fast, fail loud.** Bad config aborts before browsers launch. Schema drift in an API
   response fails the test with a readable diff.
5. **Green runs stay cheap.** Traces, video and screenshots are captured on failure/retry only.

## The DI seam: `base.fixtures.ts`

Every spec imports `{ test, expect }` from `src/common/fixtures/base.fixtures.ts` — never from
`@playwright/test`. Each concern is its own module, composed as a **chain** (each layer genuinely
builds on the one before), and `base.fixtures.ts` re-exports the tail:

```
logger.fixtures  ->  api.fixtures  ->  data.fixtures  ->  auth.fixtures  ->  pages.fixtures
```

| Module            | Provides                                                                         |
| ----------------- | -------------------------------------------------------------------------------- |
| `logger.fixtures` | per-test pino child logger; buffered lines attached to the report on failure     |
| `api.fixtures`    | worker-scoped mock backend + `api` = HttpClient + per-resource service clients   |
| `data.fixtures`   | `factory` (faker builders) + `seed` (API-created rows, deleted in teardown)      |
| `auth.fixtures`   | `apiAuth` (login once per worker) + `authedRequest` (bearer-token context)       |
| `pages.fixtures`  | lazily-instantiated page objects (`loginPage`, `inventoryPage`, `theInternet.*`) |

Trade-off: a chain vs. Playwright's `mergeTests`. `mergeTests` suits genuinely independent bundles;
here the layers depend on each other (seeding needs the API services, auth needs the mock), so the
chain reflects reality and keeps the dependency order explicit.

## Page Object Model vs. Screenplay

The framework ships **POM enhanced with component objects**.

- **Component objects** (`src/ui/components/`) — small reusable pieces of UI scoped to a root locator
  (`Header`, `LoginForm`, `ProductCard`, `InventoryList`). They extend `BaseComponent` and resolve
  children from `this.root`, so several instances on one page never clash.
- **Page objects** (`src/ui/pages/`) — extend `BasePage`, set a `path`, and _compose_ components.
  They expose state and actions; they never assert (specs assert).
- Injected lazily by `pages.fixtures.ts`: a spec asks for `{ inventoryPage }` and gets a ready object.

| Pattern                                 | Strength                                                              | Cost                                                            | Verdict                                                             |
| --------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------- |
| Plain POM                               | familiar, quick to start                                              | pages balloon into 300-line god-classes                         | too coarse                                                          |
| **POM + components**                    | reuse across pages, small classes, easy onboarding                    | one extra layer to learn                                        | **default**                                                         |
| Screenplay (actors / tasks / questions) | composable behaviour, reads like a user story, scales to large suites | steeper learning curve, more ceremony, unfamiliar to many teams | reach for it when the suite is large and shared across many authors |

### Migration path to Screenplay

The component/page objects are already the "abilities" layer, so the move is additive, not a rewrite:

1. Introduce an `Actor` holding abilities (`BrowseTheWeb(page)`, `CallAnApi(request)`).
2. Wrap existing page-object actions as **Tasks** (`Login.withCredentials(u, p)` calls `LoginPage`).
3. Wrap read methods as **Questions** (`TheInventory.itemCount()` calls `InventoryList.count()`).
4. Swap the `pages` fixture for an `actor` fixture; migrate specs file-by-file — both styles can
   coexist during the transition because they share the same page objects underneath.

## Why Playwright's `request` context, not a REST-assured-style library

Using `APIRequestContext` instead of Axios/supertest/REST-assured means: shared config and proxy
settings, API calls visible in the same trace as UI steps, one auth story for both layers, and no
extra dependency. The structure a dedicated library would give us is provided explicitly:

| Concern                                            | Where                                                                                             |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Transport (headers, timing, logging, body parsing) | `src/api/client/http-client.ts`                                                                   |
| Per-resource operations                            | `src/api/services/*.service.ts` (`PostsService`, `UsersService`, `AuthService`)                   |
| Response contracts                                 | `src/api/schemas/*.schema.ts` (zod; DTO types are `z.infer` of the schema)                        |
| Status assertions                                  | `assertStatus()` in `http-client.ts` — identical message everywhere                               |
| Schema assertions                                  | `assertSchema()` in `src/common/utils/validate.ts` — throws a readable path list, not a JSON wall |

Every service method validates its response before returning, so a spec that calls
`api.posts.get(1)` either gets a fully-typed `Post` or a loud, located failure.

## Backend isolation for parallel API tests

The local mock (`mocks/json-server`) is booted **once per worker** on `MOCK_SERVER_PORT + workerIndex`
from a fresh in-memory copy of `db.json` (`api.fixtures.ts`, worker scope). Without this, parallel
workers sharing one mutable server collide on auto-incremented ids and pollute each other's reads.
With it, writes are safe to parallelise and each worker starts from known state. Point `API_BASE_URL`
at a real server and no mock starts — every worker uses that shared server instead.

The `seed` fixture (`data.fixtures.ts`) creates rows through the API and deletes them in reverse
order on teardown, so no test leaves state behind or depends on another test's data. UI-created
data is never used as a fixture — seeding goes through the API for speed and determinism.

## Contract testing (Pact)

`tests/contract/posts.pact.spec.ts` is a **consumer-driven** contract test. It stands up an in-process
Pact mock, drives it with the real `PostsService` (so the zod schema and the contract can't drift
apart), and writes a pact file to `reports/pacts/`. Schema validation asserts _"this response parses"_;
the contract asserts _"the provider promises this shape and these fields"_ and produces an artifact the
provider can verify independently.

Full CI/CD integration (not wired here, deliberately — it needs infrastructure):

1. Consumer pipeline publishes the pact file to a **Pact Broker** (`pact-broker publish`), tagged with
   the branch and version.
2. Provider pipeline runs **provider verification** against the broker (`@pact-foundation/pact` verifier
   or the CLI) using real provider states.
3. **`can-i-deploy`** gates each side's release on the cross-matrix of verified pacts.

The value even without a broker: the contract is executable documentation of exactly what this client
depends on, checked on every run.

## API → UI auth reuse

Two independent "authenticate once" optimisations:

**UI (implemented).** `tests/auth.setup.ts` is a Playwright `setup` project that every UI project
declares as a `dependency`. It logs in through the SauceDemo UI a single time, saves
`.auth/saucedemo.json`, and the UI projects load it via `use.storageState`. Every UI test then starts
on a protected page already authenticated — `tests/e2e/session-reuse.spec.ts` proves it by navigating
straight to `/inventory.html`. The login flow itself is still covered by `tests/ui/login.spec.ts`,
which opts out with `test.use({ storageState: { cookies: [], origins: [] } })`.

**API (implemented).** `auth.fixtures.ts` logs in once per worker via `AuthService` and shares the
token across every test in that worker (`apiAuth`), plus an `authedRequest` context that carries
`Authorization: Bearer <token>`.

**Bridging the two for a real backend.** SauceDemo has no login API, so the UI storage state is
produced through the UI. When the app under test _does_ expose a login endpoint, skip the browser
entirely in `auth.setup.ts`:

```ts
const { token } = await new AuthService(http).login(user, pass);
await request.storageState(); // or hand-build:
const state = {
  cookies: [{ name: 'session', value: token, domain: '.example.com', path: '/' /* ... */ }],
  origins: [{ origin: config.urls.ui, localStorage: [{ name: 'auth_token', value: token }] }],
};
fs.writeFileSync(config.paths.authState, JSON.stringify(state));
```

The UI projects consume the file the same way regardless of how it was produced. **Do not** share
auth state with tests that assert the login/logout flow, session expiry, or role switching.

## Accessibility testing

`scanA11y()` (`src/common/utils/a11y.ts`) runs axe-core (WCAG 2.0/2.1 A + AA) against a page,
**always attaches the full violation list** to the report, and returns violations minus a documented
`allow` list of pre-existing rule ids. Real teams ratchet accessibility debt down rather than
blocking CI on day one — the allowlist keeps that explicit and code-reviewed (each entry carries a
ticket reference), while still failing on any _new_ regression. SauceDemo's login page is clean; the
inventory page has one tracked issue (`select-name` on the sort dropdown).

## Visual testing

Playwright's built-in `toHaveScreenshot`. Tolerances live in `playwright.config.ts`
(`maxDiffPixelRatio: 0.02`, animations disabled). Dynamic regions are `mask`ed so copy/date changes
don't cause false diffs. Baselines are **committed** and platform-suffixed
(`login-chromium-darwin.png`); regenerate locally with `npm run test:visual:update`. CI runs inside
the official Playwright Docker image so its Linux baselines (`-chromium-linux.png`) are byte-stable —
never trust a screenshot baseline generated on a different OS/font stack than the one comparing it.

## Reporting

Four reporters run together:

- **Terminal** — `list` locally, `blob` in CI (blob shards merge into one report).
- **Custom** (`src/common/reporting/slowest-tests.reporter.ts`) — prints the slowest five tests and a
  pass/flaky tally at the end. Early warning for a test drifting toward a timeout.
- **Playwright HTML** — trace/video/screenshot on failure.
- **Allure** — stakeholder-facing. Uses the Allure 3 **Node** CLI (`allure` package), so building the
  report needs no Java. `environmentInfo` and `categories` are set in `playwright.config.ts`;
  per-test logs, axe JSON, traces and videos attach automatically.

## Retry philosophy

`retries = CI ? 2 : 0`. Locally, a flaky test fails so its flaky design is visible. In CI, retries
absorb genuine infrastructure noise. `trace: 'on-first-retry'` means the first retry is always
debuggable. Retries are not a substitute for fixing a badly-designed wait.

**Flaky-by-design vs. environment flake.** A pass-on-retry is reported as _flaky_ (terminal tally +
Allure flag) and is treated as a test bug, not a pass. Tells that it's the test's fault, not the
environment: it depends on another test's data (fix: use the `seed` fixture); it asserts on a value
that races a network response (fix: web-first assertion, not a bare `expect(await ...)`); it uses a
`nth()` / text locator that isn't unique (fix: scope to a component root); it relies on animation
timing (fix: `animations: 'disabled'`). Genuine environment flake looks like connection resets or
cold-start timeouts spread randomly across unrelated tests — that's what the CI retries are for.

## AI layer isolation boundary

Everything under `src/ai/` is inert unless `AI_FEATURES_ENABLED=true` **and** `ANTHROPIC_API_KEY` is
set; calling in without both throws (`assertAiEnabled()`), it never silently no-ops. Core modules
(fixtures, page objects, services, config) never import `src/ai/*` — verified by
`tests/ai/ai-layer.spec.ts`, so the default suite has no AI import cost, no network, no key
requirement, and CI is byte-identical with or without a key present.

Guardrails per tool:

- **`test-data-generator`** — the model's output is parsed through the caller's zod schema before it
  is returned; a hallucinated shape fails there and never reaches a test. Disabled → throws, pointing
  at `data/factories/`.
- **`locator-healer`** — suggest-only. It logs and attaches candidate selectors to the report; it
  never rewrites a locator and is never wired into a retry path. A self-healing selector that
  silently changes what a test asserts hides regressions — a red test is the correct outcome.
- **`scaffold-test`** — writes a `*.draft.spec.ts` with a review banner; a human finishes and commits.

Model id comes from `AI_MODEL` (default `claude-sonnet-5` — a bulk-generation/worker role; raise to
`claude-opus-5` for harder scaffolding).
