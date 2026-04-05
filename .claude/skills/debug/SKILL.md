---
name: debug
description: Systematically diagnose bugs and produce a TDD fix plan. Use when something is broken and the cause is unclear, or when a bug needs root cause analysis before fixing.
sources:
  - repo: mattpocock/skills
    skill: triage-issue
    relationship: inspired
last_reviewed: 2026-04-05
---

# debug

Systematic bug diagnosis → root cause → TDD fix plan.

## Process

### 1. Capture

Get the problem description. Ask ONE clarifying question max: "What's the problem you're seeing?"

### 2. Investigate

Explore the codebase deeply:

- **Where** does the bug manifest? (entry point, UI, API response, test failure)
- **What** code path is involved? (trace the flow from input to symptom)
- **Why** does it fail? (root cause, not symptom)
- **What** related code exists? (similar patterns, adjacent tests, shared modules)

Check recent changes:

```bash
git log --oneline -20
git diff main
```

### 3. Classify

- **Data issue** — wrong shape, missing field, null where not expected
- **Logic issue** — wrong condition, off-by-one, incorrect state transition
- **Integration issue** — API contract changed, env var missing, service down
- **Type issue** — runtime doesn't match compile-time types
- **Regression** — something that previously worked, broken by recent change
- **Design flaw** — the code does what it was written to do, but the design is wrong

### 4. TDD fix plan

Design an ordered list of RED-GREEN cycles:

1. **RED:** Write a test that captures the broken behaviour (test should fail now, proving the bug)
2. **GREEN:** Describe the minimal code change to make the test pass
3. Repeat for each aspect of the fix
4. Final **REFACTOR** step if the fix reveals structural issues

Tests must verify through public interfaces — they should survive future refactors.

### 5. Execute or file

- **If in scope** of current work: execute the fix using the TDD plan
- **If out of scope**: file a GitHub issue with the root cause analysis and TDD fix plan, following the `issue-writing` rule

### 6. Verify

```bash
npm test && npx tsc --noEmit && npm run lint
```
