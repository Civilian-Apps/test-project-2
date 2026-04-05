---
name: refactor
description: Restructure code while keeping tests green. Use for cleanup, extraction, or pattern alignment.
sources:
  - repo: N/A
    skill: N/A
    relationship: original
last_reviewed: 2026-04-05
---

# refactor

Code restructuring with test safety.

## Process

### 1. Ensure test coverage

Verify tests exist for the code being refactored. Write tests first if missing.

### 2. Small steps

- Each step keeps tests green
- Run `npm test` after each change
- Commit working intermediate states

### 3. Common refactors

- **Extract entity** — move domain logic into `src/entities/{name}/`
- **Extract component** — split large components (>200 lines)
- **Align conventions** — match project CLAUDE.md patterns
- **Fix boundaries** — add missing Zod validation at trust boundaries
- **Remove dead code** — delete unused exports, unreachable branches

### 4. Verify

```bash
npm test && npx tsc --noEmit && npm run lint
```

No behaviour changes. Tests pass identically before and after.
