---
paths:
  - "**/*.html"
  - "**/*.tsx"
  - "**/*.jsx"
  - "**/next.config.*"
  - "**/middleware.ts"
  - "**/middleware.js"
  - "**/vercel.json"
---

# Web Security Rules

> This file extends [common/security.md](../common/security.md) with web-specific security content.

## Content Security Policy

Always configure a production CSP.

### Nonce-based CSP

Use a per-request nonce for scripts instead of `'unsafe-inline'`.

```text
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-{RANDOM}' 'strict-dynamic';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: https:;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://*.example.com;
  frame-src 'none';
  frame-ancestors 'none';
  object-src 'none';
  base-uri 'self';
```

Adjust origins to the project; do not cargo-cult this block unchanged.

- Every `<script>` tag, static or inline, must carry the nonce: with `strict-dynamic`, CSP3 browsers ignore host sources and `'unsafe-inline'`, so a nonce-less script is blocked even when its origin matches `'self'`
- Browsers without CSP3 support (Safari <15.4, IE11, pre-2016 Chrome/Firefox) ignore `strict-dynamic` and enforce the host allowlist, so dynamically-loaded scripts get no coverage there unless their hosts are listed explicitly

## XSS prevention

Base rules per [common/security.md](../common/security.md); React sinks per [react/security.md](../react/security.md). Sanitize user HTML with a vetted sanitizer library when absolutely necessary.

## Third-party scripts

- Load asynchronously
- Use SRI when serving from a CDN
- Re-audit when adding or upgrading a third-party script
- Prefer self-hosting for critical dependencies when practical

## HTTPS and headers

```text
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

## Forms

- Validate client and server side
- Prefer honeypots or light anti-abuse controls over heavy-handed CAPTCHA defaults
