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

## Coverage target

≥80% baseline for new code — coverage is a floor, not evidence. Language-specific testing rules may refine targets per layer.

Test weight tracks the change: new behavior and logic carry the baseline and the TDD loop; reversible, low-impact changes that mirror existing implementation need no new tests. Broaden or repeat testing only when new changes, failures, or unresolved concerns justify it.

## Test-Driven Development

Workflow: failing test (RED) → minimal implementation (GREEN) → verify coverage meets target.

See the `tdd` skill for the red → green loop and the house extras (seams, the tautological-test anti-pattern); refactoring lands at review.

## Test types

Three layers, use as needed:

1. **Unit Tests** — Individual functions, utilities, components
2. **Integration Tests** — API endpoints, database operations
3. **E2E Tests** — Critical user flows (framework chosen per language)

## Troubleshooting

When tests fail:
1. Check test isolation — no shared mutable state between tests
2. Verify mocks match current interfaces
3. Fix implementation, not tests (unless the test is wrong)
4. Use the `diagnosing-bugs` skill for root cause analysis on hard-to-debug failures

A flaky test is a defect: fix the test, never mute it with retries.

## Test structure (AAA pattern)

Prefer Arrange-Act-Assert structure for tests.

### Test naming

Name the behavior under test: `test('returns empty array when no markets match query', ...)`.