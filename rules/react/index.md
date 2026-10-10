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

# React Rules

> React extension of [typescript/index.md](../typescript/index.md) and [common/index.md](../common/index.md). Hooks live in [hooks.md](hooks.md), component testing in [testing.md](testing.md), accessibility patterns in the `frontend-a11y` skill.

## Architecture

Container/presentational (a data-owning wrapper over a pure props-in view) is one option where the boundary is real, not a default. For related controls (Tabs, Accordion, Menu), use compound components sharing state via Context.

### State location decision tree

Local → lift to nearest common ancestor → Context for low-frequency reads only → external store for high-frequency sharing → server-derived data to a server-state library, never application state.

### Server / Client Component boundary (RSC, Next.js App Router)

- Server Components are the default: they run on the server, do not ship to the client, and can `await` directly. Client Components opt in with `"use client"`, only when the file uses state, effects, refs, browser APIs, or event handlers. Data flows down as serializable props; a Client Component cannot import a Server Component but can receive one via `children` or named slots.
- Never import `"server-only"` packages (DB clients, secrets) from a Client Component file: wrap them in a Server Component or Server Action
- Mark sensitive modules with `import "server-only"` so the bundler errors if a client file imports them
- `"use client"` sits on line 1 before imports; a `"use server"` action file never imports a Client Component file; server-only code is never re-exported through a client module (the bundler silently includes it)

### Suspense + Error Boundaries

Every Suspense boundary needs an Error Boundary above it. The pair covers pending and error states.

- Place Suspense boundaries close to where data is needed, not at the route root
- Multiple narrower boundaries reveal loaded content progressively
- Error Boundary must be a Class Component (React 19 has no functional equivalent) OR use a library wrapper such as `react-error-boundary`

### Refs and forwarding (React 19+)

React 19 lets function components accept `ref` as a regular prop. `forwardRef` is no longer required.

Older codebases on React 18 still need `forwardRef` (slated for deprecation: prefer ref-as-prop when upgrading).

## Coding style

- **File extensions:** `.tsx` for anything containing JSX, `.ts` for pure logic; test files mirror the source extension. `.jsx` only when the project intentionally avoids TypeScript: flag every new untyped React file in review.
- **Naming:** hooks, event handlers, and files follow the project's naming convention, applied consistently.
- **Component shape:** prefer `type Props = {}` for closed component prop shapes; use `interface` only when the prop type is extended via declaration merging or exported as a public API extension point.
- **Hooks and state:** see [hooks.md](hooks.md) for the full ruleset; avoid creating ad-hoc hooks for one-line wrappers (inline the call instead); state location per the [decision tree](#state-location-decision-tree); compute during render instead of storing derivable state.
- **Class components:** forbidden in new code (one exception: error boundaries, per [Suspense + Error Boundaries](#suspense--error-boundaries)). Convert legacy class components to function components when touching them for non-trivial changes.

### File layout per component

```
components/UserCard/
  UserCard.tsx
  UserCard.module.css   # or styled-components, or Tailwind classes inline
  UserCard.test.tsx
  index.ts              # re-export only
```

Inline single-file components are fine for trivial presentational pieces. For the wider src/ feature-tree convention, see [typescript/index.md](../typescript/index.md#architecture).

## Security

### XSS via `dangerouslySetInnerHTML`

CRITICAL: every usage is a code review halt: input under our control (document the source); user-derived input sanitized at the same call site (API-boundary sanitization only when every consumer is verified); sanitizer allowlists tags, never denylists.

### Unsafe URL schemes

Validate user-controlled URLs with a scheme allowlist (`http:`/`https:`/`mailto:`) via `new URL()` before `href`/`src`; React 19 throws on `javascript:` URLs, but `data:` and non-React sinks are not covered.

### RSC boundary data exposure

- Anything passed across the RSC boundary to a Client Component ships to the browser: pass IDs, not records with internal fields

### Secret exposure via env vars

- React Router (framework) / Remix: `process.env` is server-side only and reaches the client only via loader data.
- Prefixed vars (`NEXT_PUBLIC_*`, `VITE_*`) ship to the client bundle; on every env-touching diff, ask whether the string is publish-safe.

### Authentication / Authorization

- Render-gating in JSX hides UI, it does not restrict access: the API must enforce. Cookie-authenticated form actions without framework defaults need double-submit cookies or origin verification.

### Content Security Policy (CSP)

Configure server-side: full nonce-based header block in [web/security-config.md](../web/security-config.md#content-security-policy). React/SSR specifics:

- All inline scripts in an SSR app (streaming/hydration payloads, theme bootstrap, pixels) need the per-request nonce; Next.js and Remix support nonce injection
- `style-src 'unsafe-inline'` is often unavoidable for CSS-in-JS libraries: document the tradeoff

### SSR template injection

When using `renderToString` or `renderToPipeableStream`:

- JSX escapes rendered values; `dangerouslySetInnerHTML` output is not (client rules apply). Never concatenate user input into the HTML template around the React output.

### Third-party components

- Dependency vetting per [common/index.md](../common/index.md#mandatory-security-checks); UI-library checks below
- Check that the library does not internally use `dangerouslySetInnerHTML` on its input (e.g., rich text editors)
- Be wary of components that accept HTML strings as props
