---
name: mcp-server
description: Build MCP servers with tools, resources, and auth. Follows Anthropic's mcp-builder methodology — research, implement, test, evaluate. Use when adding AI-accessible capabilities to a project.
sources:
  - repo: N/A
    skill: N/A
    relationship: original
last_reviewed: 2026-04-05
---

# mcp-server

Build MCP (Model Context Protocol) servers that enable LLMs to interact with project entities through well-designed tools.

## Stack

- **Language:** TypeScript (MCP SDK)
- **Transport:** Streamable HTTP for remote, stdio for local
- **Validation:** Zod schemas (reuse from entity `types.ts`)
- **Auth:** Supabase Auth OAuth flow

## Process

### Phase 1: Plan

#### Understand the API surface

- Read entity `definition.md` and `types.ts` files to identify what tools are needed.
- Each entity action becomes a potential MCP tool.
- Prioritize comprehensive coverage — list all operations before building.

#### Design tools

- **Naming:** consistent prefixes: `{entity}_create`, `{entity}_list`, `{entity}_get`, `{entity}_update`.
- **Input schemas:** Zod (reuse from `src/entities/{name}/types.ts`).
- **Output:** Return structured JSON with `outputSchema` where possible. Include `text` content for human readability.
- **Annotations:** mark `readOnlyHint`, `destructiveHint`, `idempotentHint` on every tool.
- **Descriptions:** concise, action-oriented. The description is the ONLY thing agents see when deciding to use a tool.

### Phase 2: Implement

#### Project structure

```
src/mcp/
├── server.ts          # MCP server setup + tool registration
├── auth.ts            # Supabase Auth OAuth flow
├── tools/
│   └── {entity}.ts    # Tools per entity (imports from entities/)
└── resources/
    └── {entity}.ts    # Read-only resources per entity
```

#### Tool implementation pattern

```typescript
import { z } from 'zod';
import { WidgetInput } from '@/entities/widget/types';

server.registerTool('widget_create', {
  description: 'Create a new widget',
  inputSchema: WidgetInput,
  outputSchema: z.object({ id: z.string(), name: z.string() }),
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true },
  handler: async (input) => {
    const result = await createWidget(input);
    return {
      structuredContent: result,
      content: [{ type: 'text', text: `Created widget: ${result.name}` }],
    };
  },
});
```

#### Shared infrastructure

- API client with Supabase Auth
- Error handler returning actionable messages with next steps
- Pagination support (`cursor`, `limit`) on all list tools
- Response formatting (JSON + text content)

### Phase 3: Test

- Test tool input validation (invalid inputs rejected, valid accepted).
- Test handler logic (correct entity operations called).
- Test auth flow (unauthenticated requests rejected).
- Test with MCP Inspector: `npx @modelcontextprotocol/inspector`
- Build check: `npm run build`

### Phase 4: Verify

Code quality checks:

- No duplicated code across tools (extract shared helpers)
- Consistent error handling across all tools
- Full type coverage
- Every tool has a clear, concise description
- Every tool has correct annotations
- Zod schemas reused from entities, not duplicated
