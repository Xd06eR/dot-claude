---
paths:
  - "**/*.html"
  - "**/*.tsx"
  - "**/*.jsx"
---

# Web Security Rules

> This file extends [common/index.md](../common/index.md) with web-specific security content. Header configuration (CSP, HTTPS) lives in [security-config.md](security-config.md).

## XSS prevention

Base rules per [common/index.md](../common/index.md); React sinks per [react/index.md](../react/index.md#security). Sanitize user HTML with a vetted sanitizer library when absolutely necessary.

## Third-party scripts

- Use SRI when serving from a CDN
- Re-audit when adding or upgrading a third-party script
- Prefer self-hosting for critical dependencies when practical

## Forms

- Prefer honeypots or light anti-abuse controls over heavy-handed CAPTCHA defaults
