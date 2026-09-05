import type { Locator, Page } from '@playwright/test';
import { BaseComponent } from './base.component.js';

/**
 * A single product tile on the inventory page. Constructed scoped to one
 * `.inventory_item` root, so multiple cards on the page never clash.
 */
export class ProductCard extends BaseComponent {
  readonly name: Locator;
  readonly price: Locator;
  readonly addButton: Locator;
  readonly removeButton: Locator;

  constructor(page: Page, root: Locator) {
    super(page, root);
    this.name = this.root.locator('.inventory_item_name');
    this.price = this.root.locator('.inventory_item_price');
    this.addButton = this.root.getByRole('button', { name: 'Add to cart' });
    this.removeButton = this.root.getByRole('button', { name: 'Remove' });
  }

  async title(): Promise<string> {
    return (await this.name.textContent())?.trim() ?? '';
  }

  async priceValue(): Promise<number> {
    const raw = (await this.price.textContent())?.replace(/[^0-9.]/g, '') ?? '0';
    return Number(raw);
  }

  async addToCart(): Promise<void> {
    await this.addButton.click();
  }

  async removeFromCart(): Promise<void> {
    await this.removeButton.click();
  }
}
