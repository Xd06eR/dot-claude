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

# Engineering Rules

> Engineering rules for coding work: a commit-time security gate, testing policy, a quality floor, and per-language notes.

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

## Testing

- **Coverage target:** ≥80% baseline for new code. Coverage is a floor, not evidence. Language-specific testing rules may refine targets per layer. Test weight tracks the change: new behavior and logic carry the baseline and the TDD loop; reversible, low-impact changes that mirror existing implementation need no new tests. Broaden or repeat testing only when new changes, failures, or unresolved concerns justify it.

## Development workflow

- **The quality floor never cuts:** trust-boundary input validation, error handling that prevents data loss, security measures, accessibility basics, or anything explicitly requested.

## Python

- Ship `py.typed` in typed packages so downstream type-checkers read the annotations.
- **Verification:** `ruff check` → `ruff format` → `mypy` → `pytest`
- **Validation:** use field constraints instead of hand-written validation when Pydantic can express the rule.
- Enable ruff's `S` rule family (the flake8-bandit rules) in project config: scanning runs within the existing `ruff check` step. Standalone bandit covers rules ruff has not implemented (some S4xx are preview-only); use it only for those.
- Measure coverage with `pytest --cov=src` (pytest-cov).

## React

- Do not use `useEffect`; reach for derived state during render, event handlers, or a server-state library instead.
- Accessibility patterns live in the `frontend-a11y` skill; E2E in the `e2e-testing` skill.

### XSS via `dangerouslySetInnerHTML`

CRITICAL: every usage is a code review halt: first-party input (document the source); user-derived input sanitized at the same call site (API-boundary sanitization only when every consumer is verified); sanitizer allowlists tags, never denylists.
