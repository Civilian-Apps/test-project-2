---
globs:
  - 'src/**/actions.ts'
  - 'supabase/functions/**'
  - 'src/common/auth*'
---

# Auth

- Multi-user from the start. RLS scopes all data access, edge functions are stateless, frontend is CDN-served.
- Supabase Auth is the single auth system for all consumers.
- Every edge function extracts identity from the auth token, never from parameters.
- Every database query runs as the authenticated user, never the service role (see data-layer.md for exceptions).
- RLS enforces all data scoping. No application-level filtering as a substitute.
- No edge function accepts `user_id`, `org_id`, or `tenant_id` as a parameter.

## Auth Consumers and Token Flow

| Consumer                | Mechanism                                                        |
| ----------------------- | ---------------------------------------------------------------- |
| Next.js frontend        | Supabase client SDK handles session, passes JWT in headers       |
| MCP agents              | OAuth flow through Supabase Auth, same JWT format                |
| Webhooks (Stripe, etc.) | Verified by signature, run as service role with explicit scoping |
| Cron / scheduled jobs   | Run as service role with explicit scoping                        |
