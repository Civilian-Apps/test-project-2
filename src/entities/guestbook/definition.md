# Guestbook

Foundation for a future public guestbook feature. A guestbook entry is a short
message that any authenticated user in the app can see, owned by exactly one
user.

## Business Rules

- Every guestbook entry is owned by exactly one user (`user_id`).
- `message` is required, 1-280 characters.
- Entries are **soft-deleted** via `deleted_at`. They are never hard-deleted.
- Any authenticated user can read non-soft-deleted entries — the guestbook is
  public within the app.
- Only the row owner (`auth.uid() = user_id`) can create, update, or
  soft-delete their own entries. RLS enforces this.
- Every row has `created_at` and `updated_at` timestamps, defaulted to `now()`
  per the data-layer convention.

## Storage

- Table: `public.guestbook` (see
  `supabase/migrations/20260412000000_create_guestbook.sql`).
- RLS: enabled.
  - SELECT: any authenticated user, where `deleted_at is null`.
  - INSERT / UPDATE: scoped to `auth.uid() = user_id`.
  - There is intentionally no DELETE policy — deletes are performed as soft
    deletes via UPDATE of `deleted_at`.

## References

- Generated DB types: `src/libs/supabase/types.ts`
  (`Database['public']['Tables']['guestbook']`)
- Schemas: `./types.ts`
