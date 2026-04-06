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

/**
 * Query parameters for the admin-only `list-feedback` edge function.
 *
 * - `page`: 1-indexed page number, defaults to 1
 * - `pageSize`: rows per page, defaults to 20, hard maximum of 100
 */
export const ListFeedbackParams = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});
export type ListFeedbackParams = z.infer<typeof ListFeedbackParams>;
