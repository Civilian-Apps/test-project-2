---
name: implement-issue
description: End-to-end implementation from a GitHub issue using TDD. Covers features, sub-features, and bug fixes. Use when you have an issue number and repo ready to build.
sources:
  - repo: mattpocock/skills
    skill: prd-to-issues
    relationship: inspired
last_reviewed: 2026-04-05
---

# implement-issue

Orchestrates the full analyse → plan → test → build → validate → ship loop for a single GitHub issue.

## Inputs

- **Repo name** (e.g. `test-project`)
- **Issue number** (e.g. `#3`)

## Process

### 1. Analyse

```bash
gh issue view <number> -R civilian-apps/{repo} --comments
```

Read the issue body. Identify:

- Type: feature, sub-feature, or bug fix
- Acceptance criteria
- Referenced spec file (e.g. `specs/{feature}.md`)
- Blocked-by dependencies (are they closed?)
- Complexity and type (AFK/HITL)

Enter the project and read context:

- `CLAUDE.md`, `DESIGN.md`, `specs/{feature}.md` (if referenced)
- `.claude/rules/app-spec.md`, `CHANGELOG.md`
- Relevant existing code and tests

### 2. Plan

- Identify which layers this issue touches (data model, API, UI, tests)
- Determine which domain skills are needed (supabase-data, nextjs-design, stripe, mcp-server)
- If the issue involves a complex module interface, use `build-interface` first
- Map acceptance criteria to test cases

### 3. Create test (RED)

Write failing tests from acceptance criteria:

- Each criterion becomes at least one test
- Co-locate: `foo.test.ts` next to `foo.ts`
- Test behaviour through public interfaces, not implementation
- Mock external services (Supabase, Stripe), not internal modules

```bash
npm test  # confirm tests fail
```

### 4. Build (GREEN)

Write minimum code to make tests pass. Use domain skills:

- Database → invoke supabase-data patterns
- UI → invoke nextjs-design patterns
- Payments → invoke stripe patterns
- MCP → invoke mcp-server patterns

Run tests after each implementation step:

```bash
npm test
```

### 5. Validate (REFACTOR)

Full verification:

```bash
npm test          # all tests, not just new ones
npx tsc --noEmit  # type check
npm run lint      # lint
```

Look for refactor candidates — extract, simplify, align with conventions. Only refactor when GREEN.

Update `CHANGELOG.md` and `.claude/rules/app-spec.md` if entities, routes, or API endpoints changed.

### 6. Ship

```bash
git add {specific files}
git commit -m "feat: {description} (#{issue_number})"
gh pr create --title "feat: {description} (#{issue_number})" --body "Closes #{issue_number}"
```

### Bugs found during implementation

If you discover a bug unrelated to the current issue:

- Do NOT fix it in this branch
- File a GitHub issue following the `issue-writing` rule
- Reference it in the PR body as a known issue
- Continue with the current implementation
