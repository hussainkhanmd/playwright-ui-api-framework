import { z } from 'zod';

/**
 * Response contract for the `posts` resource. The DTO type is derived from the
 * schema (`z.infer`) so there is exactly one source of truth.
 */
export const postSchema = z.object({
  id: z.number().int().positive(),
  userId: z.number().int().positive(),
  title: z.string().min(1),
  body: z.string(),
});

export const postListSchema = z.array(postSchema);

/** Body accepted when creating a post. */
export const createPostInputSchema = postSchema.omit({ id: true });

export type Post = z.infer<typeof postSchema>;
export type CreatePostInput = z.infer<typeof createPostInputSchema>;
