---
globs:
  - 'supabase/**'
  - 'src/**/queries.ts'
  - 'src/**/actions.ts'
---

# Data Layer

## Core Rules

- RLS is enabled on every table. No exceptions.
- Every table has `created_at` and `updated_at` timestamp columns.
- Use soft deletes (`deleted_at` timestamp) unless the entity's `definition.md` explicitly specifies hard deletes.
- Generate TypeScript types after every schema change: `npm run gen:types`.
- Never use the Supabase service role in application code unless the function's `definition.md` documents the exception with justification.

## Query Performance (from Supabase postgres-best-practices)

### Indexes (CRITICAL)

- Add indexes for every column used in WHERE, JOIN, or ORDER BY clauses.
- Use partial indexes for filtered queries: `CREATE INDEX idx_active_users ON users(email) WHERE deleted_at IS NULL;`
- Use composite indexes matching query column order (leftmost prefix rule).
- Check for missing indexes: `SELECT * FROM pg_stat_user_tables WHERE seq_scan > idx_scan;`

### Query Patterns

- Use `SELECT` with specific columns, never `SELECT *` in production queries.
- Use `EXPLAIN ANALYZE` to verify query plans on any query touching >1000 rows.
- Prefer `EXISTS` over `COUNT(*)` for existence checks.
- Use `LIMIT` on every list query — paginate all lists.
- Avoid N+1 queries: use joins or batch fetches via `.in()`.
- Parallelize independent queries with `Promise.all()`.

### Connection Management (CRITICAL)

- Use Supabase connection pooler (port 6543) for serverless/edge functions.
- Use direct connection (port 5432) only for migrations and long-running admin tasks.
- Never create connections inside loops.

## RLS Patterns

- Write RLS policies using `auth.uid()`, never session variables.
- Test RLS by running queries as authenticated user, not service role.
- Every INSERT policy should match its SELECT policy scope.
- Use `security definer` functions sparingly and document in `definition.md`.

## Schema Design

- Use `uuid` for primary keys (Supabase default).
- Use `timestamptz` not `timestamp` for all time columns.
- Add `CHECK` constraints for enum-like columns instead of relying on application validation alone.
- Foreign keys include `ON DELETE` behavior (CASCADE, SET NULL, or RESTRICT) — never leave default.

## Migration Hygiene

- One concern per migration file.
- Migration names: `YYYYMMDDHHMMSS_{descriptive_name}.sql`
- Always include both up and down operations mentally (Supabase migrations are forward-only but test with `db reset`).
- Run `npm run db:reset && npm run gen:types` after writing migrations to verify.
