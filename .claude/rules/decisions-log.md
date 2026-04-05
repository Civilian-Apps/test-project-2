---
globs:
  - 'DECISIONS.md'
---

# Decisions Log

Every project maintains a `DECISIONS.md` file at the project root. Record any architectural decision that deviates from `STACK.md` or resolves an ambiguity in `DESIGN-GUIDELINES.md`.

- Every deviation from `STACK.md` requires a `DECISIONS.md` entry before the code is merged.
- Every resolution of a `<!-- TODO -->` or `<!-- AMBIGUOUS -->` flag from `DESIGN-GUIDELINES.md` requires a `DECISIONS.md` entry.
- The PM agent or human reviews `DECISIONS.md` entries during PR review.

## Template

```markdown
## YYYY-MM-DD — {Short title}

**Decision:** {What was decided}

**Options considered:**

1. {Option A} — {tradeoff}
2. {Option B} — {tradeoff}

**Choice:** Option {N}

**Rationale:** {Why this option was chosen, referencing principles from DESIGN-GUIDELINES.md}
```
