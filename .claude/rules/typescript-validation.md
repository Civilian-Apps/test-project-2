---
globs:
  - 'src/**/*.ts'
  - 'src/**/*.tsx'
  - 'supabase/functions/**'
---

# TypeScript & Validation

## TypeScript

- Strict mode is always enabled.
- Supabase-generated TypeScript types provide compile-time safety. Zod adds runtime safety at boundaries.

## Zod Validation

Validate with Zod at every point where data enters from something you do not control: browser, API consumer, external service, agent, webhook.

Validate with Zod on critical paths where data comes from the database (defense in depth).

### Boundaries

| Boundary                       | Implementation                                                                                   |
| ------------------------------ | ------------------------------------------------------------------------------------------------ |
| Browser → Server Actions       | Zod schema validates form data before processing                                                 |
| API consumers → Edge Functions | Zod validates request params at function entry                                                   |
| API consumers → FastAPI        | Pydantic validates (Python-side equivalent); TS client generated from OpenAPI spec stays in sync |
| External APIs → App            | Zod validates response shapes — never trust external data                                        |
| MCP tool calls → Handlers      | Zod schemas define and validate tool input parameters                                            |
| DB → App                       | Generated Supabase types for compile-time safety; Zod for runtime checks on critical paths       |

## Schema Pattern

Define Zod schemas in the entity's `types.ts`. Export both the schema and the inferred TypeScript type. The same schema validates REST input, MCP tool parameters, and AI SDK tool definitions.

```typescript
// src/entities/{entity}/types.ts
import { z } from 'zod';

// Schema — single source of truth
export const WidgetInput = z.object({
  name: z.string().min(1).max(100),
  price: z.number().positive(),
});
export type WidgetInput = z.infer<typeof WidgetInput>;

export const Widget = WidgetInput.extend({
  id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type Widget = z.infer<typeof Widget>;
```

Consumed by an Edge Function:

```typescript
// supabase/functions/create-widget/index.ts
import { WidgetInput } from '@/entities/widget/types';

Deno.serve(async (req) => {
  const body = await req.json();
  const parsed = WidgetInput.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.flatten() }), { status: 400 });
  }
  // ... insert parsed.data into Supabase
});
```

Consumed by an MCP tool:

```typescript
// src/entities/widget/tools.ts
import { WidgetInput } from './types';
import { zodToJsonSchema } from 'zod-to-json-schema';

export const createWidgetTool = {
  name: 'create_widget',
  description: 'Create a new widget with a name and price',
  inputSchema: zodToJsonSchema(WidgetInput),
  handler: async (input: unknown) => {
    const parsed = WidgetInput.safeParse(input);
    if (!parsed.success) return { error: parsed.error.flatten() };
    // ... call the edge function or direct Supabase insert
  },
};
```

## Enforcement

- Always use `.safeParse()`, never `.parse()` — handle errors, don't throw.
- The same schema must be used across all consumers (REST, MCP, AI SDK tool definitions).
- If you add a new boundary, add Zod validation — no exceptions.
