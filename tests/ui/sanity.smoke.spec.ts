import { test, expect } from '@common/fixtures/base.fixtures.js';

/**
 * Framework sanity check (M1). Confirms config, fixtures, logging and the
 * browser projects are wired together. Real UI coverage lands in M4.
 */
test.describe('framework sanity @smoke @ui', () => {
  test('loads the SauceDemo login page', async ({ page, logger }) => {
    logger.info('navigating to UI base URL');
    await page.goto('/');
    await expect(page).toHaveTitle(/Swag Labs/);
    await expect(page.getByRole('textbox', { name: 'Username' })).toBeVisible();
  });
});
