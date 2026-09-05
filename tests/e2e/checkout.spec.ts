import { test, expect } from '@common/fixtures/base.fixtures.js';

/**
 * Full purchase flow: inventory -> cart -> checkout details -> overview ->
 * confirmation. The headline end-to-end journey, tagged @smoke.
 */
test.describe('checkout @e2e @smoke', () => {
  test('completes a two-item purchase', async ({
    inventoryPage,
    cartPage,
    checkoutPage,
    factory,
  }) => {
    const buyer = factory.user();

    await inventoryPage.open();
    await inventoryPage.addToCart('Sauce Labs Backpack');
    await inventoryPage.addToCart('Sauce Labs Bolt T-Shirt');
    await expect(inventoryPage.header.cartBadge).toHaveText('2');

    await inventoryPage.openCart();
    await expect(cartPage.items).toHaveCount(2);
    expect(await cartPage.itemNames()).toEqual(
      expect.arrayContaining(['Sauce Labs Backpack', 'Sauce Labs Bolt T-Shirt']),
    );

    await cartPage.checkout();
    await checkoutPage.fillDetails({
      firstName: buyer.name.split(' ')[0] ?? 'Test',
      lastName: buyer.name.split(' ')[1] ?? 'Buyer',
      postalCode: '90210',
    });

    await expect(checkoutPage.summaryTotal).toContainText('Total:');
    await checkoutPage.finish();

    await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
    await expect(inventoryPage.header.cartBadge).toHaveCount(0);
  });

  test('checkout details form validates required fields', async ({
    inventoryPage,
    cartPage,
    checkoutPage,
  }) => {
    await inventoryPage.open();
    await inventoryPage.addToCart('Sauce Labs Backpack');
    await inventoryPage.openCart();
    await cartPage.checkout();

    await checkoutPage.continueButton.click();
    await expect(checkoutPage.error).toContainText('First Name is required');
  });
});
