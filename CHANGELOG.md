# Changelog

All notable changes to this project will be documented in this file.

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
