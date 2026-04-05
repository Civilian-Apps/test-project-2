---
globs:
  - 'src/entities/**'
  - 'src/links/**'
  - 'src/features/**'
  - 'src/common/**'
---

# Ontology — Source Folder Structure

Code groups into four folders:

| Folder          | Contains                                                                                                                |
| --------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `src/entities/` | Domain objects with attributes and actions (e.g. `user`, `widget`, `invoice`)                                           |
| `src/links/`    | Relationships between two or more entities with their own actions (e.g. `invoice-widget`, `complaint-customer-product`) |
| `src/features/` | User-facing capabilities as defined in the spec. Features reference primitives in entities and links.                   |
| `src/common/`   | Infrastructure code that belongs to no domain — auth helpers, API clients, formatting utilities                         |

## Entity / Link Folder Structure

```
src/entities/{name}/
  definition.md      # canonical business rules (wins over code)
  types.ts            # Zod schemas + inferred TS types (no internal imports)
  actions.ts          # server actions (imports types.ts)
  queries.ts          # data access (imports types.ts)
  tools.ts            # MCP tool wrappers (imports types.ts, actions.ts)
  {name}.test.ts      # co-located tests

src/links/{entity-a}-{entity-b}/   # alphabetical entity order in folder name
  definition.md
  types.ts            # link-specific schemas (references entity types via import)
  actions.ts
  queries.ts
  tools.ts
  {link-name}.test.ts
```

## Rules

- **Discoverability** — co-locate everything an agent needs in one folder. Track references to other parts of the codebase in `definition.md`.
- **Entity isolation** — entities do not import from each other. Shared logic between entities lives in a link. The link folder name lists entities in alphabetical order.
- **`definition.md` is canonical** — if `definition.md` and code disagree, `definition.md` wins. The agent must not silently reconcile the difference.
- **`types.ts` has no internal imports** — `types.ts` is imported by other files in the folder. It never imports from `actions.ts`, `queries.ts`, or `tools.ts`.

## Escalation: `definition.md` vs Code Mismatch

When you detect that code contradicts `definition.md`:

1. **Block the PR** — do not merge code that contradicts the canonical definition.
2. **Open a GitHub Issue** with label `ontology-mismatch`. Body must include:
   - Path to `definition.md`
   - Path to the conflicting code file and line(s)
   - The specific contradiction
3. **Reference both files** in the PR comment explaining why the PR is blocked.
4. **Do not fix either file** — the PM agent or human resolves which is correct.
