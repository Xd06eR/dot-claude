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

## Mandatory security checks

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

The `security-guidance` plugin auto-runs pattern warnings on edit and security review on diff and commit.

## Secret management

- ALWAYS use environment variables or a secret manager
- Validate that required secrets are present at startup

## LLM integration

Assume prompt injection succeeds: anything in the context may be steering the model, so every security control is enforced outside it, in deterministic code. Model output is untrusted input, and so is everything interpolated into a prompt.

- [ ] Completions validated against a schema before use; retries bounded; final failure rejects, never falls through to unvalidated output
- [ ] Model output never reaches `eval`/`exec`, a shell, raw SQL, a file path, an outbound URL, or rendered HTML unvalidated; model-written code runs only in a sandbox
- [ ] Model output treated as unverified claims; load-bearing facts cross-checked against authoritative sources before acting on them
- [ ] Untrusted content (user text, retrieved documents, tool results, tool descriptions) never enters the system or instruction role; delimiters and data-marking are hygiene, not a boundary
- [ ] Model and tool output persisted into memory or instructions re-enters as untrusted input, never as trusted context
- [ ] Tool-call arguments validated server-side, with authorization checked against the end user's entitlements, never the agent's own service credentials
- [ ] Tool permissions scoped to the task; irreversible, spending, credential-touching, or externally-communicating actions gated behind human confirmation
- [ ] Retrieval enforces the caller's permissions inside the retrieval query (namespace or metadata filter), never by pruning results afterward or asking the model to withhold them
- [ ] System prompts, tool schemas, and hidden context carry no secrets and no authorization logic; treat them all as disclosable
- [ ] Token, spend, and recursion caps on every model call and agent loop
- [ ] Model, provider, plugin, and dataset sources vetted and pinned; third-party artifacts integrity-checked (signing, file hashes) before load
- [ ] Prompts and completions redacted before logging; no secrets, tokens, or PII in traces

## Security response protocol

If security issue found:
1. STOP immediately
2. Dispatch the `security-auditor` agent for a structured audit, or audit against the checklist above
3. Fix CRITICAL issues before continuing
4. Rotate any exposed secrets
5. Review entire codebase for similar issues