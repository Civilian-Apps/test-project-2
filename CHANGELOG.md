# Changelog

All notable changes to this project will be documented in this file.

## [2026-04-06] — #6 list-feedback admin edge function

- Added: `supabase/functions/list-feedback/index.ts` Deno edge function entry that builds user-scoped + service-role Supabase clients and delegates to a pure handler.
- Added: `src/entities/feedback/list-feedback.ts` — testable `handleListFeedback(request, deps)` handler plus `listFeedbackTool` MCP description (name, description, parameter descriptions).
- Added: `ListFeedbackParams` Zod schema in `src/entities/feedback/types.ts` — coerces `page` / `pageSize` query params, defaults to 1 / 20, enforces `pageSize <= 100`.
- Added: Admin role check via `user.app_metadata.role === 'admin'` JWT claim; non-admins get `403 { error: { error_code: 'FORBIDDEN' } }`. Successful responses return `200 { data, page, pageSize, total }` ordered `created_at desc` and exclude soft-deleted rows.
- Added: `src/entities/feedback/list-feedback.test.ts` covering admin happy path with default and custom pagination offsets, empty result, non-admin 403, unauthenticated 401, `pageSize > 100` validation rejection, and non-GET 405.
- Changed: `src/entities/feedback/definition.md` documents the admin role decision (JWT claim over `user_roles` table) and the service-role usage exception.
- Changed: `tsconfig.json` and `jest.config.ts` exclude `supabase/functions/` (Deno runtime, not typechecked or unit-tested by Jest).
- Files: `supabase/functions/list-feedback/index.ts`, `src/entities/feedback/list-feedback.ts`, `src/entities/feedback/list-feedback.test.ts`, `src/entities/feedback/types.ts`, `src/entities/feedback/definition.md`, `tsconfig.json`, `jest.config.ts`
## [2026-04-06] — #5 create-feedback edge function (REST + MCP)

- Added: `supabase/functions/create-feedback/handler.ts` — pure handler validating `FeedbackInput` (shared Zod schema), extracting identity from the `Authorization: Bearer <jwt>` header, supporting `Idempotency-Key` replay, and returning structured `{ id, created_at }` / `{ error: { error_code, message, fields? } }` responses (200/400/401/405/500).
- Added: Deno entrypoint `supabase/functions/create-feedback/index.ts` wiring a user-scoped Supabase client (RLS enforced) for the insert and a service-role client for idempotency lookups.
- Added: `createFeedbackTool` export with name, description, and parameter descriptions for MCP discoverability.
- Added: `idempotency_keys` table (migration `20260406010000_create_idempotency_keys.sql`) with RLS, scoping replays per `(user_id, key, resource_type)`.
- Added: `supabase/functions/create-feedback/index.test.ts` covering success, Zod rejection, invalid-JSON rejection, unauth rejection, method-not-allowed, idempotency replay, idempotency pass-through to insert, insert failure, and tool descriptor shape.
- Changed: `tsconfig.json` excludes `supabase/functions/**/index.ts` from `tsc --noEmit` since those files target the Deno runtime.
- Files: `supabase/functions/create-feedback/handler.ts`, `supabase/functions/create-feedback/index.ts`, `supabase/functions/create-feedback/index.test.ts`, `supabase/migrations/20260406010000_create_idempotency_keys.sql`, `tsconfig.json`

## [2026-04-06] — #4 Feedback queries and server actions

- Added: `createFeedback` server action with auth check, Zod `safeParse`, and structured `{ data, error }` returns (UNAUTHENTICATED / VALIDATION_ERROR / INSERT_FAILED).
- Added: `listUserFeedback({ page, pageSize })` query — paginated, ordered by `created_at desc`, runs as authenticated user so RLS scopes the rows.
- Added: Tests covering action success/unauth/validation/insert-failure paths and query pagination offsets (page=1 → range 0..9, page=3 pageSize=5 → range 10..14).
- Files: `src/entities/feedback/actions.ts`, `src/entities/feedback/queries.ts`, `src/entities/feedback/feedback.test.ts`

## [2026-04-06] — #3 Feedback entity

- Added: `feedback` table migration with soft-delete, FK to `auth.users`, and length check constraints on `subject` (1-120) and `body` (1-2000).
- Added: RLS enabled on `feedback` with INSERT/SELECT policies scoping access to `auth.uid() = user_id`.
- Added: `src/entities/feedback/` with `definition.md`, Zod `FeedbackInput` / `Feedback` schemas, and tests.
- Changed: `src/libs/supabase/types.ts` updated to include the generated `feedback` table types.
- Files: `supabase/migrations/20260406000000_create_feedback.sql`, `src/entities/feedback/definition.md`, `src/entities/feedback/types.ts`, `src/entities/feedback/feedback.test.ts`, `src/libs/supabase/types.ts`

## [2026-04-06] — #1 Terms of Service page

- Added: `/terms` route as a Server Component with placeholder content noting UK jurisdiction.
- Added: "Terms" link in the footer Company section, immediately after "Privacy".
- Added: Test verifying the page renders the expected heading.
- Changed: `jest.config.ts` now transforms TSX with `react-jsx` so component tests can render JSX.
- Files: `src/app/terms/page.tsx`, `src/app/terms/page.test.tsx`, `src/app/layout.tsx`, `jest.config.ts`
