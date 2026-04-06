import { z } from 'zod';

/**
 * Feedback entity schemas.
 *
 * Business rules (see ./definition.md):
 * - subject: 1-120 chars
 * - body: 1-2000 chars
 * - soft delete only (deleted_at)
 */

export const FeedbackInput = z.object({
  subject: z.string().min(1).max(120),
  body: z.string().min(1).max(2000),
});
export type FeedbackInput = z.infer<typeof FeedbackInput>;

export const Feedback = FeedbackInput.extend({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  created_at: z.string(),
  updated_at: z.string(),
  deleted_at: z.string().nullable(),
});
export type Feedback = z.infer<typeof Feedback>;
