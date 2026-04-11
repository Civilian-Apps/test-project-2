import { z } from 'zod';

/**
 * Tag entity schemas.
 *
 * Business rules (see ./definition.md):
 * - name: 1-40 chars, unique per user (among non-soft-deleted rows)
 * - color: 6-digit hex, e.g. #aabbcc or #AABBCC
 * - soft delete only (deleted_at)
 */

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export const TagInput = z.object({
  name: z.string().min(1).max(40),
  color: z.string().regex(HEX_COLOR, 'color must be a 6-digit hex like #aabbcc'),
});
export type TagInput = z.infer<typeof TagInput>;

export const Tag = TagInput.extend({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  created_at: z.string(),
  updated_at: z.string(),
  deleted_at: z.string().nullable(),
});
export type Tag = z.infer<typeof Tag>;
