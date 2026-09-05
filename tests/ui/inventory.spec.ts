import { test, expect } from '@common/fixtures/base.fixtures.js';

/**
 * Inventory page behaviour. Starts authenticated via the shared storage state
 * (no login step here).
 */
test.describe('inventory @ui @regression', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.open();
    await expect(inventoryPage.title).toHaveText('Products');
  });

  test('shows the full product catalogue', async ({ inventoryPage }) => {
    await expect(inventoryPage.list.items).toHaveCount(6);
  });

  test('adding and removing items updates the cart badge', async ({ inventoryPage }) => {
    expect(await inventoryPage.header.cartCount()).toBe(0);

    await inventoryPage.addToCart('Sauce Labs Backpack');
    await inventoryPage.addToCart('Sauce Labs Bike Light');
    await expect(inventoryPage.header.cartBadge).toHaveText('2');

    await inventoryPage.removeFromCart('Sauce Labs Backpack');
    await expect(inventoryPage.header.cartBadge).toHaveText('1');
  });

  test('sorts by price, low to high', async ({ inventoryPage }) => {
    await inventoryPage.list.sortBy('Price (low to high)');
    const prices = await inventoryPage.list.prices();
    const sorted = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(sorted);
  });

  test('sorts by name, Z to A', async ({ inventoryPage }) => {
    await inventoryPage.list.sortBy('Name (Z to A)');
    const names = await inventoryPage.list.names();
    expect(names).toEqual([...names].sort().reverse());
  });
});
