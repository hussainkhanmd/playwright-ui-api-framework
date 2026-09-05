import { test as base } from '@playwright/test';
import { Writable } from 'node:stream';
import type { Logger } from 'pino';
import { createTestLogger } from '../logger/logger.js';

/**
 * Per-test structured logger.
 *
 * - `logger` is a pino child bound to the test title; use it in page objects,
 *   services and specs instead of `console.log`.
 * - On failure the captured JSON lines are attached to the report so a red
 *   test carries its own debug trail.
 */
export interface LoggerFixtures {
  logger: Logger;
}

export const test = base.extend<LoggerFixtures>({
  logger: async ({}, use, testInfo) => {
    const buffer: string[] = [];
    const sink = new Writable({
      write(chunk: Buffer, _enc, cb) {
        buffer.push(chunk.toString('utf8').trimEnd());
        cb();
      },
    });

    const logger = createTestLogger(testInfo.title, sink);

    await use(logger);

    if (testInfo.status !== testInfo.expectedStatus && buffer.length > 0) {
      await testInfo.attach('test-log', {
        body: buffer.join('\n'),
        contentType: 'application/x-ndjson',
      });
    }
  },
});
