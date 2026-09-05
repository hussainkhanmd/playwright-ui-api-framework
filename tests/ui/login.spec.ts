import { test, expect } from '@common/fixtures/base.fixtures.js';
import { loadJsonCases } from '@common/utils/data-files.js';

/**
 * Covers the login flow itself, so this spec opts OUT of the shared storage
 * state that every other UI test relies on. Data-driven from an external file,
 * split into success / error cases so no test contains a branch.
 */
test.use({ storageState: { cookies: [], origins: [] } });

interface LoginCase {
  name: string;
  username: string;
  password: string;
  outcome: 'success' | 'error';
  error?: string;
}

const cases = loadJsonCases<LoginCase>('data/datadriven/login-cases.json');
const successCases = cases.filter((c) => c.outcome === 'success');
const errorCases = cases.filter((c) => c.outcome === 'error');

test.describe('SauceDemo login @ui @regression', () => {
  for (const c of successCases) {
    test(c.name, async ({ page }) => {
      await page.goto('/');
      await page.getByPlaceholder('Username').fill(c.username);
      await page.getByPlaceholder('Password').fill(c.password);
      await page.getByRole('button', { name: 'Login' }).click();

      await expect(page).toHaveURL(/inventory\.html/);
      await expect(page.locator('.title')).toHaveText('Products');
    });
  }

  for (const c of errorCases) {
    test(c.name, async ({ page }) => {
      await page.goto('/');
      await page.getByPlaceholder('Username').fill(c.username);
      await page.getByPlaceholder('Password').fill(c.password);
      await page.getByRole('button', { name: 'Login' }).click();

      await expect(page.locator('[data-test="error"]')).toContainText(c.error ?? '');
      await expect(page).not.toHaveURL(/inventory\.html/);
    });
  }
});
