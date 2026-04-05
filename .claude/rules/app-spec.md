# App Spec — {PROJECT_NAME}

> This file is the source of truth for the current state of the application.
> Read this before any structural changes. Updated by PM as features are built.

globs: src/**, supabase/**

## Stack

- Next.js 15+ (App Router) + TypeScript + Tailwind + shadcn/ui
- Supabase (Postgres + Auth + Storage)
- Stripe (Checkout + Customer Portal)

## Entities

| Entity     | Purpose | Table | RLS |
| ---------- | ------- | ----- | --- |
| _none yet_ |         |       |     |

## Routes

| Route        | Purpose        | Auth Required |
| ------------ | -------------- | ------------- |
| `/`          | Landing page   | No            |
| `/sign-in`   | Sign in        | No            |
| `/sign-up`   | Sign up        | No            |
| `/dashboard` | Main dashboard | Yes           |

## API Endpoints

| Endpoint               | Method | Purpose                |
| ---------------------- | ------ | ---------------------- |
| `/api/webhooks/stripe` | POST   | Stripe webhook handler |

## Auth Config

- Provider: Supabase Auth
- Methods: Email/password (default from starter)
- Session: Cookie-based via middleware
