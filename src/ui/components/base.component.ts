import type { Locator, Page } from '@playwright/test';

/**
 * Base for **component objects** — reusable pieces of UI (a header, a form, a
 * card) scoped to a root locator. Pages compose components instead of owning
 * hundreds of locators.
 *
 * Every component takes the `Page` plus its root; child locators are resolved
 * with `this.root.locator(...)` / `this.root.getBy*(...)` so a component is
 * safe to use even when several instances exist on the page.
 */
export abstract class BaseComponent {
  protected constructor(
    protected readonly page: Page,
    readonly root: Locator,
  ) {}
}
