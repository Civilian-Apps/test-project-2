# Feedback

User-submitted feedback messages sent to the team from inside the app.

## Business Rules

- Every feedback row is owned by exactly one user (`user_id`).
- `subject` is required, 1-120 characters.
- `body` is required, 1-2000 characters.
- Feedback is **soft-deleted** via `deleted_at`. It is never hard-deleted.
- A user can only see and create their own feedback. RLS enforces this.

## Storage

- Table: `public.feedback` (see `supabase/migrations/20260406000000_create_feedback.sql`)
- RLS: enabled. INSERT and SELECT policies both scoped to `auth.uid() = user_id`.

## References

- Generated DB types: `src/libs/supabase/types.ts` (`Database['public']['Tables']['feedback']`)
- Schemas: `./types.ts`
