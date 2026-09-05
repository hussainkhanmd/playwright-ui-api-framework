import { test, expect } from '@common/fixtures/base.fixtures.js';
import { config } from '@common/config/config.js';

test.use({
  baseURL: config.urls.theInternet,
  storageState: { cookies: [], origins: [] },
});

/**
 * Open shadow DOM. Playwright pierces open shadow roots automatically, so no
 * special API is needed — ordinary text/CSS locators reach inside.
 */
test.describe('shadow DOM @ui @regression', () => {
  test('reads text rendered inside a shadow root', async ({ theInternet }) => {
    await theInternet.shadowDom.open();
    expect(await theInternet.shadowDom.shadowParagraphText()).toBe(
      "Let's have some different text!",
    );
  });

  test('reads light-DOM content slotted into the shadow tree', async ({ theInternet }) => {
    await theInternet.shadowDom.open();
    const items = await theInternet.shadowDom.listItems();
    expect(items).toContain("Let's have some different text!");
    expect(items.length).toBeGreaterThan(1);
  });
});
