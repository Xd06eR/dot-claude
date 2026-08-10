---
paths:
  - "**/*.py"
  - "**/*.pyi"
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
  - "**/*.mjs"
  - "**/*.cjs"
  - "**/*.mts"
  - "**/*.cts"
  - "**/*.html"
  - "**/*.css"
  - "**/*.scss"
  - "**/*.sass"
  - "**/*.less"
  - "**/*.vue"
  - "**/*.svelte"
  - "**/*.astro"
  - "**/*.sh"
  - "**/*.bash"
  - "**/*.zsh"
  - "**/*.ps1"
  - "**/*.bat"
  - "**/*.sql"
  - "**/*.graphql"
  - "**/*.gql"
  - "**/*.proto"
  - "**/*.go"
  - "**/*.rs"
  - "**/*.java"
  - "**/*.kt"
  - "**/*.rb"
  - "**/*.php"
  - "**/*.c"
  - "**/*.h"
  - "**/*.cpp"
  - "**/*.hpp"
  - "**/*.cs"
  - "**/*.swift"
  - "**/Dockerfile*"
  - "**/Makefile"
  - "**/*.mk"
---

# Testing Requirements

## Coverage Target

≥80% baseline for new code — coverage is a floor, not evidence. Language-specific testing rules may refine targets per layer.

## Test-Driven Development

Workflow: failing test (RED) → minimal implementation (GREEN) → refactor → verify coverage meets target.

See the `superpowers:test-driven-development` skill for the full red-green-refactor workflow; the owned `tdd` skill carries the house extras (seams, tautological-test anti-pattern).

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

A flaky test is a defect: fix the test, never mute it with retries.

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

Name the behavior under test: `test('returns empty array when no markets match query', ...)`.