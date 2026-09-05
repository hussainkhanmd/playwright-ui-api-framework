# Locator strategy

Order of preference when adding a locator to a component or page object. Go down the list only when
the option above genuinely doesn't fit.

| Rank | Locator                                     | Why                                                                                                                  | Example                                       |
| ---- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| 1    | `getByRole(role, { name })`                 | Matches how users and assistive tech perceive the page; resilient to markup churn                                    | `page.getByRole('button', { name: 'Login' })` |
| 2    | `getByLabel` / `getByPlaceholder`           | Form controls, tied to their visible label                                                                           | `page.getByPlaceholder('Username')`           |
| 3    | `getByTestId` (`data-test` / `data-testid`) | Explicit contract with the app; use when there is no accessible name                                                 | `page.locator('[data-test="error"]')`         |
| 4    | `getByText`                                 | Static, user-visible copy (headings, confirmation messages)                                                          | `page.getByText('Thank you for your order!')` |
| 5    | CSS scoped to a component root              | Structural elements with no role/name/testid (lists, badges)                                                         | `this.root.locator('.inventory_item_price')`  |
| —    | XPath                                       | **Avoid.** Only for "element that contains X near Y" that CSS genuinely cannot express, and add a comment saying why |                                               |

## Rules

- **Auto-waiting only.** Web-first assertions (`expect(locator).toBeVisible()`, `toHaveText`, …) and
  actionability checks replace explicit waits. `page.waitForTimeout` is an ESLint error.
- **Scope with the component root.** Inside a component object, resolve children from `this.root`
  (`this.root.locator(...)`) so multiple instances of the same component never clash.
- **One locator, one place.** A selector string appears once — in the component/page that owns it.
  Specs use the page object, never a raw selector.
- **SauceDemo caveat.** SauceDemo's `data-test` attributes are the app's real contract, so ranks 3–5
  see more use here than on an app with strong ARIA. That's expected — the ranking is a default, not
  a dogma.
