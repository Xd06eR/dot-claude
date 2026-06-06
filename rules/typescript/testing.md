# TypeScript/JavaScript Testing

> This file extends [common/testing.md](../common/testing.md) with TypeScript/JavaScript specific content.

## Framework

Use **vitest** as the testing framework. Jest acceptable for legacy projects.
See `vite-patterns` skill for Vitest configuration in Vite projects.

## Coverage

```bash
vitest run --coverage
```

## Test Organization

Use `describe` / `it` blocks for grouping. Tag slow tests with `.todo` or `.skip`:

```typescript
describe('auth flow', () => {
  it('returns 401 for missing token', () => {})
  it.todo('refreshes expired token')
})
```

## E2E Testing

Use **Playwright** as the E2E testing framework for critical user flows.
See `e2e-testing` skill for Playwright patterns, Page Object Model, and CI integration.

## React Testing

For React component testing with React Testing Library, MSW mocking, and accessibility assertions, see [react/testing.md](../react/testing.md) and `react-testing` skill.