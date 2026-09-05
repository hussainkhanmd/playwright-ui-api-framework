import { test, expect } from '@common/fixtures/base.fixtures.js';
import { config } from '@common/config/config.js';

test.use({
  baseURL: config.urls.theInternet,
  storageState: { cookies: [], origins: [] },
});

test.describe('multi-window / multi-context @ui @regression', () => {
  test('handles a second tab opened in the same context', async ({ theInternet, page }) => {
    await theInternet.windows.open();
    const newTab = await theInternet.windows.openNewWindow();

    await expect(newTab.locator('.example')).toHaveText('New Window');
    await expect(page).toHaveTitle('The Internet');

    await newTab.close();
    expect(page.context().pages()).toHaveLength(1);
  });

  test('runs two isolated browser contexts side by side', async ({ browser }) => {
    const contextA = await browser.newContext({ baseURL: config.urls.theInternet });
    const contextB = await browser.newContext({ baseURL: config.urls.theInternet });
    try {
      const pageA = await contextA.newPage();
      const pageB = await contextB.newPage();

      await pageA.goto('/inputs');
      await pageB.goto('/checkboxes');

      await pageA.locator('input[type="number"]').fill('42');
      await pageB.locator('#checkboxes input').first().check();

      await expect(pageA.locator('input[type="number"]')).toHaveValue('42');
      await expect(pageB.locator('#checkboxes input').first()).toBeChecked();
      // contexts are isolated: A never saw B's interaction
      await expect(pageA.locator('input[type="number"]')).toHaveValue('42');
    } finally {
      await contextA.close();
      await contextB.close();
    }
  });
});
