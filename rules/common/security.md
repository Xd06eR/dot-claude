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

# Security Guidelines

## Mandatory Security Checks

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

## Secret Management

- NEVER hardcode secrets in source code
- ALWAYS use environment variables or a secret manager
- Validate that required secrets are present at startup
- Rotate any secrets that may have been exposed

## Automated Security

The `security-guidance` plugin auto-runs pattern warnings on edit and security review on diff and commit.

## Security Response Protocol

If security issue found:
1. STOP immediately
2. Dispatch the `security-auditor` agent for a structured audit (pre-authorized; no confirmation round), or audit against the checklist above
3. Fix CRITICAL issues before continuing
4. Rotate any exposed secrets
5. Review entire codebase for similar issues