# Agents

This project uses Claude Code agents for autonomous development.

## Available Agents

- **feature-builder** — TDD implementation (runs in GitHub Actions on `ready-to-build` label)
- **feature-reviewer** — PR review against spec (runs in GitHub Actions on PR open/synchronize)
- **hygiene** — periodic cleanup, migration squash, dependency updates (manual)

## Workflow

1. Tech-lead creates GitHub Issues from the implementation plan
2. Issues labeled `ready-to-build` trigger the feature-builder agent
3. Agent follows: analyse → plan → test (RED) → build (GREEN) → validate (REFACTOR) → ship
4. PRs are reviewed by the feature-reviewer agent
5. Human reviews and merges
6. Deploys on merge to `main`

## Skills

Implementation skills (invoked by agents or interactively):

| Skill               | Phase        | What it does                                                 |
| ------------------- | ------------ | ------------------------------------------------------------ |
| implement-issue     | full loop    | Orchestrates analyse → plan → test → build → validate → ship |
| tdd                 | test + build | RED-GREEN-REFACTOR discipline                                |
| build-interface     | plan         | Design module interface before building                      |
| supabase-data       | build        | Migrations, RLS, types, queries, edge functions              |
| nextjs-design       | build        | Pages, layouts, components, server actions                   |
| stripe              | build        | Checkout, webhooks, subscriptions                            |
| mcp-server          | build        | MCP tools, resources, auth                                   |
| webapp-testing      | validate     | Playwright E2E testing for browser-level verification        |
| debug               | any          | Root cause analysis, TDD fix plan                            |
| refactor            | any          | Restructure with test safety                                 |
| interactive-qa      | validate     | Guided QA session for complex bugs                           |
| ubiquitous-language | setup        | DDD glossary for the project                                 |

## Rules (always loaded)

Best practices from Vercel Engineering, Supabase, Stripe, and Anthropic — embedded as rules so they're always in context, not on-demand skills.
