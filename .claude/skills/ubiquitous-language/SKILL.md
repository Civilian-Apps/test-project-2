---
name: ubiquitous-language
description: Extract and maintain a DDD-style glossary of canonical domain terms. Use when starting a new project, when terminology is inconsistent in specs or code, or when domain concepts are ambiguous.
sources:
  - repo: mattpocock/skills
    skill: ubiquitous-language
    relationship: rewrite
last_reviewed: 2026-04-05
---

# ubiquitous-language

Establish canonical terms so specs, code, issues, and conversations use the same language.

## Process

### 1. Scan sources

Read available context for domain-relevant nouns, verbs, and concepts:

- PRD, DESIGN.md, specs/
- Entity definitions in `src/entities/*/definition.md`
- Issue descriptions
- Current conversation

### 2. Identify problems

- Same word used for different concepts (ambiguity)
- Different words for the same concept (synonyms)
- Vague or overloaded terms

### 3. Propose canonical glossary

Be opinionated — pick the best term, list aliases to avoid.

### 4. Write `UBIQUITOUS_LANGUAGE.md`

```markdown
# Ubiquitous Language

## {Domain area}

| Term   | Definition                                        | Aliases to avoid     |
| ------ | ------------------------------------------------- | -------------------- |
| Widget | A configurable product unit with a name and price | item, product, thing |

## Relationships

- A **User** has many **Widgets** (1:N)
- A **Widget** belongs to exactly one **User**

## Flagged ambiguities

- "Account" is used for both Supabase auth accounts and billing accounts — resolve before implementation
```

### 5. Maintain

Re-run when new entities are added or terminology drifts. Update definitions, flag new ambiguities, remove resolved ones.
