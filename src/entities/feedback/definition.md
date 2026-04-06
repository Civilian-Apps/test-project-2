# Feedback

User-submitted feedback messages sent to the team from inside the app.

## Business Rules

- Every feedback row is owned by exactly one user (`user_id`).
- `subject` is required, 1-120 characters.
- `body` is required, 1-2000 characters.
- Feedback is **soft-deleted** via `deleted_at`. It is never hard-deleted.
- A user can only see and create their own feedback. RLS enforces this.
- **Admins** (see "Admin role" below) can list every user's feedback via the
  `list-feedback` edge function.

## Storage

- Table: `public.feedback` (see `supabase/migrations/20260406000000_create_feedback.sql`)
- RLS: enabled. INSERT and SELECT policies both scoped to `auth.uid() = user_id`.

## Admin role

The admin-only `list-feedback` edge function identifies admins via a JWT
claim: `user.app_metadata.role === 'admin'`. This claim is set by the
Supabase admin/service role when granting a user the admin role (e.g.
`supabase.auth.admin.updateUserById(id, { app_metadata: { role: 'admin' } })`),
so callers cannot forge it — `app_metadata` is not user-editable.

A `user_roles` table was considered as an alternative, but chosen against
because:

- It would require an extra query on every admin action.
- It would require its own RLS policy and an admin bootstrap migration.
- A JWT claim keeps the data layer simple and the check stateless, which
  fits the "edge functions are stateless" rule in `rules/auth.md`.

## Service-role exception (`list-feedback`)

`data-layer.md` requires that database queries run as the authenticated
user. The `list-feedback` edge function is an explicit exception:

1. It first authenticates the caller with a user-scoped client and checks
   `app_metadata.role === 'admin'`.
2. Only after that check passes does it use a service-role client to read
   across every user's feedback (current RLS scopes SELECT to
   `auth.uid() = user_id`, which would hide other users' rows).

Non-admin callers never reach the service-role client. This is the only
code path in this entity that uses the service role.

## References

- Generated DB types: `src/libs/supabase/types.ts` (`Database['public']['Tables']['feedback']`)
- Schemas: `./types.ts`
- Handler (testable): `./list-feedback.ts`
- Edge function entry (Deno): `supabase/functions/list-feedback/index.ts`
