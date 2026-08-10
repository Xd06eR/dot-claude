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

## When to Review

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

## Review Checklist

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
- [ ] Test coverage meets the new-code baseline (per testing.md)

## Security Review Triggers

**Apply extra scrutiny when reviewing:**

- Authentication or authorization code
- User input handling
- Database queries
- File system operations
- External API calls
- Cryptographic operations
- Payment or financial code

## Review Severity Levels

| Level | Meaning | Action |
|-------|---------|--------|
| CRITICAL | Security vulnerability or data loss risk | **BLOCK** - Must fix before merge |
| HIGH | Bug or significant quality issue | **WARN** - Should fix before merge |
| MEDIUM | Maintainability concern | **INFO** - Consider fixing |
| LOW | Style or minor suggestion | **NOTE** - Optional |

## Review Tools

| Tool | Type | Use when |
|------|------|----------|
| `security-guidance` plugin | Auto-running | Pattern warnings + diff review + commit review — always active |
| `/review-pr` | Command | Multi-agent PR review (aggregated, severity-normalized, cross-agent dedup) |
| `/lens-review` | Command | 5-lens confidence-scored review of a diff or PR (compliance, bug scan, git history, prior comments, in-code comments) |
| `diagnose` | Skill | Root cause analysis on bugs found |
| `code-reviewer` | Agent | CLAUDE.md compliance + bug review of a diff |
| `comment-analyzer` | Agent | Comment-rot hunt on a diff |
| `pr-test-analyzer` | Agent | Behavioral test-coverage gap analysis |
| `silent-failure-hunter` | Agent | Hunt swallowed errors, bad fallbacks, missing propagation |
| `type-design-analyzer` | Agent | Type encapsulation + invariant review |
| `security-auditor` | Agent | Adversarial security audit of a diff or design (pre-ship gate) |

Review tools (`/review-pr`, `/lens-review`) are substitutes — pick one. `/review-pr` aggregates the concern-agents; `/lens-review` runs 5 review lenses with confidence scoring. Authoritative phase-gate order in CLAUDE.md.

Post-review remediation (fix agents, not review lenses): `react-build-resolver` (React build failures), `code-simplifier` (clarity/consistency refinement).

## Review Workflow

```
1. Run git diff to understand changes
2. Check security checklist first
3. Review code quality checklist
4. Run relevant tests
5. Verify the new-code coverage baseline (per testing.md)
6. Use relevant tool from Review Tools table for domain-specific review
```

## Common Issues to Catch

### Security

The `security.md` mandatory checks own this list (same scope, always co-loaded).

### Performance

- N+1 queries - use JOINs or batching
- Missing pagination - add LIMIT to queries
- Unbounded queries - add constraints
- Missing caching - cache expensive operations