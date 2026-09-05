import type { FrameLocator, Locator, Page } from '@playwright/test';
import { BasePage } from '../base.page.js';

/**
 * the-internet iframe demos.
 *
 * `/iframe`        — a TinyMCE editor inside an <iframe>. (the-internet's editor
 *                    now loads read-only, so we demonstrate reading *across* the
 *                    frame boundary rather than typing.)
 * `/nested_frames` — a classic <frameset> tree (frame-top > left/middle/right, frame-bottom).
 */
export class FramesPage extends BasePage {
  protected readonly path = '/iframe';

  constructor(page: Page) {
    super(page);
  }

  // --- /iframe ---
  get editorFrame(): FrameLocator {
    return this.page.frameLocator('#mce_0_ifr');
  }

  get editorBody(): Locator {
    return this.editorFrame.locator('#tinymce');
  }

  async editorText(): Promise<string> {
    return (await this.editorBody.textContent())?.trim() ?? '';
  }

  /** Heading in the *parent* document (not inside the iframe). */
  async parentHeading(): Promise<string> {
    return (await this.page.locator('#content h3').textContent())?.trim() ?? '';
  }

  // --- /nested_frames ---
  async openNestedFrames(): Promise<void> {
    await this.page.goto('/nested_frames');
  }

  /** Text of one inner frame: 'left' | 'middle' | 'right' | 'bottom'. */
  async nestedFrameText(which: 'left' | 'middle' | 'right' | 'bottom'): Promise<string> {
    const frame =
      which === 'bottom'
        ? this.page.frameLocator('frame[name="frame-bottom"]')
        : this.page
            .frameLocator('frame[name="frame-top"]')
            .frameLocator(`frame[name="frame-${which}"]`);
    return (await frame.locator('body').textContent())?.trim() ?? '';
  }
}
