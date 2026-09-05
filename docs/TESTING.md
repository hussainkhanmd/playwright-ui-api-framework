# Testing guide — tags, selection, reporting

## Tag taxonomy

Tags go in the `describe` / `test` title (Playwright greps titles).

| Tag           | Meaning                                                                           |
| ------------- | --------------------------------------------------------------------------------- |
| `@smoke`      | Fast, high-value happy paths. Must stay green on every push; a few minutes total. |
| `@regression` | Broader coverage — edge cases, negative paths, data-driven sets.                  |
| `@api`        | Runs in the browser-less `api` project.                                           |
| `@ui`         | Needs a browser.                                                                  |
| `@e2e`        | Crosses layers (API seed → UI assert) or spans a full user journey.               |
| `@a11y`       | axe-core accessibility scan.                                                      |
| `@visual`     | Screenshot comparison.                                                            |
| `@ai`         | Experimental `src/ai/` layer (isolation guard; runs in the `api` project).        |

A test can carry several: `@e2e @smoke`, `@ui @regression`.

## Selecting tests

```bash
# by tag
npm run test:smoke                         # --grep @smoke
npm run test:regression
npx playwright test --grep "@api.*@smoke"  # AND via regex
npx playwright test --grep-invert @visual  # everything except visual

# by project (browser / viewport / api)
npx playwright test --project=chromium
npx playwright test --project=api
npx playwright test --project=mobile-safari

# by path
npx playwright test tests/e2e
npx playwright test tests/ui/edge/iframes.spec.ts

# combine
npx playwright test --project=chromium --grep @smoke tests/e2e
```

## Reporting

| Output          | Command                                        | Notes                                                        |
| --------------- | ---------------------------------------------- | ------------------------------------------------------------ |
| Terminal        | default (`list` local, `blob` in CI)           | plus a custom slowest-5 + flaky tally at the end             |
| Playwright HTML | `npm run report:html`                          | trace/video/screenshot on failure                            |
| Allure          | `npm run report:allure && npm run report:open` | Allure 3 Node CLI — **no Java required**; stakeholder-facing |

Allure gets `environmentInfo` (env, base URLs, Node, CI flag) and `categories` (Product defects /
Test infrastructure / Timeouts) from the reporter config in `playwright.config.ts`. Per-test logs,
axe violation JSON, traces and videos are attached automatically on failure.

## Retries & flakiness

`retries = CI ? 2 : 0`. See [ARCHITECTURE.md](../ARCHITECTURE.md#retry-philosophy). If a test only
passes on retry, the terminal summary counts it as **flaky** and Allure flags it — treat that as a
bug in the test, not a pass.
