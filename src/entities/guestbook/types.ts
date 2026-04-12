import { z } from 'zod';

/**
 * Guestbook entity schemas.
 *
 * Business rules (see ./definition.md):
 * - message: 1-280 chars
 * - each row owned by exactly one user (user_id)
 * - soft delete only (deleted_at)
 */

export const GuestbookEntryInput = z.object({
  message: z.string().min(1).max(280),
});
export type GuestbookEntryInput = z.infer<typeof GuestbookEntryInput>;

export const GuestbookEntry = GuestbookEntryInput.extend({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  created_at: z.string(),
  updated_at: z.string(),
  deleted_at: z.string().nullable(),
});
export type GuestbookEntry = z.infer<typeof GuestbookEntry>;
