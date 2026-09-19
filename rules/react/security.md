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

```tsx
// CRITICAL: unsanitized user input
<div dangerouslySetInnerHTML={{ __html: userBio }} />

// CORRECT options:
// 1. Render as text
<div>{userBio}</div>

// 2. Render parsed markdown via a library that sanitizes
<ReactMarkdown>{userBio}</ReactMarkdown>

// 3. If raw HTML is required, sanitize first with DOMPurify
import DOMPurify from "isomorphic-dompurify";
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userBio) }} />
```

Audit checklist for every `dangerouslySetInnerHTML` call:

- Is the input always under our control? Document the source.
- If user-derived: is it sanitized at the **same call site**? (Sanitization at the API boundary is acceptable only if every consumer is verified.)
- Is the sanitizer config allowlisting tags, not denylisting?

## Unsafe URL schemes

`javascript:` and `data:` URLs in `href`, `src`, and `xlink:href` execute arbitrary code.

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
  return undefined;
}
<a href={safeUrl(user.website)}>Visit</a>
```

React 19+ throws on `javascript:` URLs in `href`/`src`; validate schemes anyway — `data:` and other schemes, and non-React sinks, are not covered.

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

```tsx
"use server";
import { z } from "zod";

const Input = z.object({
  email: z.email(),
  age: z.number().int().min(0).max(120),
});

export async function updateUser(_state: unknown, formData: FormData) {
  const parsed = Input.safeParse({
    email: formData.get("email"),
    age: Number(formData.get("age")),
  });
  if (!parsed.success) return { error: parsed.error.flatten() };
  // ...
}
```

- Authenticate inside the action — do not trust the client-side route gate
- Authorize: confirm the current user has permission for the specific record they are mutating
- Rate limit sensitive actions
- Middleware is not authorization — re-check auth inside every Server Action and data-owning layout
- Anything passed across the RSC boundary to a Client Component ships to the browser — pass IDs, not records with internal fields

## Secret exposure via env vars

Prefixed env vars are bundled into the client. Treat them as public.

| Framework | Public prefix | Private |
|---|---|---|
| Next.js | `NEXT_PUBLIC_*` | All others |
| Vite | `VITE_*` | `.env` server-side only |
| React Router (framework) / Remix | `VITE_*` (Vite-built apps) | All others; `process.env` server-side only, reaches the client only via loader data |

```ts
// CRITICAL: secret leaked to client bundle
const apiKey = process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY;
```

Audit on every PR that touches env vars: would this string in the public bundle be a problem?

## Authentication / Authorization

- Never store sessions in `localStorage` — accessible to any XSS. Use httpOnly secure cookies.
- Never trust client-set state to gate sensitive UI. Render-gating in JSX prevents display, not access — the API must enforce.
- CSRF: cookie-based auth requires CSRF tokens; `SameSite=Strict`/`Lax` is defense in depth, not a substitute
- Use double-submit cookies or origin verification for form actions when not using framework defaults

## Content Security Policy (CSP)

Configure server-side — full nonce-based header block in [web/security.md](../web/security.md#content-security-policy). React/SSR specifics:

- Avoid `unsafe-inline` and `unsafe-eval` in `script-src`
- For SSR with inline scripts (Next.js streaming, hydration data), use per-request nonces — both Next.js and Remix support nonce injection
- `style-src 'unsafe-inline'` is often unavoidable for CSS-in-JS libraries — document the tradeoff

## Prototype pollution via object spread

```tsx
// WRONG: untrusted JSON spread directly into state
const update = await req.json();
setState({ ...state, ...update });    // attacker controls __proto__

// CORRECT: parse with a schema, or guard keys
const Allowed = z.object({ name: z.string(), email: z.email() });
const parsed = Allowed.parse(await req.json());
setState({ ...state, ...parsed });
```

## SSR template injection

When using `renderToString` or `renderToPipeableStream`:

- All values rendered inside JSX are escaped by React — safe
- Values passed to `dangerouslySetInnerHTML` are NOT escaped — same rules as client
- Manually constructed HTML wrappers around the React output must be escaped or sanitized — never concatenate user input into the surrounding HTML template

## Third-party components

- Dependency vetting per [common/security.md](../common/security.md#mandatory-security-checks); UI-library checks below
- Check that the library does not internally use `dangerouslySetInnerHTML` on its input (e.g., rich text editors)
- Review changelogs before major upgrades
- Be wary of components that accept HTML strings as props

## Source map exposure in production

Production builds should ship without source maps, or with sourcemaps uploaded to an error tracker (Sentry) and stripped from the public bundle. Public source maps leak internal logic and file structure.
