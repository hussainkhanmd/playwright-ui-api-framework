import type { Page } from '@playwright/test';

/**
 * Base page object. Subclasses set `path` (relative to the project `baseURL`)
 * and compose component objects. Keep assertions out of page objects — they
 * expose state and actions; specs assert.
 */
export abstract class BasePage {
  protected abstract readonly path: string;

  constructor(protected readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto(this.path);
  }

  async currentUrl(): Promise<string> {
    return this.page.url();
  }
}
