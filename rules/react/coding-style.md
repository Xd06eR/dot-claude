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

# React Coding Style

> This file extends [typescript/coding-style.md](../typescript/coding-style.md) and [common/coding-style.md](../common/coding-style.md) with React specific content.

## File extensions

- `.tsx` for any file containing JSX, even one-liner snippets
- `.ts` for pure logic, custom hooks without JSX, type definitions, utilities
- `.test.tsx` / `.test.ts` mirroring the source file
- Use `.jsx` only when the project intentionally avoids TypeScript: flag every new untyped React file in review

## Naming

- Custom hooks: `useCamelCase` for the symbol; the file follows the project's non-component convention (`use-debounce.ts` or `useDebounce.ts`), applied consistently
- Event handlers: `handleClick`, `handleSubmit` inside the component; the prop that receives it is `onClick`, `onSubmit`

## Component shape

```tsx
type Props = {
  user: User;
  onSelect: (id: string) => void;
};

export function UserCard({ user, onSelect }: Props) {
  return (
    <button type="button" onClick={() => onSelect(user.id)}>
      {user.name}
    </button>
  );
}
```

- Prefer `type Props = {}` for closed component prop shapes
- Use `interface` only when the prop type is extended via declaration merging or exported as a public API extension point

## JSX

- Self-close tags with no children: `<img />`, `<UserCard user={u} />`
- Use fragments `<>...</>` over wrapper `<div>` when no DOM element is needed
- Never put logic inline in JSX when it spans multiple lines: extract to a const above the return or a function

## Server / client boundary (Next.js App Router, RSC)

- Server Components are the default (boundary model per [architecture.md](./architecture.md)); add `"use client"` only when the file uses state, effects, refs, browser APIs, or event handlers
- Place the `"use client"` directive on line 1, before any imports
- Never import a Client Component file from inside a `"use server"` action file
- Never re-export server-only code through a client module (the bundler will silently include it)

## Imports

- React imports first: `import { useState } from "react"`
- Then third-party libs, then absolute project imports, then relative
- Type-only imports: `import type { ReactNode } from "react"` — never mix runtime and type imports in one statement when ESLint's `consistent-type-imports` is configured

## Hooks and state

See [hooks.md](./hooks.md) for the full ruleset. Avoid creating ad-hoc hooks for one-line wrappers: inline the call instead.

- State location (local → lift → Context → external store): see [architecture.md](./architecture.md#state-location-decision-tree)
- Compute during render instead of storing derivable state

## Class components

Forbidden in new code (one exception: error boundaries, per [architecture.md](./architecture.md#suspense--error-boundaries)). Convert legacy class components to function components when touching them for non-trivial changes.

## File layout per component

```
components/UserCard/
  UserCard.tsx
  UserCard.module.css   # or styled-components, or Tailwind classes inline
  UserCard.test.tsx
  index.ts              # re-export only
```

Inline single-file components are fine for trivial presentational pieces. For the wider src/ feature-tree convention, see [web/coding-style.md](../web/coding-style.md#file-organization).