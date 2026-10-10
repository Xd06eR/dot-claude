---
paths:
  - "**/*.tsx"
  - "**/*.jsx"
  - "**/hooks/**/*.ts"
  - "**/hooks/**/*.js"
  - "**/use-*.ts"
  - "**/use-*.tsx"
  - "**/use-*.js"
  - "**/use[A-Z]*.ts"
  - "**/use[A-Z]*.tsx"
  - "**/use[A-Z]*.js"
---

# React Hooks

> This file covers **React hooks** (`useState`, `useEffect`, `useMemo`, `useCallback`, custom hooks) — NOT the Claude Code `hooks/` runtime system.

## Rules of Hooks

Enforce `eslint-plugin-react-hooks` with `react-hooks/rules-of-hooks` set to error. Hooks only at the top level of components and custom hooks; the plugin enforces the rest.

## `useEffect` — when not to use

`useEffect` is for synchronizing with external systems (subscriptions, browser APIs, third-party libraries). Not for: resetting on prop change (use a `key`), notifying parents (call the callback in the event handler), or app-level singleton init (module scope).

## Dependency arrays and cleanup

- `exhaustive-deps` stays on error, never silenced without a comment; an unwieldy array means the effect does too much, split it
- Non-reactive "event" logic inside an effect (analytics, logging) belongs in `useEffectEvent`: it reads latest values without joining the dep array

## `useState` and `useReducer`

- Use `useReducer` once state transitions are conditional on the previous state or there are 3+ related values

## React 19 additions

When the project targets React 19+, prefer `use()` (unwraps promises and contexts inline; conditionally callable, classified as an API not a hook), `useFormStatus()` / `useActionState()` (form submission state), `useOptimistic()`, and `useTransition()` over hand-rolled equivalents.

## Lint configuration

Use `eslint-plugin-react-hooks` v6+ flat config: `reactHooks.configs.flat.recommended`. It enables `rules-of-hooks` and `exhaustive-deps` plus the compiler-powered rules. Treat `exhaustive-deps` warnings as errors in CI for new code.
