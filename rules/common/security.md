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

The `security-guidance` plugin runs automatically and provides:
- **Pattern warnings** — instant regex-based alerts on dangerous patterns during Edit/Write
- **LLM diff review** — automatic security review of each turn's changes
- **Commit review** — agentic review traces data flow across files on `git commit`

## Security Response Protocol

If security issue found:
1. STOP immediately
2. Dispatch the `security-auditor` agent for a structured audit, or audit against the checklist above
3. Fix CRITICAL issues before continuing
4. Rotate any exposed secrets
5. Review entire codebase for similar issues