# Changelog

All notable changes to this project will be documented in this file.

## [2026-04-11] — #52 tag picker component for account page

- Added: `src/features/tags/TagPicker.tsx` — new client component that renders the user's tags as removable chips and provides a "+ Add tag" button that opens an inline `react-hook-form` + `zodResolver` form reusing `TagInput`. Submit calls the `createTag` server action, chip remove calls `softDeleteTag`. Tags are received as a prop — the picker does not fetch its own data.
- Added: `src/features/tags/TagPicker.test.tsx` — tests cover rendering chips, opening the add form, successful submission (mocked action), Zod-invalid submission (no action call), and chip removal (mocked action).
- Changed: `src/app/(account)/account/page.tsx` — server-side `listUserTags()` result is passed into a new `TagPicker` rendered in a "Your Tags" card below the existing "Your Plan" card.
- Files: `src/features/tags/TagPicker.tsx`, `src/features/tags/TagPicker.test.tsx`, `src/app/(account)/account/page.tsx`, `CHANGELOG.md`

## [2026-04-11] — #50 tag entity updated_at column

- Added: `supabase/migrations/20260411120000_add_updated_at_to_tag.sql` — adds `updated_at timestamptz not null default now()` to `public.tag` and backfills existing rows to `created_at`, bringing the schema in line with the canonical definition in issue #50 (the original #32 create-tag migration omitted the column).
- Changed: `src/entities/tag/types.ts` — `Tag` Zod schema now requires `updated_at` alongside `created_at`.
- Changed: `src/libs/supabase/types.ts` — regenerated `tag` table Row/Insert/Update types to include `updated_at`.
- Changed: `src/entities/tag/queries.ts` — `listUserTags` selects `updated_at` so the shape matches the `Tag` schema.
- Changed: `src/entities/tag/definition.md` — documents the `updated_at` timestamp and references the new migration.
- Added: `src/entities/tag/tag.test.ts` — new assertion that `Tag` rejects rows missing `updated_at`; existing fixtures updated to include the column.
- Files: `supabase/migrations/20260411120000_add_updated_at_to_tag.sql`, `src/entities/tag/types.ts`, `src/entities/tag/queries.ts`, `src/entities/tag/definition.md`, `src/entities/tag/tag.test.ts`, `src/libs/supabase/types.ts`

## [2026-04-06] — #39 tag server actions (create, list, soft-delete)

- Added: `src/entities/tag/actions.ts` — `createTag(input)` and `softDeleteTag(id)` server actions. Both run an `auth.getUser()` check first, validate input via `TagInput.safeParse` / a uuid `safeParse`, and return `{ data, error }` shapes (`UNAUTHENTICATED`, `VALIDATION_ERROR`, `INSERT_FAILED`, `UPDATE_FAILED`) — never throwing to the client. `softDeleteTag` scopes the update by both `id` and `user_id` and stamps `deleted_at` with the current ISO timestamp.
- Added: `src/entities/tag/queries.ts` — `listUserTags({ page, pageSize })` returning the current user's non-soft-deleted tags ordered by `created_at desc`, with default `page=1, pageSize=50` pagination via `range`. Returns the same `{ data, error }` shape with an `UNAUTHENTICATED` path.
- Added: tests in `src/entities/tag/tag.test.ts` covering createTag success, unauth, Zod rejection (empty name and bad colour), and insert failure; softDeleteTag success, unauth, invalid uuid, and update failure; listUserTags default ordering/pagination, page=3 offset, and unauth path.
- Files: `src/entities/tag/actions.ts`, `src/entities/tag/queries.ts`, `src/entities/tag/tag.test.ts`, `CHANGELOG.md`

## [2026-04-06] — #32 tag entity (table, types, RLS)

- Added: `supabase/migrations/20260406020000_create_tag.sql` — `public.tag` table (`id`, `user_id`, `name`, `color`, `created_at`, `deleted_at`) with `CHECK` constraints on name length (1..40) and 6-digit hex color, partial unique index on `(user_id, name) WHERE deleted_at IS NULL`, RLS enabled, and SELECT/INSERT/UPDATE policies scoped to `auth.uid() = user_id`.
- Added: `src/entities/tag/types.ts` — `TagInput` and `Tag` Zod schemas plus inferred TypeScript types (single source of truth).
- Added: `src/entities/tag/definition.md` — canonical business rules for the tag entity (ownership, name/color constraints, soft delete, RLS scope, no DELETE policy).
- Added: `src/entities/tag/tag.test.ts` — schema tests covering empty name, oversize name, invalid hex colours, valid uppercase hex, full row parsing, and a compile-time check that `Tag` aligns with the generated `Database['public']['Tables']['tag']['Row']` type.
- Changed: `src/libs/supabase/types.ts` — regenerated to include the new `tag` table Row/Insert/Update definitions and the `tag_user_id_fkey` relationship.
- Files: `supabase/migrations/20260406020000_create_tag.sql`, `src/entities/tag/types.ts`, `src/entities/tag/definition.md`, `src/entities/tag/tag.test.ts`, `src/libs/supabase/types.ts`

## [2026-04-06] — #7 feedback submission form

- Added: `src/features/feedback/FeedbackForm.tsx` — client component dialog form (`react-hook-form` + `zodResolver`, reusing `FeedbackInput`) that POSTs to the `create-feedback` edge function with the user's JWT and shows success / error toasts.
- Added: `src/features/feedback/FeedbackForm.test.tsx` covering dialog open, empty-submit validation, successful submission, and 400 server-error toast (mocking `fetch` and the Supabase browser client).
- Added: shadcn `Dialog`, `Textarea`, and `Label` primitives in `src/components/ui/` to support the form.
- Added: `src/libs/supabase/supabase-browser-client.ts` — `createBrowserClient`-based helper used by client components to obtain the current session JWT.
- Changed: `src/app/layout.tsx` footer "Support" column now includes a "Send feedback" entry that mounts `FeedbackForm`.
- Changed: `package.json` adds `react-hook-form` and `@hookform/resolvers` dependencies.
- Files: `src/features/feedback/FeedbackForm.tsx`, `src/features/feedback/FeedbackForm.test.tsx`, `src/components/ui/dialog.tsx`, `src/components/ui/textarea.tsx`, `src/components/ui/label.tsx`, `src/libs/supabase/supabase-browser-client.ts`, `src/app/layout.tsx`, `package.json`

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
