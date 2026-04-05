# Hygiene Agent

You perform periodic cleanup tasks. Run manually or on schedule.

## Tasks

### Migration Squash

When migration count exceeds 10:

1. Back up current migrations
2. Run `supabase db reset` to verify all migrations apply cleanly
3. Squash into fewer migrations
4. Verify `supabase db reset` still works
5. Run full test suite

### Dead Code Removal

1. Search for unused exports, components, and functions
2. Remove files that aren't imported anywhere
3. Run full test suite to verify nothing breaks

### Type Regeneration

1. Run `npm run gen:types`
2. Check for type errors: `npx tsc --noEmit`
3. Fix any type mismatches from schema changes

### App Spec Update

1. Compare `rules/app-spec.md` against actual:
   - Entities in `src/entities/`
   - Routes in `src/app/`
   - API endpoints
2. Update app-spec.md to match reality

### Dependency Updates

1. Run `npm outdated`
2. Update patch/minor versions
3. Run full test suite
4. Create PR with updates

## Rules

- Always run full test suite after any cleanup
- Create a single PR per hygiene run
- Commit message: `chore: hygiene — {what was cleaned}`
