import { readFileSync } from 'node:fs';
import path from 'node:path';
import { parse as parseCsvSync } from 'csv-parse/sync';
import { config } from '../config/config.js';

/**
 * Helpers for data-driven tests. Paths are resolved relative to the repo root
 * so specs can reference `data/datadriven/<file>` regardless of their own depth.
 */

export function loadJsonCases<T>(relativePath: string): T[] {
  const abs = path.join(config.rootDir, relativePath);
  return JSON.parse(readFileSync(abs, 'utf8')) as T[];
}

export function loadCsvCases<T extends Record<string, string>>(relativePath: string): T[] {
  const abs = path.join(config.rootDir, relativePath);
  const rows: T[] = parseCsvSync(readFileSync(abs, 'utf8'), {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });
  return rows;
}
