# Contributing

## Setup

```bash
nvm use 20
npm ci
npx playwright install --with-deps
cp .env.example .env
```

## Before you push

`npm run lint && npm run typecheck && npm test` must pass. A Husky `pre-commit` hook runs
`lint-staged` (ESLint + Prettier on staged files) automatically.

## Conventions

- **Specs** live only in `tests/**` and import `{ test, expect }` from
  `@common/fixtures/base.fixtures.js`. Never import `@playwright/test` in a spec.
- **File names**: `*.spec.ts`. Tag the `describe`/`test` title with `@smoke`, `@regression`,
  `@api`, `@ui`, `@a11y`, `@visual` as appropriate.
- **No hard waits.** `page.waitForTimeout` is an ESLint error. Use web-first assertions and
  auto-waiting locators (`getByRole` > `getByTestId` > `getByLabel` > text > CSS; no XPath).
- **Config**: add new env vars to `src/common/config/env.schema.ts` (with a zod rule and a
  default or `optional()`), document them in `.env.example`, then expose them through
  `config.ts`. Do not read `process.env` elsewhere.

## Adding a…

| Thing            | Where               | Notes                                                               |
| ---------------- | ------------------- | ------------------------------------------------------------------- |
| Page object      | `src/ui/pages/`     | Compose from `src/ui/components/`; injected via `pages.fixtures.ts` |
| API service      | `src/api/services/` | Build on `http-client.ts`; add a zod schema in `src/api/schemas/`   |
| Factory          | `data/factories/`   | faker-based; return plain data, no side effects                     |
| Data-driven case | `data/datadriven/`  | JSON or CSV; loop with `for (const row of rows) test(...)`          |

## Commit messages

Conventional-commits style (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, `ci:`).
