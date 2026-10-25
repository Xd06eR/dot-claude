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

# Common Rules

> Cross-language engineering rules; the language layers extend this file and carry layout, layer names, and entry-file mechanics.

## Architecture

- Import a feature or package only through its public entry file (`index.ts` barrel, `__init__.py`), never deep-import a sibling's internals; entry files carry re-exports only, so internals stay replaceable.
- Import direction flows one way, from the entry layer toward the domain; shared code imports nothing from feature code.
- Layer data models don't leak: transport, domain, persistence, and view models stay separate types; convert at the boundary.
- Circular imports are banned. When two modules need each other, extract the shared concept into a third module; a lazy or dynamic work-around import signals a boundary problem.

### Concurrency and failure

- Side-effecting operations that can be retried or duplicated are idempotent (key, token, or uniqueness constraint).
- Every external call carries a timeout and a cancellation path; retries are bounded with backoff.
- Transaction boundaries are explicit; a partial write never passes as success.
- Queues and streams apply backpressure; no unbounded buffers.
- Every acquired resource has a release path on success, error, and cancel.

## Coding style

- **US English spelling:** -ize/-or forms (`normalize`, `color`, `behavior`).
- **Simplicity:** plain over clever unless cleverness is load-bearing.
- **Formatting:** the formatter owns code syntax.
- **Naming:** abbreviate in small scope, spell out cross-module; the language-specific rules override these defaults.
- **Immutability:** prefer immutable patterns by default: create new objects rather than mutating shared state or inputs; local accumulators and hot paths may mutate.
- **File organization:** MANY SMALL FILES > FEW LARGE FILES: 200-400 lines typical, organized by feature/domain, not by type.
- **Error handling and input validation:** handle errors at the level that can act; never swallow one silently; UI gets user-safe actionable messages, logs get the detail. Validate external data at the system boundary, with a schema where available; never trust it.
- **API response format:** match the project's existing response shape. When it has none, return errors as RFC 9457 problem details; whatever the shape, keep it consistent across endpoints.

## Security

### Mandatory security checks

Before ANY commit:
- [ ] No hardcoded secrets (API keys, passwords, tokens)
- [ ] All user inputs validated
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (sanitized HTML)
- [ ] CSRF tokens on cookie-authenticated web apps (N/A for header-token APIs)
- [ ] Authentication/authorization verified
- [ ] Auth/access checks fail closed on error; security-relevant events (auth failures, denials) logged
- [ ] Rate limiting / anti-automation on auth and resource-intensive endpoints
- [ ] Error messages don't leak sensitive data
- [ ] Dependencies vetted: audit run on add (`npm audit` / `pip-audit`), versions pinned, new packages checked for maintenance and provenance
- [ ] SSRF guards on outbound fetches; path-traversal guards on file paths

### Secret management

- ALWAYS use environment variables or a secret manager
- Validate that required secrets are present at startup

### LLM integration

Assume prompt injection succeeds: anything in the context may be steering the model, so every security control is enforced outside it, in deterministic code. Model output is untrusted input, and so is everything interpolated into a prompt.

For agent systems (tools, memory, orchestration), separate planning from execution so injected content cannot both decide and act, and give the agent a real kill switch: rollback for its actions and a halt it cannot bypass.

- [ ] Completions validated against a schema before use; retries bounded; final failure rejects, never falls through to unvalidated output
- [ ] Model output never reaches `eval`/`exec`, a shell, raw SQL, a file path, an outbound URL, or rendered HTML unvalidated; model-written code runs only in a sandbox
- [ ] Model output treated as unverified claims; load-bearing facts cross-checked against authoritative sources before acting on them
- [ ] Untrusted content (user text, retrieved documents, tool results, tool descriptions) never enters the system or instruction role; delimiters and data-marking are hygiene, not a boundary
- [ ] Model and tool output persisted into memory or instructions re-enters as untrusted input, never as trusted context
- [ ] Tool-call arguments validated server-side, with authorization checked against the end user's entitlements, never the agent's own service credentials
- [ ] Tool permissions scoped to the task; irreversible, spending, credential-touching, or externally-communicating actions gated behind human confirmation
- [ ] Retrieval enforces the caller's permissions inside the retrieval query (namespace or metadata filter), never by pruning results afterward or asking the model to withhold them
- [ ] System prompts, tool schemas, and hidden context carry no secrets and no authorization logic; treat them all as disclosable
- [ ] Token, spend, and recursion caps on every model call and agent loop; the paid provider account gets a dashboard hard cap and a 50% alert
- [ ] Model, provider, plugin, and dataset sources vetted and pinned; third-party artifacts integrity-checked (signing, file hashes) before load
- [ ] Prompts and completions redacted before logging; no secrets, tokens, or PII in traces

### Security response protocol

If security issue found:
1. STOP immediately
2. Dispatch the `security-auditor` agent for a structured audit, or audit against the checklist above
3. Fix CRITICAL issues before continuing
4. Rotate any exposed secrets
5. Review entire codebase for similar issues

## Testing

- **Coverage target:** ≥80% baseline for new code. Coverage is a floor, not evidence. Language-specific testing rules may refine targets per layer. Test weight tracks the change: new behavior and logic carry the baseline and the TDD loop; reversible, low-impact changes that mirror existing implementation need no new tests. Broaden or repeat testing only when new changes, failures, or unresolved concerns justify it.
- **Test-Driven Development:** the red → green loop and the house extras (seams, the tautological-test anti-pattern) live in the `tdd` skill.
- **Troubleshooting:** when tests fail, fix the implementation, not the test (unless the test is wrong); use the `diagnosing-bugs` skill for root cause analysis on hard-to-debug failures. A flaky test is a defect: fix the test, never mute it with retries.

## Development workflow

- **Code navigation:** use LSP for definitions, references, and symbols; grep is for text patterns.
- **Task tracking:** track multi-step work in a manual file: out-of-order, missing, extra, or wrong-granularity steps mean the task was misread. Fix the understanding, not just the list.
- **Reuse ladder, in order:** an existing helper or pattern in the codebase, then stdlib, then a native platform feature, then an already-installed dependency; a new dependency only when the gap is real (never for what a few lines can do). One line when one line works; otherwise the minimum code that works.
- **Minimality never shortens the reading:** trace the whole flow, every file the change touches, before choosing the minimal change; a small diff in the wrong place is a second bug.
- **Bug fixes go to the root cause:** grep every caller of the code you are about to change; fix the shared cause once. Patching only the ticketed path leaves sibling callers broken.
- **Ship the minimal version and challenge the rest:** on a complex request, deliver the minimal version and state what was skipped and when to add it ("Did X; Y covers it. Need full X? Say so."); never stall on an answer you can default.
- **Deletion over addition:** when two fixes are otherwise equal, take the one that removes code.
- **Delete over compat:** an internal refactor deletes the superseded path outright, with no compat layers, deprecated shims, or double-write bridges for internal callers. Compatibility of external contracts (public APIs, migrations, persisted formats) is a separate, explicit decision.
- **The ladder never cuts:** trust-boundary input validation, error handling that prevents data loss, security measures, accessibility basics, or anything explicitly requested.
- **Research & reuse:** when the reuse ladder lands on a new capability or dependency, call the Skill tool with "search-first".
- **Pull request workflow:** when creating PRs, route through `ship`: it owns the readiness gates, the PR body, and the exact command set.
