---
paths:
  - "**/*.py"
  - "**/*.pyi"
  - "**/pyproject.toml"
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
  - "**/*.cmd"
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
  - "**/package.json"
  - "**/requirements*.txt"
  - "**/tsconfig*.json"
  - "**/*.mdx"
---

# Engineering Rules

## Security

Before ANY commit:

- [ ] No hardcoded secrets (API keys, passwords, tokens)
- [ ] All user inputs validated
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (sanitized HTML)
- [ ] CSRF tokens on cookie-authenticated web apps
- [ ] Every new route/endpoint has an explicit authn/authz decision (authenticated by default; public only by declaration)
- [ ] Auth/access checks fail closed on error; security-relevant events (auth failures, denials) logged
- [ ] Rate limiting / anti-automation on auth and resource-intensive endpoints
- [ ] Error messages don't leak sensitive data
- [ ] Dependencies vetted: audit run on add (`npm audit` / `pip-audit`), versions pinned, new packages checked for maintenance and provenance
- [ ] SSRF guards on outbound fetches; path-traversal guards on file paths
- [ ] No unsanitized user input in log messages (log injection)
- [ ] Auth checks enforced in the data layer, never only in the client
- [ ] Privileged service keys (service-role, admin) never reach the client bundle; client code uses the least-privilege key with row-level security

## Testing

- **Coverage target:** ≥80% baseline for new code. Coverage is a floor, not evidence. Test weight tracks the change: new behavior and logic carry the baseline and the TDD loop; reversible, low-impact changes that mirror existing implementation need no new tests. Broaden or repeat testing only when new changes, failures, or unresolved concerns justify it.
- **Formal verification:** when tests cannot reach the case that breaks a race, retry, state machine, or parser, propose a TLA+ model; when a small critical algorithm must hold for all inputs, propose a Lean proof. Always a proposal, never unilateral: adoption is the user's call.
- **Failing tests are reported, never gamed:** never delete, skip, or weaken a failing test or assertion to make the suite pass; report the failure and fix the code, or surface the conflict to the user.
- **A fix that follows an API change ships a distinguishing test:** at least one test input derived from the change note or release note that separates old from new behavior, not only typical inputs.

## Development workflow

- **The quality floor never cuts:** trust-boundary input validation, error handling that prevents data loss, security measures, accessibility basics, or anything explicitly requested.
- **Search before you build:** before writing a new helper or utility, search the codebase for an existing implementation and extend it; a parallel reimplementation of an existing utility is a defect.
- **A catch earns its place:** a catch names the error it handles and either recovers or re-raises; a catch that swallows (empty body, log-and-forget, silent default) is a defect. A deliberate fallback carries its reason inline and a failure-path test.
- **Every suppression carries its justification inline** (lint disable, type ignore, coverage ignore); a suppression that masks a correctness failure gets fixed, not kept.
- **Concurrency gets a second read:** after writing threaded or async code, re-read it for shared mutable state and un-joined tasks; a concurrency fix ships with a stress or repeated-run test.

## Comments

- A comment carries only the non-obvious why that code cannot express: an invariant, a constraint's origin, or a deliberate shortcut's ceiling and upgrade path.
- A comment that states a rule the code must obey ("do not remove", "keep in sync", "never call before X") is a missing check: encode it as a type, runtime check, test, or lint rule.
- Fix workarounds instead of explaining them; a comment that justifies a shortcut's existence ("for now", "temporary", "hack") marks the spot to fix, not to document.
- No process narration ("// step 2", "// now validate"): structure and names carry the flow.
