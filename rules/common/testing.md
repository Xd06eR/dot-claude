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

≥80% baseline for new code. Coverage is a floor, not evidence. Language-specific testing rules may refine targets per layer.

Test weight tracks the change: new behavior and logic carry the baseline and the TDD loop; reversible, low-impact changes that mirror existing implementation need no new tests. Broaden or repeat testing only when new changes, failures, or unresolved concerns justify it.

## Test-Driven Development

The red → green loop and the house extras (seams, the tautological-test anti-pattern) live in the `tdd` skill.

## Troubleshooting

When tests fail:
1. Fix implementation, not tests (unless the test is wrong)
2. Use the `diagnosing-bugs` skill for root cause analysis on hard-to-debug failures

A flaky test is a defect: fix the test, never mute it with retries.