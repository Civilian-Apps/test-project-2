---
name: testing-framework
description: Testing stack, TDD mechanics, test conventions, and agent quality hooks. Use when writing tests, setting up test infrastructure, or debugging test failures.
sources:
  - repo: mattpocock/skills
    skill: tdd
    relationship: rewrite
last_reviewed: 2026-04-06
---

# testing-framework

Testing stack, TDD discipline, and agent quality hooks for the engineer framework.

## Testing Stack

| Tool               | Purpose                                          |
| ------------------ | ------------------------------------------------ |
| Jest               | Unit and integration tests                       |
| Testing Library    | Component rendering and interaction              |
| Playwright         | E2E browser testing (see `webapp-testing` skill) |
| `npm test`         | Run all Jest tests                               |
| `npx tsc --noEmit` | Type check without emitting                      |
| `npm run lint`     | ESLint + Prettier checks                         |
| `npm run build`    | Full production build                            |

## TDD Discipline: RED-GREEN-REFACTOR

### RED — Write one failing test

- One test for one behaviour
- Test through public interfaces, not implementation details
- Run tests — confirm the new test fails, all others still pass

### GREEN — Minimal code to pass

- Write the simplest code that makes the failing test pass
- Do not optimise, do not clean up, do not add features
- Run tests — confirm all pass

### REFACTOR — Clean up while green

- Extract, rename, simplify — only when all tests pass
- Never refactor while RED
- Run tests after each refactoring step

Repeat. One test at a time, one vertical slice at a time. Never all tests first.

## Test Location

- **Co-locate tests**: `foo.test.ts` next to `foo.ts` in entity/link/feature directories
- **Global test setup**: `tests/` directory (shared fixtures, helpers, custom matchers)
- **E2E tests**: `tests/e2e/` with Playwright

```
src/entities/widget/
  actions.ts
  actions.test.ts      # co-located
  queries.ts
  queries.test.ts      # co-located
tests/
  setup.ts             # global Jest setup
  helpers.ts           # shared test utilities
  e2e/                 # Playwright E2E tests
```

## Test Coverage Requirements

- Every server action: happy path + auth check + validation error
- Every entity: CRUD operations + RLS verification
- Every feature: user-facing flow through public interfaces
- Group with `describe` blocks by behaviour, not by method
- One assertion per test conceptually — a test verifies one behaviour

## Mocking Strategy

| Dependency type       | Strategy                            |
| --------------------- | ----------------------------------- |
| In-process modules    | Never mock — test through real code |
| Supabase client       | Mock — substitute with test helpers |
| Stripe API            | Mock — use Stripe test fixtures     |
| External HTTP APIs    | Mock — deterministic responses      |
| File system, env vars | Mock — isolate from environment     |

## Interface-First Thinking

Before writing tests, define the interface:

- What are the inputs and outputs?
- What does the caller need to know?
- What can be hidden behind the interface?

If the test setup is as complex as the implementation, the interface is too shallow.

## Agent Quality Hooks

Two hooks enforce quality gates automatically — the agent cannot bypass these.

### stop-check.sh (runs before agent completes)

1. Runs `npm test` — **blocks** if any test fails
2. Runs `npx tsc --noEmit` — **blocks** if type errors exist

The agent cannot ship until both pass. If blocked, fix the issue and try again.

### post-edit-lint.sh (runs after every file edit)

- Auto-formats `.ts`, `.tsx`, `.js`, `.jsx` files with Prettier
- No manual formatting needed — happens automatically

## Validation Sequence

Run before considering work complete:

```bash
npm test              # all tests pass
npx tsc --noEmit      # no type errors
npm run lint          # no lint violations
npm run build         # build succeeds
```

The stop-hook enforces the first two automatically. Run lint and build manually as a final check before shipping.
