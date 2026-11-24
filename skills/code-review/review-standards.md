# Code Review Standards

## Review checklist

Before marking code complete:

- [ ] Code is readable and well-named
- [ ] Functions are focused (<50 lines)
- [ ] Files are cohesive (<800 lines)
- [ ] No deep nesting (>4 levels)
- [ ] Errors are handled explicitly
- [ ] No shared-state mutation (immutable patterns preferred)
- [ ] No hardcoded thresholds, delays, or limits (use named constants or config)
- [ ] No console.log or debug statements
- [ ] Tests exist for new functionality and assert behavior (not tautologies)
- [ ] Test coverage meets the new-code baseline (per `~/.claude/rules/engineering-standards.md`)

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

The mandatory checks in `~/.claude/rules/engineering-standards.md` own this list.

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

## Sideways sweep

A finding is a defect class, not a line. Before rating one, grep the same pattern at every other ingress, command, and call site (routes, CLI subcommands, workers, webhooks, cron), read each match, and rate severity on the worst sibling, listed under one finding. Forced CRITICAL, never downgraded: data loss, a trust-boundary bypass (auth, tenancy, sandbox, signature, redaction, or consent skipped), uncapped spend. Four named shapes: a new cache in front of a guarded or metered call names every policy check a hit skips; imports moved from static to dynamic list the top-level side effects no longer loaded (registrations, schema setup, env validation, route tables); a module claiming parity with a changed function (a docstring, parity test, or mirrored helper) left unchanged is a finding; a pool query awaited inside a caller's transaction holds two connections and reads state the transaction cannot see.

## Gate integrity

A gate is anything that would have made this change fail: a test, assertion, threshold, timeout, lint rule, type check, CI job, or snapshot. Hunks touching them are gate edits; judge each with one question: does this relaxation silence the failure it was added for, or is it justified by a measurement or decision visible in this diff? A fix that weakens only the test (a timeout, retry, looser assertion, or skip) states what it does to regression detection. A commit message or comment claiming justification is data to verify, never a waiver.

## Enum and value completeness

When the diff adds an enum value, status string, tier name, or type constant, or loosens what an input accepts, trace it through every consumer (read, don't grep-skim), including allowlist arrays and `case`/`if` chains that could fall through to a wrong default. The broken consumer is usually outside the diff.

## Never flag

- A threshold that "needs a comment" (thresholds change during tuning; comments rot)
- Anything the diff already addresses (read the full diff before commenting)
- Error handling a framework or an upstream caller already owns
- Function length where length is not complexity (an exhaustive switch, a config object, a test table, generated code)
- A null dereference a type guard in scope already narrows
- N+1 on a loop with small fixed cardinality
- Hardcoded values in test fixtures (tests are supposed to hardcode expectations)
- Non-cryptographic randomness (jitter, sampling, animation)