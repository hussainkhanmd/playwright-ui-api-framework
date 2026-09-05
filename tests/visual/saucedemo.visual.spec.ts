import { test, expect } from '@common/fixtures/base.fixtures.js';

/**
 * Visual regression via Playwright's built-in screenshot comparison.
 *
 * Baselines are committed under `tests/visual/*-snapshots/` and are
 * platform-specific (`-chromium-darwin`, `-chromium-linux`, …). Regenerate with
 * `npm run test:visual:update`. CI compares against Linux baselines produced in
 * the official Playwright Docker image — see ARCHITECTURE.md "Visual testing".
 *
 * Dynamic regions are masked so copy/date changes don't cause false diffs.
 */
test.describe('visual regression @visual', () => {
  test('login page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveScreenshot('login.png', {
      mask: [page.locator('.login_credentials_wrap-inner')],
    });
  });

  test('inventory page', async ({ inventoryPage, page }) => {
    await inventoryPage.open();
    await expect(inventoryPage.title).toHaveText('Products');
    await expect(page).toHaveScreenshot('inventory.png', {
      mask: [page.locator('.footer_copy'), page.locator('.social')],
    });
  });

  test('single product card component', async ({ inventoryPage }) => {
    await inventoryPage.open();
    const card = inventoryPage.list.card('Sauce Labs Backpack');
    await expect(card.root).toHaveScreenshot('product-card.png');
  });
});
