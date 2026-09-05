import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page.js';

export interface CheckoutDetails {
  firstName: string;
  lastName: string;
  postalCode: string;
}

/**
 * SauceDemo checkout spans three URLs (step-one form, step-two overview,
 * complete). Modelled as one page object with methods per stage — the flow is
 * always linear.
 */
export class CheckoutPage extends BasePage {
  protected readonly path = '/checkout-step-one.html';

  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly postalCode: Locator;
  readonly continueButton: Locator;
  readonly finishButton: Locator;
  readonly summaryTotal: Locator;
  readonly completeHeader: Locator;
  readonly error: Locator;

  constructor(page: Page) {
    super(page);
    this.firstName = page.getByPlaceholder('First Name');
    this.lastName = page.getByPlaceholder('Last Name');
    this.postalCode = page.getByPlaceholder('Zip/Postal Code');
    this.continueButton = page.getByRole('button', { name: 'Continue' });
    this.finishButton = page.getByRole('button', { name: 'Finish' });
    this.summaryTotal = page.locator('.summary_total_label');
    this.completeHeader = page.locator('.complete-header');
    this.error = page.locator('[data-test="error"]');
  }

  async fillDetails(details: CheckoutDetails): Promise<void> {
    await this.firstName.fill(details.firstName);
    await this.lastName.fill(details.lastName);
    await this.postalCode.fill(details.postalCode);
    await this.continueButton.click();
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }
}
