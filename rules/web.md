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

Banned syntax, each with its replacement:

- `eval`: parse the data or use a lookup table instead.
- `var`: use `const`; `let` only when reassignment is required.
- `as any` or `as unknown as T`: narrow with a type guard, use `unknown`, or fix the type at the boundary.
- Non-null assertion `!`: narrow with a guard or handle the null case; `!` is a suppressed type error.
- `@ts-ignore`, `@ts-expect-error`, or `eslint-disable` without a reason: every suppression carries its justification inline on the same line; a suppression that masks a correctness failure gets fixed, not kept.
- Loosening `strict` or adding `any` to make `tsc` pass: fix the type; a green checkmark bought with a wider type is a defect.
- Every promise is awaited, returned, or given a terminal `.catch()`; `void` or an empty `.catch()` that silences a linter is a refusal to fix, not a fix. Deliberate fire-and-forget carries its reason inline.
- One module, one async style: new code uses async/await; a `.then()` chain inside an async function is a defect (it escapes the surrounding try/catch).
- `JSON.parse` returns `unknown`: narrow at the boundary with a type guard or schema parser; a cast from parse output is `as any` by another name. Discriminated unions close with a `never` exhaustiveness check.

## UI frameworks

- Do not use `useEffect`; reach for derived state during render, event handlers, or a server-state library instead.
- The exhaustive-deps autofix is not a fix: it changes behavior more often than it repairs. Resolve the warning by reading the code and choosing `useEffectEvent`, render-time derivation, or a ref.
- Every HTML, URL, or attribute sink (`innerHTML`, `javascript:` URLs, unencoded values in attributes or HTML template literals) follows the same halt rule as `dangerouslySetInnerHTML` below: sanitize at the call site or do not use it.
- Async UI renders loading, error, and empty states, not only the happy path; `fetch` checks `response.ok` before parsing: it resolves on a 500.
- Every mutation defines its error path; an optimistic update pairs with a rollback (`useOptimistic`'s automatic revert, TanStack `onError` restoring the snapshot).
- With React Compiler enabled, the react-hooks v7 compiler rules run at error level; `"use no memo"` carries an inline reason like any other suppression.

### XSS via `dangerouslySetInnerHTML`

CRITICAL: every usage is a code review halt: first-party input (document the source); user-derived input sanitized at the same call site (API-boundary sanitization only when every consumer is verified); sanitizer allowlists tags, never denylists.
