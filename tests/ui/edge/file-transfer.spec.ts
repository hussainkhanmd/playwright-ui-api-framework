import { test, expect } from '@common/fixtures/base.fixtures.js';
import { config } from '@common/config/config.js';
import path from 'node:path';
import { readFile } from 'node:fs/promises';

test.use({
  baseURL: config.urls.theInternet,
  storageState: { cookies: [], origins: [] },
});

const UPLOAD_FIXTURE = path.join(config.rootDir, 'data/static/files/sample-upload.txt');

test.describe('file upload / download @ui @regression', () => {
  test('uploads a file via setInputFiles', async ({ theInternet }) => {
    await theInternet.fileTransfer.open();
    await theInternet.fileTransfer.uploadFile(UPLOAD_FIXTURE);
    expect(await theInternet.fileTransfer.uploadedFileName()).toBe('sample-upload.txt');
  });

  test('downloads a file and inspects its contents', async ({ theInternet }) => {
    await theInternet.fileTransfer.openDownloads();
    const linkText = await theInternet.fileTransfer.firstDownloadLinkText();

    const { suggestedFilename, path: savedPath } =
      await theInternet.fileTransfer.download(linkText);
    expect(suggestedFilename).toBe(linkText);
    expect(savedPath).not.toBe('');

    const bytes = await readFile(savedPath);
    expect(bytes.byteLength).toBeGreaterThan(0);
  });
});
