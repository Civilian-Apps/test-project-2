# Issue Writing

When filing GitHub issues — whether from QA, during implementation, or from triage — follow these conventions so issues remain useful after refactors and are implementable by agents.

## Principles

- **Describe behaviours, not code.** "User sees a 500 error when submitting the form" not "createWidget throws in actions.ts".
- **No file paths or line numbers.** They go stale. Describe the area by feature and entity.
- **Use domain language.** Use terms from `UBIQUITOUS_LANGUAGE.md` if it exists.
- **Reproduction steps are mandatory** for bugs. Numbered steps, expected vs actual.
- **Keep it scannable.** 30 seconds to read. If it needs more detail, link to a spec file.

## Template

```markdown
## Problem

{What's wrong or what's needed — from the user's perspective}

## Reproduction (bugs only)

1. {step}
2. {step}
3. Expected: {X}. Actual: {Y}.

## Acceptance criteria

- [ ] {Testable criterion — a test could verify this}
- [ ] {Another criterion}

## Context

{Link to spec, PRD, or related issues. Root cause hypothesis if known.}
```

## Labels

- `bug` — something is broken
- `feature` — new capability
- `blocked` — depends on another issue (reference it)
