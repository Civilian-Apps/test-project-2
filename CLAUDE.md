# {PROJECT_NAME}

## Stack

- Next.js 15+ (App Router) + TypeScript + Tailwind + shadcn/ui
- Supabase (Postgres + Auth + Storage + Edge Functions)
- Stripe (Checkout + Customer Portal + webhooks)
- React Email + Resend
- Cloudflare Pages (deploys on merge to `main`)

## File Organisation

- Entities: `src/entities/{name}/` with types.ts, actions.ts, queries.ts, rules.md, tools.ts
- Components: `src/components/` (shared), co-located with features when specific
- Features: `src/features/` for feature-scoped UI
- Server actions in entity directories, not in route handlers

## Data Layer

- RLS on every table. No exceptions.
- Timestamps: `created_at`, `updated_at` on every table
- Soft deletes where appropriate
- Zod validation at system boundaries (user input, API)
- Generate types: `npm run gen:types` after schema changes

## Server Actions

- Structured error returns, never throw to client
- Auth check at the top of every action
- Each action is independent (no chaining)

## Components

- Server components by default
- `"use client"` only when needed (interactivity, hooks)
- URL state (searchParams) over React state for shareable views
- No prop drilling beyond 2 levels — use context or composition

## Performance

- Paginate all lists
- Optimistic updates for writes
- ISR for public pages

## Agent Rules

- Read `rules/app-spec.md` before any structural changes
- Read `rules/implementation-plan.md` before starting new features
- Update CHANGELOG.md after every feature (see `rules/changelog-rule.md`)
- Conventional commits: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`

## Commands

```bash
npm test                 # run tests
npm run lint             # lint
npx tsc --noEmit         # type check
npm run gen:types        # regenerate Supabase types
npm run dev              # local dev server
```
