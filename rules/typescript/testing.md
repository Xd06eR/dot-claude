---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
---

# TypeScript/JavaScript Testing

> This file extends [common/testing.md](../common/testing.md) with TypeScript/JavaScript specific content.

- Use **vitest** as the testing framework. Jest where the framework defaults to it (Next.js) or in legacy projects.
- Measure coverage with `vitest run --coverage`.

## E2E testing

See the `e2e-testing` skill for Playwright interaction rules and the flaky-test diagnosis loop.
