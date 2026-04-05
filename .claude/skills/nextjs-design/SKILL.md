---
name: nextjs-design
description: Build Next.js pages, layouts, components, and server actions following App Router conventions. Use for any UI or routing work. Always-loaded rules in nextjs.md provide the best practices — this skill provides the workflow.
sources:
  - repo: N/A
    skill: N/A
    relationship: original
last_reviewed: 2026-04-05
---

# nextjs-design

UI and routing implementation with Next.js App Router. Best practices are in `rules/nextjs.md` (always loaded). This skill provides the build workflow.

## Process

### 1. Understand the route structure

Read `.claude/rules/app-spec.md` for existing routes. Check `src/app/` for current layout.

### 2. Design the component tree

- What's server vs client? (default server, push `'use client'` deep)
- What data does each component need? (avoid waterfalls)
- Where do loading/error states go? (Suspense + error.tsx)
- What's cached vs dynamic? (`'use cache'` vs Suspense)

### 3. Build bottom-up

- Data layer first (queries, actions in entity dirs)
- Then presentational components (Server Components default)
- Then page composition (layouts, loading states)
- Then client interactivity (push to leaf components)

### 4. Verify

- `npm test` — component and action tests
- `npx tsc --noEmit` — type check
- `npm run lint` — lint
- Check: no barrel imports, no `SELECT *`, no serial awaits

## Key Patterns (quick reference)

### searchParams with Suspense

```tsx
// app/search/page.tsx — Server Component
export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  return (
    <Suspense fallback={<Skeleton />}>
      <Results query={q} />
    </Suspense>
  );
}
```

### Cookie from client

```tsx
// actions.ts — 'use server'
export async function setTheme(theme: string) {
  'use server';
  (await cookies()).set('theme', theme);
}
// component.tsx — 'use client'
<button onClick={() => setTheme('dark')}>Dark</button>;
```

### Dynamic route

```tsx
// app/[id]/page.tsx
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getItem(id);
  return <ItemView item={item} />;
}
```
