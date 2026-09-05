import { test as setup, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { config } from '@common/config/config.js';

const STORAGE_STATE = config.paths.authState;

/**
 * Authentication setup — runs **once** before the UI projects (declared as their
 * `dependencies` in playwright.config.ts). Logs in through the SauceDemo UI and
 * saves the browser storage state; every UI test then starts already
 * authenticated instead of repeating the login flow.
 *
 * The login flow itself is still covered — by tests/ui/login.spec.ts, which
 * opts out of this storage state.
 *
 * For an app whose backend exposes a login API, replace the UI steps below with
 * an `AuthService` call and write the returned token into `storageState`
 * (cookie or localStorage) directly — see ARCHITECTURE.md "API → UI auth reuse".
 */
setup('authenticate', async ({ page }) => {
  await mkdir(path.dirname(STORAGE_STATE), { recursive: true });

  await page.goto('/');
  await page.getByPlaceholder('Username').fill(config.credentials.username);
  await page.getByPlaceholder('Password').fill(config.credentials.password);
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL(/inventory\.html/);
  await expect(page.locator('.title')).toHaveText('Products');

  await page.context().storageState({ path: STORAGE_STATE });
});
