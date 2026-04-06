---
globs:
  - 'src/app/**'
  - 'src/components/**'
  - 'src/features/**'
---

# Next.js & React

Consolidated from Vercel Engineering best practices + Next.js eval-tested patterns.

## Server vs Client Components

- **Default to Server Components** — no directive needed.
- Add `'use client'` ONLY for: hooks, event handlers, browser APIs.
- Never add `'use client'` just for navigation — `<Link>` works in Server Components.
- Never import Server Components into Client Components — pass as `children` instead.
- Never use `useEffect` for data fetching — use Server Components.
- Never use `useState` for data that comes from the server.

## Async APIs (Next.js 15+)

- `params` and `searchParams` are Promises — must be awaited: `const { id } = await params;`
- `cookies()` and `headers()` are async — must be awaited.
- Server-side searchParams: `const { q } = await searchParams;`
- Client-side searchParams: `useSearchParams()` requires BOTH `'use client'` AND a `<Suspense>` wrapper.

## Anti-Patterns to Avoid

- `useEffect` for browser detection — use direct detection: `typeof window !== 'undefined'`
- Pages Router patterns in App Router — no `getServerSideProps`, `getStaticProps`, `next/head`
- Serial `await` waterfalls — use `Promise.all()` or Suspense boundaries for parallel fetches
- Over-using `'use client'` — push client boundaries as deep as possible
- Unnecessary API routes — Server Components can fetch directly
- `window.location` for navigation — use `<Link>` or `useRouter()`
- Defining components inside other components — causes remount on every render

## Eliminating Waterfalls (CRITICAL)

- Check cheap sync conditions before awaiting async calls.
- Move `await` into branches where actually used (defer-await pattern).
- Use `Promise.all()` for independent async operations.
- Use `<Suspense>` boundaries to stream content progressively.
- Restructure components to parallelize fetches — each component fetches its own data.

## Bundle Size (CRITICAL)

- Import directly from modules, never from barrel files (`import { Button } from './Button'` not `from './components'`).
- Use `next/dynamic` for heavy components not needed on initial render.
- Defer third-party scripts (analytics, logging) until after hydration.
- Preload on hover/focus for perceived speed.

## Caching (Next.js 16+ with `cacheComponents: true`)

- Three content types: Static (sync code, instant), Cached (`'use cache'`), Dynamic (Suspense).
- `'use cache'` replaces `unstable_cache` — no manual cache keys needed.
- Use `cacheLife('hours')`, `cacheLife('days')` for TTL control.
- Use `cacheTag()` + `updateTag()` / `revalidateTag()` for invalidation.
- Cannot access `cookies()` / `headers()` inside `'use cache'` — pass as arguments.
- Exception: `'use cache: private'` allows runtime APIs for compliance.

## Composition Patterns

- Avoid boolean prop proliferation — use compound components or explicit variant components.
- Use `children` for composition instead of `renderX` props.
- Lift state into provider components for sibling access.
- Provider is the only place that knows how state is managed (decouple implementation).

## Performance

- Use `React.cache()` for per-request deduplication in Server Components.
- Minimize data passed from Server to Client Components (serialization cost).
- Use `after()` for non-blocking operations (logging, analytics).
- Use `content-visibility: auto` for long lists.
- Use `startTransition` for non-urgent updates, `useDeferredValue` for expensive renders.
- Hoist static I/O (fonts, logos) to module level — don't re-fetch per request.

## Dynamic Routes

- Default to simple routes: `app/[id]/page.tsx`, not `app/products/[id]/page.tsx` unless needed.
- Use `generateStaticParams` for static generation of dynamic routes.
- Catch-all: `[...slug]`. Optional catch-all: `[[...slug]]`.

## Navigation

- Server Components: use `<Link>` (no directive needed) or `redirect()` for conditionals.
- Client Components: use `useRouter()` for programmatic navigation.
- Form submissions: Server Action with `redirect()`.

## Cookie Pattern

- Reading cookies: Server Components use `await cookies()`, Client Components use server actions.
- Setting cookies from client: `'use server'` action that calls `cookies().set()`.

## Error Handling

- `error.tsx` catches segment errors, `global-error.tsx` catches root errors.
- Use `redirect()`, `notFound()`, `forbidden()`, `unauthorized()` for control flow.
- Wrap `redirect()` calls in try/catch with `unstable_rethrow` if inside a catch block.

## UI Components (shadcn/ui + Tailwind)

- Use shadcn/ui components for all UI. No other component libraries.
- Icons: `lucide-react` only.
- Install before importing: `npx shadcn@latest add {component}`.
- Tailwind CSS utility classes for all styling. No inline styles.
- Use CSS variables from `globals.css` for theming (shadcn/ui convention).
- Theme-aware classes: `bg-primary`, `text-muted-foreground`, `border`, `destructive`.
- Responsive: use `sm:`, `md:`, `lg:` prefixes.
- Data tables: use shadcn DataTable pattern with `@tanstack/react-table` for tabular data with pagination, sorting, filtering.

## State Management

- Server state: Server Components fetch directly. No client-side fetching for initial data.
- Global client state: React Context (user info, settings, theme).
- Local state: `useState` for component-specific data.
- Complex state logic: `useReducer`.
- Server state on client: React Query (`@tanstack/react-query`) for caching and mutations.
- Forms: `react-hook-form` + `zod` schemas for validation.

## Images & Fonts

- Always use `next/image` over `<img>` — automatic optimization.
- Always use `next/font` — automatic subsetting and self-hosting.
- Set `sizes` attribute on responsive images.
- Use `priority` on LCP images (hero, above-fold).

## General

- No `console.log` or `console.error` in production code.
- No `any` types — use proper TypeScript interfaces.
