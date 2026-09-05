import type { Page } from '@playwright/test';
import { BasePage } from '../base.page.js';

/** the-internet `/windows` — opens a second tab in the same browser context. */
export class WindowsPage extends BasePage {
  protected readonly path = '/windows';

  constructor(page: Page) {
    super(page);
  }

  /** Click the link and return the newly-opened Page (same context). */
  async openNewWindow(): Promise<Page> {
    const [popup] = await Promise.all([
      this.page.context().waitForEvent('page'),
      this.page.getByRole('link', { name: 'Click Here' }).click(),
    ]);
    await popup.waitForLoadState();
    return popup;
  }
}
