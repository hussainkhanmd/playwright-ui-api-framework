import { z } from 'zod';

/**
 * Auth contract. The local mock returns a static token row; this schema is the
 * shape the AuthService promises to the rest of the framework regardless of
 * backend.
 */
export const authTokenSchema = z.object({
  token: z.string().min(1),
  username: z.string().min(1),
});

export type AuthToken = z.infer<typeof authTokenSchema>;
