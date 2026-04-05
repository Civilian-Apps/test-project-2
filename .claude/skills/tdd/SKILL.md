---
name: tdd
description: Test-driven development with RED-GREEN-REFACTOR loop. Use when building features, fixing bugs, or any implementation work. This is the core discipline, not an optional skill.
sources:
  - repo: mattpocock/skills
    skill: tdd
    relationship: rewrite
last_reviewed: 2026-04-05
---

# tdd

RED-GREEN-REFACTOR is the implementation method, not a testing strategy.

## The Loop

### RED — Write one failing test

- One test for one behaviour
- Test through public interfaces, not implementation details
- The test describes what the code should do, not how
- Run tests — confirm the new test fails, all others still pass

### GREEN — Minimal code to pass

- Write the simplest code that makes the failing test pass
- Do not optimise, do not clean up, do not add features
- Run tests — confirm all pass

### REFACTOR — Clean up while green

- Extract, rename, simplify — only when all tests pass
- Never refactor while RED
- Run tests after each refactoring step

### Repeat

Move to the next behaviour. One test at a time, one vertical slice at a time.

## Rules

- **Never write code without a failing test first.** If you can't write a test for it, you don't understand the requirement.
- **Never refactor while RED.** Get to GREEN first, then clean up.
- **No horizontal slicing.** Don't write all tests then all code. Write test1→code1, test2→code2.
- **Test behaviour, not implementation.** Tests should survive refactors. If renaming an internal function breaks tests, the tests are wrong.
- **One assertion per test** (conceptually). A test verifies one behaviour, even if that takes multiple assertions.

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

A deep module (small interface, large implementation) is easier to test and easier to use. If the test setup is as complex as the implementation, the interface is too shallow.

## Test File Conventions

- Co-locate: `foo.test.ts` next to `foo.ts`
- Group with `describe` blocks by behaviour, not by method
- Every server action: happy path + auth check + validation error
- Jest + Testing Library for components
