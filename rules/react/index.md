---
paths:
  - "**/*.tsx"
  - "**/*.jsx"
  - "**/*.ts"
  - "**/*.js"
---

# React Rules

> React extension of [typescript/index.md](../typescript/index.md) and [common/index.md](../common/index.md). Accessibility patterns in the `frontend-a11y` skill, E2E in the `e2e-testing` skill. Hooks here means React hooks (`useState`, `useMemo`, `useCallback`, custom hooks), NOT the Claude Code `hooks/` runtime system.

## Hooks

Enforce `eslint-plugin-react-hooks` with `react-hooks/rules-of-hooks` set to error. Hooks only at the top level of components and custom hooks; the plugin enforces the rest.

### `useEffect`

Do not use `useEffect`; reach for derived state during render, event handlers, or a server-state library instead.

## Lint configuration

Use `eslint-plugin-react-hooks` v6+ flat config: `reactHooks.configs.flat.recommended`. It enables `rules-of-hooks` and `exhaustive-deps` plus the compiler-powered rules. Treat `exhaustive-deps` warnings as errors in CI for new code.

## Security

### XSS via `dangerouslySetInnerHTML`

CRITICAL: every usage is a code review halt: first-party input (document the source); user-derived input sanitized at the same call site (API-boundary sanitization only when every consumer is verified); sanitizer allowlists tags, never denylists.

## Testing

### Coverage targets

| Layer | Target |
|---|---|
| Pure utility functions | ≥90% |
| Custom hooks | ≥85% |
| Components (presentational) | ≥80% (behavior, not lines) |
| Container components | ≥70% (golden paths + error states) |
| Pages (E2E covered separately) | Smoke test per route minimum |
