---
paths:
  - "**/*.tsx"
  - "**/*.jsx"
  - "**/components/**/*.ts"
  - "**/components/**/*.js"
  - "**/app/**/*.ts"
  - "**/pages/**/*.ts"
  - "**/hooks/**/*.ts"
  - "**/hooks/**/*.js"
---

# React Security

> This file extends [typescript/security.md](../typescript/security.md) and [common/security.md](../common/security.md) with React specific content.

## XSS via `dangerouslySetInnerHTML`

CRITICAL: every usage is a code review halt: input under our control (document the source); user-derived input sanitized at the same call site (API-boundary sanitization only when every consumer is verified); sanitizer allowlists tags, never denylists.

## Unsafe URL schemes

Validate user-controlled URLs with a scheme allowlist (`http:`/`https:`/`mailto:`) via `new URL()` before `href`/`src`: `javascript:` injection executes on click. React 19 throws on `javascript:` URLs; validate anyway (`data:` and non-React sinks are not covered).

## Server Action input validation

Server Actions (`"use server"`) run with the same trust level as a public API endpoint. Validate every input.

- Anything passed across the RSC boundary to a Client Component ships to the browser: pass IDs, not records with internal fields

## Secret exposure via env vars

- React Router (framework) / Remix: `process.env` is server-side only and reaches the client only via loader data.
- Prefixed vars (`NEXT_PUBLIC_*`, `VITE_*`) ship to the client bundle; on every env-touching diff, ask whether the string is publish-safe.

## Authentication / Authorization

- Render-gating in JSX hides UI, it does not restrict access: the API must enforce. Cookie-authenticated form actions without framework defaults need double-submit cookies or origin verification.

## Content Security Policy (CSP)

Configure server-side: full nonce-based header block in [web/security-config.md](../web/security-config.md#content-security-policy). React/SSR specifics:

- All inline scripts in an SSR app (streaming/hydration payloads, theme bootstrap, pixels) need the per-request nonce; Next.js and Remix support nonce injection
- `style-src 'unsafe-inline'` is often unavoidable for CSS-in-JS libraries: document the tradeoff

## SSR template injection

When using `renderToString` or `renderToPipeableStream`:

- JSX escapes rendered values; `dangerouslySetInnerHTML` output is not (client rules apply). Never concatenate user input into the HTML template around the React output.

## Third-party components

- Dependency vetting per [common/security.md](../common/security.md#mandatory-security-checks); UI-library checks below
- Check that the library does not internally use `dangerouslySetInnerHTML` on its input (e.g., rich text editors)
- Be wary of components that accept HTML strings as props
