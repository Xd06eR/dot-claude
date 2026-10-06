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

# React Architecture

> React-specific architecture. For hook-specific rules see [hooks.md](./hooks.md).

## Component patterns

Container/presentational (a data-owning wrapper over a pure props-in view) is one option where the boundary is real, not a default.

For related controls (Tabs, Accordion, Menu), use compound components sharing state via Context.

## State location decision tree

Local → lift to nearest common ancestor → Context for low-frequency reads only → external store for high-frequency sharing → server-derived data to a server-state library, never application state.

## Server / Client Component boundary (RSC, Next.js App Router)

- Server Components are the default: they run on the server, do not ship to the client, and can `await` directly
- Client Components opt in with `"use client"`, only when the file uses state, effects, refs, browser APIs, or event handlers
- Data flows down: a Server Component can render a Client Component and pass serializable props
- A Client Component cannot import a Server Component, but it can receive one via `children` or named slots

```tsx
// Server (default)
export default async function Page() {
  const user = await fetchUser();
  return <UserClient user={user} />;
}

// Client
"use client";
export function UserClient({ user }: { user: User }) {
  const [tab, setTab] = useState("profile");
  return <Tabs value={tab} onChange={setTab}>{user.name}</Tabs>;
}
```

- Never import `"server-only"` packages (DB clients, secrets) from a Client Component file: wrap them in a Server Component or Server Action
- Mark sensitive modules with `import "server-only"` so the bundler errors if a client file imports them
- `"use client"` sits on line 1 before imports; a `"use server"` action file never imports a Client Component file; server-only code is never re-exported through a client module (the bundler silently includes it)

## Suspense + Error Boundaries

Every Suspense boundary needs an Error Boundary above it. The pair covers pending and error states.

```tsx
<ErrorBoundary fallback={<ErrorView />}>
  <Suspense fallback={<Skeleton />}>
    <UserDetails id={id} />
  </Suspense>
</ErrorBoundary>
```

- Place Suspense boundaries close to where data is needed, not at the route root
- Multiple narrower boundaries reveal loaded content progressively
- Error Boundary must be a Class Component (React 19 has no functional equivalent) OR use a library wrapper such as `react-error-boundary`

## Refs and Forwarding (React 19+)

React 19 lets function components accept `ref` as a regular prop. `forwardRef` is no longer required.

```tsx
export function Input({ ref, ...rest }: { ref?: React.Ref<HTMLInputElement> } & InputProps) {
  return <input ref={ref} {...rest} />;
}
```

Older codebases on React 18 still need `forwardRef` (slated for deprecation: prefer ref-as-prop when upgrading).

## Skill reference

See `frontend-a11y` skill for accessibility patterns.
