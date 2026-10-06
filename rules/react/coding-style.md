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

- `.tsx` for anything containing JSX, `.ts` for pure logic; test files mirror the source extension
- `.jsx` only when the project intentionally avoids TypeScript: flag every new untyped React file in review

## Naming

- Custom hooks: `useCamelCase` for the symbol; the file follows the project's convention, applied consistently. Event handlers: `handleX` inside the component, `onX` for the receiving prop.

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