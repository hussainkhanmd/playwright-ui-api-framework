import type { Locator, Page } from '@playwright/test';
import { BaseComponent } from './base.component.js';
import { ProductCard } from './product-card.component.js';

export type SortOption =
  'Name (A to Z)' | 'Name (Z to A)' | 'Price (low to high)' | 'Price (high to low)';

/** The grid of product cards on the inventory page. */
export class InventoryList extends BaseComponent {
  readonly items: Locator;
  readonly sortDropdown: Locator;

  constructor(page: Page) {
    super(page, page.locator('.inventory_list'));
    this.items = this.page.locator('.inventory_item');
    this.sortDropdown = this.page.locator('[data-test="product-sort-container"]');
  }

  async count(): Promise<number> {
    return this.items.count();
  }

  /** A card addressed by visible product name. */
  card(productName: string): ProductCard {
    const root = this.items.filter({ has: this.page.getByText(productName, { exact: true }) });
    return new ProductCard(this.page, root);
  }

  cardAt(index: number): ProductCard {
    return new ProductCard(this.page, this.items.nth(index));
  }

  async names(): Promise<string[]> {
    return this.items.locator('.inventory_item_name').allTextContents();
  }

  async prices(): Promise<number[]> {
    const raw = await this.items.locator('.inventory_item_price').allTextContents();
    return raw.map((t) => Number(t.replace(/[^0-9.]/g, '')));
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.sortDropdown.selectOption({ label: option });
  }
}
