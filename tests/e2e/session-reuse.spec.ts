import { test, expect } from '@common/fixtures/base.fixtures.js';

/**
 * Proves the "log in once" optimisation: this test never touches the login
 * form. It navigates straight to a protected page and is already authenticated
 * because the UI projects load the storage state produced by tests/auth.setup.ts.
 */
test.describe('authenticated session reuse @e2e @ui', () => {
  test('lands on the inventory page without logging in', async ({ page }) => {
    await page.goto('/inventory.html');

    await expect(page).toHaveURL(/inventory\.html/);
    await expect(page.locator('.title')).toHaveText('Products');
    await expect(page.locator('.inventory_item')).not.toHaveCount(0);
  });

  test('the session cookie is present in context', async ({ page }) => {
    await page.goto('/inventory.html');
    const cookies = await page.context().cookies();
    expect(cookies.find((c) => c.name === 'session-username')?.value).toBe('standard_user');
  });
});
