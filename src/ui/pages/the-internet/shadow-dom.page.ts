import type { Page } from '@playwright/test';
import { BasePage } from '../base.page.js';

/**
 * the-internet `/shadowdom` — custom elements with open shadow roots.
 * Playwright's engine pierces open shadow DOM automatically, so ordinary
 * text/CSS locators reach inside without any special API.
 */
export class ShadowDomPage extends BasePage {
  protected readonly path = '/shadowdom';

  constructor(page: Page) {
    super(page);
  }

  /** Text slotted into the first <my-paragraph> and rendered via its shadow root. */
  async shadowParagraphText(): Promise<string> {
    return (
      (
        await this.page
          .locator('my-paragraph')
          .first()
          .locator('span[slot="my-text"]')
          .textContent()
      )?.trim() ?? ''
    );
  }

  /** List items slotted from light DOM into the second <my-paragraph>'s shadow tree. */
  async listItems(): Promise<string[]> {
    return this.page.locator('my-paragraph ul[slot="my-text"] li').allTextContents();
  }
}
