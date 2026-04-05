---
name: stripe
description: Implement Stripe checkout, webhooks, customer portal, and subscription flows. Use for any payment or billing work.
sources:
  - repo: N/A
    skill: N/A
    relationship: original
last_reviewed: 2026-04-05
---

# stripe

Payment and subscription implementation with Stripe.

## Scope

- Checkout sessions and success/cancel flows
- Webhook handler at `/api/webhooks/stripe`
- Customer portal configuration
- Subscription lifecycle (create, update, cancel)
- Stripe fixtures for test data (`stripe-fixtures.json`)
- Price/product sync with Supabase

## Process

### 1. Check existing setup

Read the starter's Stripe integration — it likely includes basics from the next-supabase-stripe-starter.

### 2. Extend as needed

- New webhook events — add handlers to the webhook route
- New products/prices — update `stripe-fixtures.json` and sync
- Subscription changes — update entity actions and RLS policies

### 3. Test

- Test webhook signature verification
- Test subscription state transitions
- Use Stripe test mode keys only
