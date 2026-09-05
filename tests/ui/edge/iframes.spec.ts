import { test, expect } from '@common/fixtures/base.fixtures.js';
import { config } from '@common/config/config.js';

/**
 * iframe / frameset handling against the-internet. Runs on a different base URL
 * and without the SauceDemo storage state.
 */
test.use({
  baseURL: config.urls.theInternet,
  storageState: { cookies: [], origins: [] },
});

test.describe('iframes @ui @regression', () => {
  test('reads content across the iframe boundary', async ({ theInternet }) => {
    await theInternet.frames.open();

    // content inside the iframe — reached via frameLocator
    expect(await theInternet.frames.editorText()).toContain('Your content goes here');
    // heading in the parent document
    expect(await theInternet.frames.parentHeading()).toContain('TinyMCE');
  });

  test('reads text from a nested frameset', async ({ theInternet }) => {
    await theInternet.frames.openNestedFrames();
    expect(await theInternet.frames.nestedFrameText('middle')).toBe('MIDDLE');
    expect(await theInternet.frames.nestedFrameText('left')).toBe('LEFT');
    expect(await theInternet.frames.nestedFrameText('bottom')).toBe('BOTTOM');
  });
});
