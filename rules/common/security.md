# Security Guidelines

## Mandatory Security Checks

Before ANY commit:
- [ ] No hardcoded secrets (API keys, passwords, tokens)
- [ ] All user inputs validated
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (sanitized HTML)
- [ ] CSRF protection enabled
- [ ] Authentication/authorization verified
- [ ] Rate limiting on all endpoints
- [ ] Error messages don't leak sensitive data

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
2. Run the `review` skill for structured audit, or audit against the checklist above
3. Fix CRITICAL issues before continuing
4. Rotate any exposed secrets
5. Review entire codebase for similar issues