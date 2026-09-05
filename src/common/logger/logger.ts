import pino, { type Logger, type DestinationStream } from 'pino';
import PinoPretty from 'pino-pretty';
import { config } from '../config/config.js';

/**
 * Structured logging.
 *
 * - Local dev: pretty-printed, colourised.
 * - CI: line-delimited JSON for log aggregators.
 *
 * `createTestLogger` optionally tees every record into a second stream. Fixtures
 * use that to buffer a test's log lines and attach them to the report when the
 * test fails — a red test then carries its own debug trail.
 */

const level = config.env.LOG_LEVEL;

function baseStream(): DestinationStream {
  if (config.isCI) return pino.destination(1); // stdout, JSON
  return PinoPretty({
    colorize: true,
    translateTime: 'HH:MM:ss.l',
    ignore: 'pid,hostname',
  });
}

export const rootLogger: Logger = pino({ level }, baseStream());

export function createTestLogger(testTitle: string, extraStream?: DestinationStream): Logger {
  if (!extraStream) return rootLogger.child({ test: testTitle });

  const streams = pino.multistream([
    { level, stream: baseStream() },
    { level: 'trace', stream: extraStream },
  ]);
  return pino({ level: 'trace' }, streams).child({ test: testTitle });
}

export type { Logger };
