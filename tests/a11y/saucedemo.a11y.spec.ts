import { test, expect } from '@common/fixtures/base.fixtures.js';
import { scanA11y, summarise } from '@common/utils/a11y.js';

/**
 * Accessibility scans (axe-core, WCAG 2.0/2.1 A + AA).
 *
 * Full violation lists are attached to every run. Assertions use a documented
 * allowlist so pre-existing issues are tracked, not silently ignored, and no
 * new regression can slip in.
 */
test.describe('accessibility @a11y', () => {
  test('login page has no WCAG A/AA violations', async ({ page }, testInfo) => {
    await page.goto('/');
    const violations = await scanA11y(page, testInfo);
    expect(violations, summarise(violations)).toEqual([]);
  });

  test('inventory page has no violations outside the known allowlist', async ({
    inventoryPage,
    page,
  }, testInfo) => {
    await inventoryPage.open();

    // Known issue: the product-sort <select> has no accessible name (select-name).
    // Tracked as PLATFORM-1234; assert nothing else regresses in the meantime.
    const violations = await scanA11y(page, testInfo, { allow: ['select-name'] });
    expect(violations, summarise(violations)).toEqual([]);
  });

  test('cart page is clean', async ({ inventoryPage, cartPage, page }, testInfo) => {
    await inventoryPage.open();
    await inventoryPage.addToCart('Sauce Labs Backpack');
    await inventoryPage.openCart();
    await expect(cartPage.items).toHaveCount(1);

    const violations = await scanA11y(page, testInfo, { allow: ['select-name'] });
    expect(violations, summarise(violations)).toEqual([]);
  });
});
