import type { Locator, Page } from '@playwright/test';
import { BaseComponent } from './base.component.js';

/** SauceDemo primary header: burger menu + shopping-cart link/badge. */
export class Header extends BaseComponent {
  readonly cartLink: Locator;
  readonly cartBadge: Locator;
  readonly menuButton: Locator;
  readonly logoutLink: Locator;

  constructor(page: Page) {
    super(page, page.locator('.primary_header'));
    this.cartLink = this.page.locator('.shopping_cart_link');
    this.cartBadge = this.page.locator('.shopping_cart_badge');
    this.menuButton = this.page.getByRole('button', { name: 'Open Menu' });
    this.logoutLink = this.page.getByRole('link', { name: 'Logout' });
  }

  /** Cart item count from the badge (0 when the badge is absent). */
  async cartCount(): Promise<number> {
    if ((await this.cartBadge.count()) === 0) return 0;
    return Number((await this.cartBadge.textContent())?.trim() ?? '0');
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }

  async logout(): Promise<void> {
    await this.menuButton.click();
    await this.logoutLink.click();
  }
}
