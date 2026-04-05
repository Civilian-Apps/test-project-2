---
globs:
  - 'supabase/functions/**'
  - 'src/**/tools.ts'
  - 'src/**/actions.ts'
---

# Edge Functions

- Every edge function is both a REST endpoint and an MCP tool.
- One edge function per entity action. Never one function per domain entity.
- Functions receive all context via explicit parameters, never session or cookies.
- Functions return typed JSON objects, never formatted strings.
- Every function has a tool description and parameter descriptions for MCP discoverability — part of definition of done.
- Errors return structured objects with error codes, not just HTTP status codes.
- State-changing functions are idempotent — agent retries and double executions must not be destructive.
