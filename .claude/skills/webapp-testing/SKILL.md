---
name: webapp-testing
description: End-to-end testing of web applications using Playwright. Use when Jest/Testing Library is insufficient — visual verification, multi-page flows, browser-specific behaviour, or integration testing against a running server.
sources:
  - repo: N/A
    skill: N/A
    relationship: original
last_reviewed: 2026-04-05
---

# webapp-testing

E2E testing with Playwright for scenarios that unit/integration tests can't cover.

## When to Use

- Visual verification (screenshots, layout checks)
- Multi-page user flows (checkout, onboarding)
- Browser-specific behaviour (cookies, redirects, auth flows)
- Testing against a running dev server
- Verifying SSR/hydration behaviour

## Setup

```bash
npm install -D @playwright/test
npx playwright install chromium
```

## Pattern: Reconnaissance-Then-Action

1. **Navigate and wait:**

```typescript
await page.goto('http://localhost:3000');
await page.waitForLoadState('networkidle'); // CRITICAL: wait for JS
```

2. **Inspect rendered state:**

```typescript
await page.screenshot({ path: '/tmp/inspect.png', fullPage: true });
const buttons = await page.locator('button').all();
```

3. **Execute actions with discovered selectors:**

```typescript
await page.getByRole('button', { name: 'Submit' }).click();
await page.waitForURL('**/dashboard');
```

## Test Structure

```typescript
import { test, expect } from '@playwright/test';

test('user can complete checkout', async ({ page }) => {
  await page.goto('http://localhost:3000/pricing');
  await page.waitForLoadState('networkidle');

  await page.getByRole('button', { name: 'Subscribe' }).click();
  // Stripe Checkout redirect...
  await expect(page).toHaveURL(/success/);
});
```

## Best Practices

- Always `waitForLoadState('networkidle')` before inspecting dynamic content.
- Use semantic selectors: `getByRole`, `getByText`, `getByLabel` over CSS selectors.
- Use `headless: true` for CI, `headless: false` for debugging.
- Close browser when done.
- Screenshots go in `/tmp/`, not in the repo.
- Run against `npm run dev` or use a test server wrapper.

## When NOT to Use

- Component rendering tests → use Testing Library
- Server action logic → use Jest
- API contract tests → use Jest + fetch
- Anything that doesn't need a real browser
