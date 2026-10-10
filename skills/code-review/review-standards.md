# Code Review Standards

## Review checklist

Before marking code complete:

- [ ] Code is readable and well-named
- [ ] Functions are focused (<50 lines)
- [ ] Files are cohesive (<800 lines; the typical target lives in `~/.claude/rules/common/common.md` § Coding style)
- [ ] No deep nesting (>4 levels)
- [ ] Errors are handled explicitly
- [ ] No shared-state mutation (immutable patterns preferred)
- [ ] No hardcoded thresholds, delays, or limits (use named constants or config)
- [ ] No console.log or debug statements
- [ ] Tests exist for new functionality and assert behavior (not tautologies)
- [ ] Test coverage meets the new-code baseline (per `~/.claude/rules/common/common.md`)

## Security review triggers

**Apply extra scrutiny when reviewing:**

- Authentication or authorization code
- User input handling
- Database queries
- File system operations
- External API calls
- Cryptographic operations
- Payment or financial code

## Common issues to catch

### Security

The mandatory checks in `~/.claude/rules/common/common.md` own this list.

### Performance

- N+1 queries, unpaginated or unbounded queries, uncached expensive operations - batch, constrain, or cache in the change

### Over-engineering

Hunt complexity only; correctness, security, and performance stay with their own passes. Working is not the bar: a change that leaves the codebase structurally messier (a layer it could do without, special-case branches bolted onto a shared flow, a file pushed past its healthy size) is a finding even when nothing is broken. For each change, first ask whether a reframing deletes the complexity instead of adding to it.

- Dead code this change created, unused flexibility, speculative features - delete; pre-existing dead code is surfaced, and its removal is separate work
- Hand-rolled versions of what the standard library ships - use the stdlib function
- Dependencies or code doing the platform's job - use the native feature
- Abstractions with one implementation, configs nobody sets, layers with one caller - inline or remove
- Same logic achievable in fewer lines - show the shorter form
- Repo-wide, also hunt: one-product factories, wrappers that only delegate, files exporting one thing, dead flags and config
- Never flag a minimal smoke test or assert self-check for deletion