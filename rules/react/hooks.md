---
paths:
  - "**/*.tsx"
  - "**/*.jsx"
  - "**/hooks/**/*.ts"
  - "**/hooks/**/*.js"
  - "**/use-*.ts"
  - "**/use-*.tsx"
  - "**/use[A-Z]*.ts"
  - "**/use[A-Z]*.tsx"
---

# React Hooks

> This file covers **React hooks** (`useState`, `useEffect`, `useMemo`, `useCallback`, custom hooks) — NOT the Claude Code `hooks/` runtime system.

## Rules of Hooks

Enforce `eslint-plugin-react-hooks` with `react-hooks/rules-of-hooks` set to error. Hooks only at the top level of components and custom hooks; the plugin enforces the rest.

## `useEffect` — when not to use

`useEffect` is for synchronizing with external systems (subscriptions, browser APIs, third-party libraries). It is **not** the right tool for:

- Resetting state when a prop changes: use a `key` on the parent or derive from props
- Notifying parents of state changes: call the callback in the event handler
- Initializing app-level singletons: call the function at module scope or in `main.tsx`

## Dependency arrays and cleanup

- Include every reactive value in the dep array; `exhaustive-deps` stays on error, never silenced without a comment; an unwieldy array means the effect does too much, split it
- Stable identity for functions passed in deps: wrap in `useCallback` only when the function is itself a dependency of another hook or passed to a memoized child
- Non-reactive "event" logic inside an effect (analytics, logging) belongs in `useEffectEvent`: it reads latest values without joining the dep array
- Every subscription, interval, listener, or in-flight request must clean up: missing cleanup is races on dep change and leaks on unmount

## `useState` and `useReducer`

- Use `useReducer` once state transitions are conditional on the previous state or there are 3+ related values

## React 19 additions

- `use()` — unwrap promises and contexts inline. Callable conditionally, because React classifies it as an API rather than a hook.
- `useFormStatus()` / `useActionState()` — form submission state without prop drilling
- `useOptimistic()` — optimistic UI updates while a server action is pending
- `useTransition()` (added in React 18, still preferred in 19+) — mark non-urgent state updates so urgent ones stay responsive

When the project targets React 19+, prefer these over hand-rolled equivalents.

## Lint configuration

Use `eslint-plugin-react-hooks` v6+ flat config: `reactHooks.configs.flat.recommended`. It enables `rules-of-hooks` and `exhaustive-deps` plus the compiler-powered rules. Treat `exhaustive-deps` warnings as errors in CI for new code.
