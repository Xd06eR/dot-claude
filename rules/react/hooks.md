---
paths:
  - "**/*.tsx"
  - "**/*.jsx"
  - "**/hooks/**/*.ts"
  - "**/hooks/**/*.js"
  - "**/use-*.ts"
  - "**/use-*.tsx"
---

# React Hooks

> This file covers **React hooks** (`useState`, `useEffect`, `useMemo`, `useCallback`, custom hooks) — NOT the Claude Code `hooks/` runtime system.

## Rules of Hooks

Enforce `eslint-plugin-react-hooks` with `react-hooks/rules-of-hooks` set to error.

1. Hooks only at the top level of a function component or another hook
2. Never in loops, conditionals, nested functions, or after early returns
3. Always called in the same order on every render
4. Only inside React function components or custom hooks (functions starting with `use`)

## `useEffect` — When NOT to Use

`useEffect` is for synchronizing with external systems (subscriptions, browser APIs, third-party libraries). It is **not** the right tool for:

- Derived state — compute it during render
- Transforming data for rendering — compute it during render
- Resetting state when a prop changes — use a `key` on the parent or derive from props
- Notifying parents of state changes — call the callback in the event handler
- Initializing app-level singletons — call the function at module scope or in `main.tsx`

```tsx
// WRONG: effect for derived state
const [fullName, setFullName] = useState("");
useEffect(() => {
  setFullName(`${first} ${last}`);
}, [first, last]);

// CORRECT: derive during render
const fullName = `${first} ${last}`;
```

## Dependency Arrays

- Always include every reactive value referenced inside the effect/callback
- Enable `react-hooks/exhaustive-deps` lint rule — never silence it without a comment explaining why
- If the dep array grows unwieldy, the effect is doing too much — split it
- Stable identity for functions passed in deps: wrap in `useCallback` only when the function is itself a dependency of another hook or passed to a memoized child
- Non-reactive "event" logic inside an effect (analytics, logging) belongs in `useEffectEvent` — it reads latest values without joining the dep array

## Cleanup

Every subscription, interval, listener, or in-flight request must clean up.

```tsx
useEffect(() => {
  const controller = new AbortController();
  fetch(url, { signal: controller.signal }).then(handleResponse);
  return () => controller.abort();
}, [url]);
```

```tsx
useEffect(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);
}, []);
```

Missing cleanup = race conditions when deps change, memory leaks on unmount.

## `useMemo` and `useCallback` — When Worth It

Default position: **do not memoize**. Add `useMemo` / `useCallback` only when:

1. The value is passed to a `React.memo`-wrapped child as a prop, and identity matters
2. The value is a dependency of another `useEffect` / `useMemo` / `useCallback`
3. The computation is measurably expensive (profile before assuming)

If the project enables the React Compiler, rely on it for memoization; keep `useMemo`/`useCallback` as manual escape hatches only.

## Custom Hooks

Extract a custom hook when:

- The same hook sequence (state + effect + computed) appears in 2+ components
- The logic has a clear, nameable purpose (`useDebounce`, `useOnClickOutside`, `useLocalStorage`)
- You want to test the logic independently of any component

Do NOT extract when:

- It would have a single caller — inline it
- The "hook" is just `useState` with a different name — adds indirection, no value

```tsx
export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
```

## `useState` Patterns

- Functional updater when the new state depends on the old: `setCount(c => c + 1)` — required inside async or batched contexts
- Use `useReducer` once state transitions are conditional on the previous state or there are 3+ related values

## `useRef` Patterns

- DOM refs for imperative APIs (focus, scroll, third-party libs)
- Mutable container that does not trigger re-render (timer ids, previous values, "is mounted" flags)
- Never read or write `ref.current` during render — only inside effects or event handlers
- `useImperativeHandle` only when exposing a child API to a parent ref — last-resort escape hatch

## `useSyncExternalStore`

Use this hook to subscribe to any external store (browser API, third-party state lib, custom event emitter).

## React 19 Additions

- `use()` — unwrap promises and contexts inline. Usable conditionally (only hook with that property).
- `useFormStatus()` / `useActionState()` — form submission state without prop drilling
- `useOptimistic()` — optimistic UI updates while a server action is pending
- `useTransition()` (added in React 18, still preferred in 19+) — mark non-urgent state updates so urgent ones stay responsive

When the project targets React 19+, prefer these over hand-rolled equivalents.

## Lint Configuration

Use `eslint-plugin-react-hooks` v6+ flat config: `reactHooks.configs.flat.recommended` — it enables `rules-of-hooks` and `exhaustive-deps` plus the compiler-powered rules. Treat `exhaustive-deps` warnings as errors in CI for new code.
