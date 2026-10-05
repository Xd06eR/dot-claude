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

CRITICAL: treat every usage as a code review halt.

Audit checklist for every `dangerouslySetInnerHTML` call:

- Is the input always under our control? Document the source.
- If user-derived: is it sanitized at the **same call site**? (Sanitization at the API boundary is acceptable only if every consumer is verified.)
- Is the sanitizer config allowlisting tags, not denylisting?

## Unsafe URL schemes

```tsx
// CRITICAL: javascript: URL injection
<a href={user.website}>Visit</a>   // if user.website = "javascript:alert(1)"

// CORRECT: validate scheme
function safeUrl(url: string): string | undefined {
  try {
    const parsed = new URL(url);
    if (["http:", "https:", "mailto:"].includes(parsed.protocol)) return url;
  } catch {
    return undefined;
  }
}
<a href={safeUrl(user.website)}>Visit</a>
```

React 19+ throws on `javascript:` URLs in `href`/`src`; validate schemes anyway: `data:` and other schemes, and non-React sinks, are not covered.

## `target="_blank"` without `rel`

`<a target="_blank">` without `rel="noopener noreferrer"` lets the target page access `window.opener` and run navigation hijacks.

```tsx
// WRONG
<a href={externalUrl} target="_blank">External</a>

// CORRECT
<a href={externalUrl} target="_blank" rel="noopener noreferrer">External</a>
```

Modern browsers default to `noopener` when `target="_blank"`, but do not rely on browser defaults — be explicit.

## Server Action input validation

Server Actions (`"use server"`) run with the same trust level as a public API endpoint. Validate every input.

- Anything passed across the RSC boundary to a Client Component ships to the browser: pass IDs, not records with internal fields

## Secret exposure via env vars

- React Router (framework) / Remix: `VITE_*` (Vite-built apps) is public; `process.env` is server-side only and reaches the client only via loader data.

Audit on every PR that touches env vars: would this string in the public bundle be a problem?

## Authentication / Authorization

- Never trust client-set state to gate sensitive UI. Render-gating in JSX prevents display, not access: the API must enforce.
- Use double-submit cookies or origin verification for form actions when not using framework defaults

## Content Security Policy (CSP)

Configure server-side: full nonce-based header block in [web/security.md](../web/security.md#content-security-policy). React/SSR specifics:

- Avoid `unsafe-inline` and `unsafe-eval` in `script-src`
- For SSR with inline scripts (Next.js streaming, hydration data), use per-request nonces: both Next.js and Remix support nonce injection
- `style-src 'unsafe-inline'` is often unavoidable for CSS-in-JS libraries: document the tradeoff

## Prototype pollution

Spreading untrusted JSON defines own properties (mass assignment: unexpected keys overwrite state). True prototype pollution needs a recursive-merge sink (`lodash.merge`, a deep `Object.assign`); audit those call sites hardest. Either way, parse before merging.

## SSR template injection

When using `renderToString` or `renderToPipeableStream`:

- All values rendered inside JSX are escaped by React (safe)
- Values passed to `dangerouslySetInnerHTML` are NOT escaped: same rules as client
- Manually constructed HTML wrappers around the React output must be escaped or sanitized: never concatenate user input into the surrounding HTML template

## Third-party components

- Dependency vetting per [common/security.md](../common/security.md#mandatory-security-checks); UI-library checks below
- Check that the library does not internally use `dangerouslySetInnerHTML` on its input (e.g., rich text editors)
- Review changelogs before major upgrades
- Be wary of components that accept HTML strings as props
