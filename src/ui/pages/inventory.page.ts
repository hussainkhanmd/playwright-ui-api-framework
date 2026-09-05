import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page.js';
import { Header } from '../components/header.component.js';
import { InventoryList } from '../components/inventory-list.component.js';

export class InventoryPage extends BasePage {
  protected readonly path = '/inventory.html';
  readonly header: Header;
  readonly list: InventoryList;
  readonly title: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new Header(page);
    this.list = new InventoryList(page);
    this.title = page.locator('.title');
  }

  async addToCart(productName: string): Promise<void> {
    await this.list.card(productName).addToCart();
  }

  async removeFromCart(productName: string): Promise<void> {
    await this.list.card(productName).removeFromCart();
  }

  async openCart(): Promise<void> {
    await this.header.openCart();
  }
}
