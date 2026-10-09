---
paths:
  - "**/next.config.*"
  - "**/middleware.ts"
  - "**/middleware.js"
  - "**/vercel.json"
---

# Web Security Configuration

> Response-header security (CSP, HTTPS headers) for server config files; extends [common/security.md](../common/security.md). Component and page-level web security lives in [security.md](security.md).

## Content Security Policy

Always configure a production CSP with a per-request nonce for scripts instead of `'unsafe-inline'`; `'unsafe-eval'` never appears in any directive:

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
- The host allowlist alongside `strict-dynamic` serves pre-CSP3 browsers only; drop it if the baseline is CSP3-only

## HTTPS and headers

```text
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```
