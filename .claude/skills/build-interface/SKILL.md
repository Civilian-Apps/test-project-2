---
name: build-interface
description: Design a module interface before building it. Use when implementing a complex module where getting the interface wrong would be costly — multiple callers, significant hidden complexity, or unclear API shape.
sources:
  - repo: mattpocock/skills
    skill: design-an-interface
    relationship: inspired
last_reviewed: 2026-04-05
---

# build-interface

Design the interface before writing tests. A good interface makes everything downstream easier — tests are simpler, callers are clearer, implementation has room to change.

## When to Use

- Module has 2+ callers (entity used by multiple features)
- Significant complexity hidden behind the interface (deep module)
- API shape is ambiguous from the spec
- You're about to write tests and aren't sure what the public surface should be

## Process

### 1. Gather constraints

From the issue and spec:

- Who calls this module? (UI components, server actions, other entities, MCP tools)
- What operations are needed?
- What data flows in and out?
- What should be hidden from callers?

### 2. Design the interface

Define the public surface — types, function signatures, exports:

- Minimise the number of methods/exports
- Maximise what's hidden behind the interface
- Make the common case easy, the rare case possible
- Return structured results (`{ data, error }`), never throw

Write the type signatures in `types.ts` before anything else.

### 3. Validate against callers

For each caller, sketch how they'd use the interface:

- Is the usage obvious or does it require knowledge of internals?
- Can a caller misuse the interface accidentally?
- Does the interface force unnecessary coupling?

### 4. Proceed to TDD

The interface is now your test target. Write tests against the public surface. Implementation is free to change as long as the interface holds.
