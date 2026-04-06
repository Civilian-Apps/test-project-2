# Tag

User-owned labels that can be attached to other entities (e.g. projects).
This entity is the root of the Project Tags feature; link tables come later.

## Business Rules

- Every tag row is owned by exactly one user (`user_id`).
- `name` is required, 1-40 characters.
- `color` is required and must be a 6-digit hex color string with a leading
  `#` (e.g. `#aabbcc`). Both upper and lower case digits are allowed.
- `(user_id, name)` is unique among **non-deleted** rows. A user can re-use
  a tag name after soft-deleting the previous tag with that name.
- Tags are **soft-deleted** via `deleted_at`. They are never hard-deleted.
- A user can only see, create, and update their own tags. RLS enforces this.

## Storage

- Table: `public.tag` (see
  `supabase/migrations/20260406020000_create_tag.sql`)
- RLS: enabled. SELECT / INSERT / UPDATE policies all scoped to
  `auth.uid() = user_id`. No DELETE policy — deletes go through soft-delete
  via UPDATE.
- Index on `user_id` (partial, where `deleted_at is null`) to keep the
  per-user list query cheap.
- Unique index `(user_id, name) where deleted_at is null` enforces the
  no-duplicate-name-per-user rule.

## References

- Generated DB types: `src/libs/supabase/types.ts`
  (`Database['public']['Tables']['tag']`)
- Schemas: `./types.ts`
