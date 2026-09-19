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

# Code Review Standards

## When to review

**MANDATORY review triggers:**

- After writing or modifying code
- Before any commit to shared branches
- When security-sensitive code is changed (auth, payments, user data)
- When architectural changes are made
- Before merging pull requests

**Before declaring work ready for review:**

- Automated checks pass (tests, lint, type-check)
- Merge conflicts resolved
- Branch up to date with target
- Diff is small and single-concern (~100 lines reasonable, ~1000 too large); refactor separated from behavior change

**Review scale tracks automation scale:** N automated or looped changes need N reviewed diffs — a skim of the summary is not review. Spot-check the gate itself periodically by sampling its verdicts; gates drift.

## Review checklist

Before marking code complete:

- [ ] Code is readable and well-named
- [ ] Functions are focused (<50 lines)
- [ ] Files are cohesive (<800 lines)
- [ ] No deep nesting (>4 levels)
- [ ] Errors are handled explicitly
- [ ] No shared-state mutation (immutable patterns preferred)
- [ ] No hardcoded secrets or credentials
- [ ] No hardcoded thresholds, delays, or limits (use named constants or config)
- [ ] No console.log or debug statements
- [ ] Tests exist for new functionality and assert behavior (not tautologies)
- [ ] Test coverage meets the new-code baseline (per [testing.md](testing.md))

## Security review triggers

**Apply extra scrutiny when reviewing:**

- Authentication or authorization code
- User input handling
- Database queries
- File system operations
- External API calls
- Cryptographic operations
- Payment or financial code

## Review severity levels

| Level | Meaning | Action |
|-------|---------|--------|
| CRITICAL | Security vulnerability or data loss risk | **BLOCK** - Must fix before merge |
| HIGH | Bug or significant quality issue | **WARN** - Should fix before merge |
| MEDIUM | Maintainability concern | **INFO** - Consider fixing |
| LOW | Style or minor suggestion | **NOTE** - Optional |

**Calibrate the report:** one substantiated blocker outweighs a list of nits.

**Half-built work:** deliberate half-built work the change leaves behind (a spike, harness, scaffold, phased feature, blast-radius buffer, or incidental cleanup) is not a defect — report only when it is accidental or the change half-repairs it.

## Review workflow

```
1. Run git diff to understand changes
2. Check security checklist first
3. Review code quality checklist
4. Run relevant tests
5. Verify the new-code coverage baseline (per [testing.md](testing.md))
6. Dispatch the relevant review skill or agent for domain-specific review
```

## Common issues to catch

### Security

The [security.md](security.md) mandatory checks own this list (same scope, always co-loaded).

### Performance

- N+1 queries - use JOINs or batching
- Missing pagination - add LIMIT to queries
- Unbounded queries - add constraints
- Missing caching - cache expensive operations

### Over-engineering

Hunt complexity only; correctness, security, and performance stay with their own passes. Working is not the bar: a change that leaves the codebase structurally messier (a layer it could do without, special-case branches bolted onto a shared flow, a file pushed past its healthy size) is a finding even when nothing is broken. For each change, first ask whether a reframing deletes the complexity instead of adding to it.

- Dead code, unused flexibility, speculative features - delete
- Hand-rolled versions of what the standard library ships - use the stdlib function
- Dependencies or code doing the platform's job - use the native feature
- Abstractions with one implementation, configs nobody sets, layers with one caller - inline or remove
- Same logic achievable in fewer lines - show the shorter form
- Repo-wide, also hunt: one-product factories, wrappers that only delegate, files exporting one thing, dead flags and config
- Never flag a minimal smoke test or assert self-check for deletion