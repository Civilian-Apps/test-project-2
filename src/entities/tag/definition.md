# Tag

User-owned label for organising things in the app (root of the Project Tags
feature). A tag has a short name and a hex display colour. Each tag belongs to
exactly one user.

## Business Rules

- Every tag row is owned by exactly one user (`user_id`).
- `name` is required, 1-40 characters.
- `color` is required and must match the 6-digit hex pattern `^#[0-9a-fA-F]{6}$`
  (e.g. `#aabbcc` or `#AABBCC`). Short-form (`#abc`) and named colours are not
  accepted.
- A user cannot have two tags with the same `name` at the same time. The
  uniqueness constraint is `(user_id, name) WHERE deleted_at IS NULL`, so a
  user can recreate a tag with the same name after soft-deleting the old one.
- Tags are **soft-deleted** via `deleted_at`. They are never hard-deleted.
- A user can only see, create, and update their own tags. RLS enforces this.

## Storage

- Table: `public.tag` (see `supabase/migrations/20260406020000_create_tag.sql`)
- RLS: enabled. SELECT / INSERT / UPDATE policies all scoped to
  `auth.uid() = user_id`. There is intentionally no DELETE policy — deletes are
  performed as soft deletes via UPDATE of `deleted_at`.

## References

- Generated DB types: `src/libs/supabase/types.ts` (`Database['public']['Tables']['tag']`)
- Schemas: `./types.ts`
