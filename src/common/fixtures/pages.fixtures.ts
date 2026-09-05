import { test as base } from './auth.fixtures.js';
import { LoginPage } from '../../ui/pages/login.page.js';
import { InventoryPage } from '../../ui/pages/inventory.page.js';
import { CartPage } from '../../ui/pages/cart.page.js';
import { CheckoutPage } from '../../ui/pages/checkout.page.js';
import { FramesPage } from '../../ui/pages/the-internet/frames.page.js';
import { ShadowDomPage } from '../../ui/pages/the-internet/shadow-dom.page.js';
import { FileTransferPage } from '../../ui/pages/the-internet/file-transfer.page.js';
import { WindowsPage } from '../../ui/pages/the-internet/windows.page.js';

/**
 * Page Object dependency injection. Each page object is its own fixture, built
 * lazily from the test's `page` — a spec that never asks for `cartPage` never
 * constructs one. Specs get `{ loginPage }` instead of `new LoginPage(page)`.
 */
export interface PageObjects {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  theInternet: {
    frames: FramesPage;
    shadowDom: ShadowDomPage;
    fileTransfer: FileTransferPage;
    windows: WindowsPage;
  };
}

export const test = base.extend<PageObjects>({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  inventoryPage: async ({ page }, use) => use(new InventoryPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),
  theInternet: async ({ page }, use) =>
    use({
      frames: new FramesPage(page),
      shadowDom: new ShadowDomPage(page),
      fileTransfer: new FileTransferPage(page),
      windows: new WindowsPage(page),
    }),
});
