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

## Review Checklist

Before marking code complete:

- [ ] Code is readable and well-named
- [ ] Functions are focused (<50 lines)
- [ ] Files are cohesive (<800 lines)
- [ ] No deep nesting (>4 levels)
- [ ] Errors are handled explicitly
- [ ] No mutation (immutable patterns used)
- [ ] No hardcoded secrets or credentials
- [ ] No hardcoded values (use constants or config)
- [ ] No console.log or debug statements
- [ ] Tests exist for new functionality
- [ ] Test coverage meets 80% minimum

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
| `security-guidance` plugin | Auto-running (enabled) | Pattern warnings + diff review + commit review — always active |
| `code-review` | Built-in skill | Review the current diff for correctness bugs + cleanups; effort-level; `--fix` to apply |
| `review` | Skill | General code review workflow |
| `/pr-review-toolkit:review-pr` | Command (plugin, enabled) | Comprehensive multi-agent PR review |
| `/code-review:code-review` | Command (plugin, enabled) | Multi-agent PR review — overlaps `/pr-review-toolkit:review-pr`; CLAUDE.md deprioritizes |
| `security-review` | Built-in skill | Security-focused diff review; for deeper audit use the `security-auditor` agent |
| `diagnose` | Skill | Root cause analysis on bugs found |
| `silent-failure-hunter` | Agent | Hunt swallowed errors, bad fallbacks, missing propagation |
| `security-auditor` | Agent | Adversarial security audit of a diff or design (pre-ship gate) |
| `react-build-resolver` | Agent | React build failures found during review |
| `code-simplifier` | Agent | Code clarity/consistency refinement |

Review tools (`code-review`, `review`, `/pr-review-toolkit:review-pr`) are substitutes — pick one. Authoritative phase-gate order in CLAUDE.md.

## Review Workflow

```
1. Run git diff to understand changes
2. Check security checklist first
3. Review code quality checklist
4. Run relevant tests
5. Verify coverage >= 80%
6. Use relevant tool from Review Tools table for domain-specific review
```

## Common Issues to Catch

### Security

- Hardcoded credentials (API keys, passwords, tokens)
- SQL injection (string concatenation in queries)
- XSS vulnerabilities (unescaped user input)
- Path traversal (unsanitized file paths)
- CSRF protection missing
- Authentication bypasses

### Code Quality

- Large functions (>50 lines) - split into smaller
- Large files (>800 lines) - extract modules
- Deep nesting (>4 levels) - use early returns
- Missing error handling - handle explicitly
- Mutation patterns - prefer immutable operations
- Missing tests - add test coverage

### Performance

- N+1 queries - use JOINs or batching
- Missing pagination - add LIMIT to queries
- Unbounded queries - add constraints
- Missing caching - cache expensive operations

## Approval Criteria

- **Approve**: No CRITICAL or HIGH issues
- **Warning**: Only HIGH issues (merge with caution)
- **Block**: CRITICAL issues found