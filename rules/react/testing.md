---
paths:
  - "**/*.test.tsx"
  - "**/*.test.jsx"
  - "**/*.spec.tsx"
  - "**/*.spec.jsx"
  - "**/*.test.ts"
  - "**/*.spec.ts"
  - "**/__tests__/**/*.ts"
  - "**/__tests__/**/*.tsx"
  - "**/__tests__/**/*.js"
  - "**/__tests__/**/*.jsx"
---

# React Testing

> This file extends [typescript/typescript.md](../typescript/typescript.md) and [common/common.md](../common/common.md) with React specific content.

Pick one component-testing approach per project: do not mix RTL and Playwright CT in the same repo.

## Custom hook testing

Use `renderHook` from RTL.

- Always test through the public hook API, not internal implementation

## Accessibility assertions

Run axe assertions in component tests: catches missing labels and ARIA misuse. Color contrast is not checked at all in JSDOM (no layout engine, so axe disables the rule); it needs a browser pass.

## When to reach for Playwright / Cypress

Component test with RTL + JSDOM cannot:

- Test real layout (flexbox, grid, viewport-dependent rendering)
- Test scrolling, drag-and-drop, paste from clipboard
- Test browser-native animation, CSS transitions
- Test cross-frame interactions (iframes, popups)

For those, use Playwright Component Testing or an E2E run; see the `e2e-testing` skill.

## Coverage targets

| Layer | Target |
|---|---|
| Pure utility functions | ≥90% |
| Custom hooks | ≥85% |
| Components (presentational) | ≥80% (behavior, not lines) |
| Container components | ≥70% (golden paths + error states) |
| Pages (E2E covered separately) | Smoke test per route minimum |

## Anti-patterns

- Asserting on `container.querySelector`: bypasses accessibility queries
- Asserting on number of renders: implementation detail
- Mocking child components by default: tests the parent in isolation, not the integration; render the real tree and mock at the network (MSW)
- Manual `act()` warnings ignored: they indicate real bugs