---
name: supabase-data
description: Create Supabase migrations, RLS policies, generated types, queries, and edge functions. Use for any database or Supabase infrastructure work.
sources:
  - repo: N/A
    skill: N/A
    relationship: original
last_reviewed: 2026-04-05
---

# supabase-data

Database and Supabase infrastructure implementation.

## Scope

- Create and modify migrations (`supabase migration new {name}`)
- Write RLS policies (mandatory on every table)
- Generate TypeScript types (`npm run gen:types`)
- Write entity queries in `src/entities/{name}/queries.ts`
- Write entity actions in `src/entities/{name}/actions.ts`
- Set up edge functions in `supabase/functions/`
- Configure storage buckets and policies

## Process

### 1. Read current schema

- Check `supabase/migrations/` for existing migrations
- Read `src/lib/supabase/types.ts` for current generated types
- Read `.claude/rules/app-spec.md` for entity map

### 2. Write migration

```bash
supabase migration new {descriptive-name}
```

Write SQL in the generated file. Always include:

- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`
- RLS enable + policies
- Appropriate indexes

### 3. Apply and generate types

```bash
npm run db:reset    # applies all migrations
npm run gen:types   # regenerates TypeScript types
```

### 4. Write entity layer

Create or update `src/entities/{name}/`:

- `types.ts` — Zod schemas + inferred types
- `queries.ts` — read operations (server-side)
- `actions.ts` — write operations (server actions with auth checks)

### 5. Test

Write tests for queries and actions. Mock Supabase client for unit tests.

### 6. Update app-spec

Add new entities, columns, or policies to `.claude/rules/app-spec.md`.
