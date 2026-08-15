---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
---

# TypeScript/JavaScript Testing

> This file extends [common/testing.md](../common/testing.md) with TypeScript/JavaScript specific content.

## Framework

Use **vitest** as the testing framework. Jest where the framework defaults to it (Next.js) or in legacy projects.

## Coverage

Measure coverage with `vitest run --coverage`.

## Test Organization

Use `describe` / `it` blocks for grouping; `.todo` stubs an unimplemented test:

```typescript
describe('auth flow', () => {
  it('returns 401 for missing token', () => {})
  it.todo('refreshes expired token')
})
```

## E2E Testing

Use **Playwright** as the E2E testing framework for critical user flows.

See `e2e-testing` skill for Playwright patterns, Page Object Model, and CI integration.

