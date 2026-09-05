import type { Page } from '@playwright/test';
import { BasePage } from '../base.page.js';

/** the-internet `/upload` and `/download`. */
export class FileTransferPage extends BasePage {
  protected readonly path = '/upload';

  constructor(page: Page) {
    super(page);
  }

  async uploadFile(filePath: string): Promise<void> {
    await this.page.locator('#file-upload').setInputFiles(filePath);
    await this.page.locator('#file-submit').click();
  }

  async uploadedFileName(): Promise<string> {
    return (await this.page.locator('#uploaded-files').textContent())?.trim() ?? '';
  }

  async openDownloads(): Promise<void> {
    await this.page.goto('/download');
  }

  /**
   * Trigger a download by link text and return the suggested filename plus the
   * saved path (Playwright stores it in a temp location).
   */
  async download(linkText: string): Promise<{ suggestedFilename: string; path: string }> {
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.page.getByRole('link', { name: linkText, exact: true }).click(),
    ]);
    return { suggestedFilename: download.suggestedFilename(), path: (await download.path()) ?? '' };
  }

  async firstDownloadLinkText(): Promise<string> {
    return (await this.page.locator('.example a').first().textContent())?.trim() ?? '';
  }
}
