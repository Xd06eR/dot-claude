---
paths:
  - "**/*.html"
  - "**/*.tsx"
  - "**/*.jsx"
---

# Web Security Rules

> This file extends [common/security.md](../common/security.md) with web-specific security content. Header configuration (CSP, HTTPS) lives in [security-config.md](security-config.md).

## XSS prevention

Base rules per [common/security.md](../common/security.md); React sinks per [react/security.md](../react/security.md). Sanitize user HTML with a vetted sanitizer library when absolutely necessary.

## Third-party scripts

- Load asynchronously
- Use SRI when serving from a CDN
- Re-audit when adding or upgrading a third-party script
- Prefer self-hosting for critical dependencies when practical

## Forms

- Validate client and server side
- Prefer honeypots or light anti-abuse controls over heavy-handed CAPTCHA defaults
