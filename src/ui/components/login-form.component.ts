import type { Locator, Page } from '@playwright/test';
import { BaseComponent } from './base.component.js';

/** The SauceDemo login form. */
export class LoginForm extends BaseComponent {
  readonly username: Locator;
  readonly password: Locator;
  readonly submitButton: Locator;
  readonly error: Locator;

  constructor(page: Page, root?: Locator) {
    super(page, root ?? page.locator('.login_wrapper'));
    this.username = this.page.getByPlaceholder('Username');
    this.password = this.page.getByPlaceholder('Password');
    this.submitButton = this.page.getByRole('button', { name: 'Login' });
    this.error = this.page.locator('[data-test="error"]');
  }

  async submit(username: string, password: string): Promise<void> {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.submitButton.click();
  }
}
