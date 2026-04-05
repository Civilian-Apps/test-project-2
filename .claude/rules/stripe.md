---
globs:
  - 'src/**/stripe*'
  - 'supabase/functions/*stripe*'
  - 'supabase/functions/*webhook*'
  - 'stripe-fixtures.json'
---

# Stripe

## Defaults

- Unless otherwise specified, set up app with single subscription: $5/mo and coupon "familydiscount": 100% off, forever, unlimited redemptions.
- Feature gating reads from the database, never calls Stripe API at runtime.

## Integration Routing (from Stripe official best practices)

| Building...                       | Use                                 |
| --------------------------------- | ----------------------------------- |
| One-time payments                 | Checkout Sessions                   |
| Custom payment form               | Checkout Sessions + Payment Element |
| Saving payment method for later   | Setup Intents                       |
| Subscriptions / recurring billing | Billing APIs + Checkout Sessions    |

Always use Checkout Sessions as the default payment surface — it handles 3DS, localization, and payment methods automatically.

## API Version

- Use the latest Stripe API version unless the project specifies otherwise.
- Pin the version in the Stripe client initialization, not just in the dashboard.

## Webhook Best Practices

- Always verify webhook signatures using `stripe.webhooks.constructEvent()`.
- Process webhooks idempotently — use the event ID to deduplicate.
- Return 200 immediately, then process async. Don't let processing failures cause retries.
- Handle these events at minimum for subscriptions:
  - `checkout.session.completed` — provision access
  - `customer.subscription.updated` — plan changes
  - `customer.subscription.deleted` — revoke access
  - `invoice.payment_failed` — notify user, grace period

## Subscription Lifecycle

- Store subscription status in the database (sync via webhooks).
- Never trust client-side subscription status — always verify server-side.
- Use Stripe Customer Portal for self-service plan management (don't build custom UI for this).
- Handle trial → paid → cancelled → expired transitions explicitly.

## Error Handling

- Catch `Stripe.errors.StripeError` specifically, not generic errors.
- Map Stripe error codes to user-friendly messages.
- Log the full Stripe error server-side, return sanitized message to client.

## Testing

- Use Stripe test mode keys (`sk_test_`, `pk_test_`) exclusively in development.
- Use `stripe-fixtures.json` for reproducible test data.
- Test webhook signature verification with Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`.

## Security

- Never expose secret keys to the client. Only publishable keys (`pk_`) go to the browser.
- Store Stripe keys in environment variables, never in code.
- Use restricted API keys in production with minimum required permissions.
