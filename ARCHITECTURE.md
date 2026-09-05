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
`@playwright/test`. Each concern is a standalone fixture module merged in:

| Module            | Provides                                                                     | Milestone |
| ----------------- | ---------------------------------------------------------------------------- | --------- |
| `logger.fixtures` | per-test pino child logger; buffered lines attached to the report on failure | M1        |
| `api.fixtures`    | typed service clients over `APIRequestContext`                               | M2        |
| `data.fixtures`   | faker factories + API-seeded data with automatic teardown                    | M2        |
| `auth.fixtures`   | API login once → `storageState` injected into UI projects                    | M3        |
| `pages.fixtures`  | lazily-instantiated page objects                                             | M4        |

Trade-off: merging fixtures adds one indirection layer vs. a plain `test.extend` per file. The payoff
is that layers stay independently testable and a spec's dependencies are declared, not imported.

## Page Object Model vs. Screenplay _(expanded in M4)_

The framework ships **POM enhanced with component objects**: small reusable UI components
(`Header`, `LoginForm`, `ProductCard`) composed into page objects. Plain POM tends toward giant page
classes; Screenplay (actors, tasks, questions) is more scalable but heavier to learn and read.
POM-with-components is the pragmatic middle. A documented migration path to Screenplay will live here.

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

## Retry philosophy _(expanded in M6)_

`retries = CI ? 2 : 0`. Locally, a flaky test fails so its flaky design is visible. In CI, retries
absorb genuine infrastructure noise. `trace: 'on-first-retry'` means the first retry is always
debuggable. Retries are not a substitute for fixing a badly-designed wait.

## AI layer isolation boundary _(expanded in M8)_

Everything under `src/ai/` is inert unless `AI_FEATURES_ENABLED=true`. Core fixtures never import it.
The locator "self-heal" is **suggest-only** — it logs a proposed selector, never rewrites one at
runtime. This keeps the experimental surface from adding flakiness to normal runs.
