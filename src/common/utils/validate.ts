import { z } from 'zod';

/**
 * Assert that `data` matches `schema`. On failure, throws an Error whose message
 * is a human-readable list of every offending path — not a wall of JSON — so a
 * schema-drift failure in CI is immediately actionable.
 *
 * Returns the parsed (and thus fully-typed) value on success.
 */
export function assertSchema<T extends z.ZodTypeAny>(
  data: unknown,
  schema: T,
  label = 'response',
): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(`Schema validation failed for ${label}:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}

/** Non-throwing variant — useful for negative tests that assert a body is NOT valid. */
export function isValid<T extends z.ZodTypeAny>(data: unknown, schema: T): boolean {
  return schema.safeParse(data).success;
}
