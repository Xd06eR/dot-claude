# Testing Requirements

## Coverage Target

≥80% baseline for new code. Language-specific testing rules may set higher targets per layer.

## Test-Driven Development

Workflow:
1. Write test first (RED)
2. Run test - it should FAIL
3. Write minimal implementation (GREEN)
4. Run test - it should PASS
5. Refactor (IMPROVE)
6. Verify coverage meets target

See `tdd` skill and `test-driven-development` skill for full red-green-refactor workflow.

## Test Types

Three layers, use as needed:

1. **Unit Tests** — Individual functions, utilities, components
2. **Integration Tests** — API endpoints, database operations
3. **E2E Tests** — Critical user flows (framework chosen per language)

## Troubleshooting

When tests fail:
1. Check test isolation — no shared mutable state between tests
2. Verify mocks match current interfaces
3. Fix implementation, not tests (unless the test is wrong)
4. Use the `diagnose` skill for root cause analysis on hard-to-debug failures

## Test Structure (AAA Pattern)

Prefer Arrange-Act-Assert structure for tests:

```typescript
test('calculates similarity correctly', () => {
  // Arrange
  const vector1 = [1, 0, 0]
  const vector2 = [0, 1, 0]

  // Act
  const similarity = calculateCosineSimilarity(vector1, vector2)

  // Assert
  expect(similarity).toBe(0)
})
```

### Test Naming

Use descriptive names that explain the behavior under test:

```typescript
test('returns empty array when no markets match query', () => {})
test('throws error when API key is missing', () => {})
test('falls back to substring search when Redis is unavailable', () => {})
```