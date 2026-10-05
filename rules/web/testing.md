---
paths:
  - "**/e2e/**/*.ts"
  - "**/e2e/**/*.tsx"
  - "**/e2e/**/*.js"
  - "**/e2e/**/*.jsx"
---

# Web Testing Rules

> This file extends [common/testing.md](../common/testing.md) with web-specific testing content.

## Priority order

### 1. Visual regression

- Screenshot key breakpoints from the responsive set below
- Test hero sections, scrollytelling sections, and key user flows, error and empty states
- Use Playwright screenshots for visual-heavy work
- If both themes exist, test both

### 2. Accessibility

- Run automated accessibility checks
- Test keyboard navigation
- Verify reduced-motion behavior
- Verify color contrast

### 3. Performance

- INP is field-only: verify via CrUX/RUM; TBT is the lab proxy (CWV targets: [architecture.md](architecture.md#core-web-vitals-targets))

### 4. Cross-browser

- Minimum: Chrome, Firefox, Safari
- Test scrolling, motion, and fallback behavior

### 5. Responsive

- Test 320, 375, 768, 1024, 1440, 1920
- Verify no overflow
- Verify touch interactions

## E2E shape

For Playwright E2E work, call the Skill tool with "e2e-testing": it owns locator discipline, wait rules, and the flaky-test diagnosis loop.

## Unit tests

- Test utilities, data transforms, and custom hooks
- For highly visual components, visual regression often carries more signal than brittle markup assertions
- Visual regression supplements coverage targets; it does not replace them
