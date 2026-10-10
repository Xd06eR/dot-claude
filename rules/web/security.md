---
paths:
  - "**/*.html"
  - "**/*.tsx"
  - "**/*.jsx"
---

# Web Security Rules

> This file extends [common/common.md](../common/common.md) with web-specific security content. Header configuration (CSP, HTTPS) lives in [security-config.md](security-config.md).

## XSS prevention

Base rules per [common/common.md](../common/common.md); React sinks per [react/react.md](../react/react.md#security). Sanitize user HTML with a vetted sanitizer library when absolutely necessary.

## Third-party scripts

- Use SRI when serving from a CDN
- Re-audit when adding or upgrading a third-party script
- Prefer self-hosting for critical dependencies when practical

## Forms

- Prefer honeypots or light anti-abuse controls over heavy-handed CAPTCHA defaults
