import type { Page } from '@playwright/test';
import { BasePage } from './base.page.js';
import { LoginForm } from '../components/login-form.component.js';

export class LoginPage extends BasePage {
  protected readonly path = '/';
  readonly form: LoginForm;

  constructor(page: Page) {
    super(page);
    this.form = new LoginForm(page);
  }

  async login(username: string, password: string): Promise<void> {
    await this.open();
    await this.form.submit(username, password);
  }
}
