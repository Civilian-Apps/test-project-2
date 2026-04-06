---
globs:
  - 'src/**'
---

# Code Standards

## Imports

Order: React/Next.js → external packages → internal (absolute) → relative.
Blank line between each group.

## Naming

- Components: PascalCase
- Files: kebab-case (except components which match their export)
- Server actions: camelCase verbs (`createUser`, `updateProfile`)
- Database columns: snake_case
- TypeScript types/interfaces: PascalCase, no `I` prefix

## Components

- Server components by default. Use `"use client"` only when the component requires interactivity or hooks.
- URL state (`searchParams`) over React state for any view that should be shareable or bookmarkable.
- Pagination is required for every list endpoint and list UI component.
- Use optimistic updates for write operations.

## Error Handling

- Server actions return `{ data, error }` — never throw to the client.
- Log errors server-side. Return user-friendly messages client-side.
- Never expose internal error details (stack traces, SQL errors) to the client.
- Structured error objects include an `error_code` (string enum) and a `message` (human-readable).

## File Size

- Components: max ~200 lines. Extract sub-components if larger.
- Server actions: one action per function, max ~50 lines.
- Test files: no limit, but group related tests in describe blocks.

## Testing

- Test everything. No code ships without tests.
- Co-locate test files: `foo.test.ts` next to `foo.ts`.
