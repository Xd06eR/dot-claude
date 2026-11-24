---
paths:
  - "**/*.tsx"
  - "**/*.jsx"
  - "**/*.ts"
  - "**/*.js"
---

# React Rules

> React extension of [typescript/index.md](../typescript/index.md) and [common/index.md](../common/index.md). Accessibility patterns in the `frontend-a11y` skill, E2E in the `e2e-testing` skill. Hooks here means React hooks (`useState`, `useMemo`, `useCallback`, custom hooks), NOT the Claude Code `hooks/` runtime system.

## `useEffect`

Do not use `useEffect`; reach for derived state during render, event handlers, or a server-state library instead.

## Security

### XSS via `dangerouslySetInnerHTML`

CRITICAL: every usage is a code review halt: first-party input (document the source); user-derived input sanitized at the same call site (API-boundary sanitization only when every consumer is verified); sanitizer allowlists tags, never denylists.
