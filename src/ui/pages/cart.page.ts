import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page.js';

export class CartPage extends BasePage {
  protected readonly path = '/cart.html';
  readonly items: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    super(page);
    this.items = page.locator('.cart_item');
    this.checkoutButton = page.getByRole('button', { name: 'Checkout' });
    this.continueShoppingButton = page.getByRole('button', { name: 'Continue Shopping' });
  }

  async itemNames(): Promise<string[]> {
    return this.items.locator('.inventory_item_name').allTextContents();
  }

  async count(): Promise<number> {
    return this.items.count();
  }

  async checkout(): Promise<void> {
    await this.checkoutButton.click();
  }
}
