import { z } from 'zod';

/**
 * Response contract for the `users` resource. Kept loose enough to validate
 * both the local json-server seed and the live JSONPlaceholder shape
 * (JSONPlaceholder nests address/company; we only assert the fields we rely on).
 */
export const userSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  username: z.string().min(1),
  email: z.email(),
  phone: z.string().optional(),
  website: z.string().optional(),
});

export const userListSchema = z.array(userSchema);

export const createUserInputSchema = userSchema.omit({ id: true });

export type User = z.infer<typeof userSchema>;
export type CreateUserInput = z.infer<typeof createUserInputSchema>;
