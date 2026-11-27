---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
  - "**/*.mjs"
  - "**/*.cjs"
  - "**/*.mts"
  - "**/*.cts"
  - "**/*.vue"
  - "**/*.svelte"
  - "**/*.astro"
  - "**/*.html"
  - "**/*.mdx"
  - "**/tsconfig*.json"
---

# Web Rules

## JavaScript and TypeScript

Banned patterns, each with its replacement:

- **`eval`:** parse the data or use a lookup table instead.
- **`var`:** use `const`; `let` only when reassignment is required.
- **`as any` or `as unknown as T`:** narrow with a type guard, use `unknown`, or fix the type at the boundary.
- **Non-null assertion `!`:** narrow with a guard or handle the null case.
- **Loosening `strict` or adding `any` to make `tsc` pass:** fix the type.
- **Unhandled promises:** every promise is awaited, returned, or given a terminal `.catch()`; `void` or an empty `.catch()` that silences a linter is a defect. Deliberate fire-and-forget carries its reason inline.
- **Mixing async styles:** new code uses async/await; a `.then()` chain inside an async function is a defect.
- **Casting `JSON.parse` output:** narrow at the boundary with a type guard or schema parser. Discriminated unions close with a `never` exhaustiveness check.

## UI frameworks

- **No `useEffect`:** reach for derived state during render, event handlers, or a server-state library instead.
- **The exhaustive-deps autofix is not a fix:** resolve the warning by reading the code and choosing `useEffectEvent`, render-time derivation, or a ref.
- **HTML, URL, and attribute sinks:** `innerHTML`, `javascript:` URLs, and unencoded values in attributes or HTML template literals get the same halt rule as [`dangerouslySetInnerHTML`](#xss-via-dangerouslysetinnerhtml): sanitize at the call site or do not use them.

### XSS via `dangerouslySetInnerHTML`

CRITICAL: every usage is a code review halt: first-party input (document the source); user-derived input sanitized at the same call site (API-boundary sanitization only when every consumer is verified); sanitizer allowlists tags, never denylists.
