---
name: interactive-qa
description: Guided QA session where issues are explored conversationally and filed as durable GitHub issues. Use when a bug needs additional input to understand, when automated builds have failed twice on the same issue, or when the problem is not straightforward to reproduce.
sources:
  - repo: mattpocock/skills
    skill: qa
    relationship: inspired
last_reviewed: 2026-04-05
---

# interactive-qa

Interactive investigation and issue filing. Suggested when:

- A build agent has failed on an issue twice
- A bug report lacks reproduction steps
- The problem requires human observation to understand

## Process

### 1. Understand the problem

Let the user describe what they see. Ask 2-3 short clarifying questions max:

- What did you expect to happen?
- What actually happened?
- Can you reproduce it consistently?

### 2. Investigate

Explore the relevant area of the codebase:

- Trace the data flow from the described symptom
- Check existing tests — do they cover this case?
- Read `UBIQUITOUS_LANGUAGE.md` if it exists for domain terms
- Check recent changes: `git log --oneline -10`

### 3. Reproduce

Attempt to reproduce:

- Identify the minimal reproduction path
- If tests exist that should catch this, understand why they don't

### 4. File issue(s)

Assess: single issue or multiple?

- Break down when: fix spans multiple independent areas
- Keep single when: one behaviour wrong, one root cause

File using the `issue-writing` rule conventions:

```bash
gh issue create -R civilian-apps/{repo} \
  --title "{behaviour that's broken}" \
  --body "$(cat <<'EOF'
## Problem
{actual vs expected behaviour}

## Reproduction
1. {step}
2. {step}
3. {observe: ...}

## Investigation notes
{what was found during exploration — root cause hypothesis, relevant code area}

## Acceptance criteria
- [ ] {testable criterion}
EOF
)" \
  --label bug
```

### 5. Continue

Each issue is independent. Continue the QA session until the user is done.
