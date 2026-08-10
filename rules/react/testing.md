---
paths:
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "**/*.test.js"
  - "**/*.test.jsx"
  - "**/*.spec.ts"
  - "**/*.spec.tsx"
  - "**/*.spec.js"
  - "**/*.spec.jsx"
  - "**/__tests__/**/*.ts"
  - "**/__tests__/**/*.tsx"
---

# React Testing

> This file extends [typescript/testing.md](../typescript/testing.md) and [common/testing.md](../common/testing.md) with React specific content.

## Library Choice

- **React Testing Library (RTL)** — the standard for component testing. Tests behavior through the rendered DOM.
- **Vitest** — preferred runner for new Vite-based projects. Faster than Jest, native ESM, same API.
- **Jest** — still documented for Next.js projects. RTL works identically.
- **Playwright Component Testing** — when component tests need a real browser engine (animation, layout, complex events)
- **Cypress Component Testing** — alternative real-browser component runner

Pick one component-testing approach per project — do not mix RTL and Playwright CT in the same repo.

## Core Principle

Test what the user sees and does, not implementation details.

- Query by accessible role first, then label, then text — fall back to `data-testid` only when nothing else fits
- Never assert on internal state, props passed to children, or which hooks were called
- `getBy*` throws when no match, `queryBy*` returns null (assert absence), `findBy*` returns a promise (async)

## User Interaction

Prefer `userEvent` over `fireEvent`. `userEvent` simulates real browser sequences (focus, keydown, beforeinput, input, keyup) — `fireEvent` dispatches a single synthetic event.

```tsx
import userEvent from "@testing-library/user-event";

test("submits the form", async () => {
  const user = userEvent.setup();
  render(<UserForm onSubmit={handleSubmit} />);

  await user.type(screen.getByLabelText("Email"), "user@example.com");
  await user.click(screen.getByRole("button", { name: /save/i }));

  expect(handleSubmit).toHaveBeenCalledWith({ email: "user@example.com" });
});
```

- Always `await` `userEvent` calls — they are async
- Call `userEvent.setup()` once at the top of each test, then reuse the returned `user`

## Async Assertions

- `findBy*` for async element appearance
- `waitFor` for async expectations on side effects or other matchers
- Never `setTimeout` + assertion — flaky

## Network Mocking with MSW

Use Mock Service Worker for any test that hits a network boundary. MSW runs at the network layer, so the component, hooks, and fetch library all behave as in production.

```tsx
// test setup
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

const server = setupServer(
  http.get("/api/users/:id", ({ params }) =>
    HttpResponse.json({ id: params.id, name: "Alice" }),
  ),
);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

`onUnhandledRequest: "error"` fails loudly on unmocked requests — silent passes are worse than red.

## Avoid Snapshot Tests for Components

Snapshots of rendered output are brittle, hard to review, and rubber-stamped by reviewers. Use them only for:

- Pure data serialization (e.g., a transformer that produces a stable string)
- Catching unintended regressions in non-visual output

For component visual regression, use Playwright / Cypress / Percy screenshots — actual visual diffs, not DOM diffs.

## Test Setup Helpers

Wrap providers once:

```tsx
function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={lightTheme}>
        <Router>{ui}</Router>
      </ThemeProvider>
    </QueryClientProvider>,
  );
}
```

One QueryClient per test, created in the helper body — never module scope (cache bleeds across tests), never inside the wrapper component (resets on re-render). Export from `test-utils.tsx` and use everywhere.

## Custom Hook Testing

Use `renderHook` from RTL:

```tsx
import { renderHook, act } from "@testing-library/react";

test("useCounter increments", () => {
  const { result } = renderHook(() => useCounter());
  act(() => result.current.increment());
  expect(result.current.count).toBe(1);
});
```

- Always wrap state-changing calls in `act`
- Always test through the public hook API, not internal implementation

## Accessibility Assertions

```tsx
import { axe } from "vitest-axe";   // or jest-axe

test("UserCard has no a11y violations", async () => {
  const { container } = render(<UserCard user={mockUser} />);
  expect(await axe(container)).toHaveNoViolations();
});
```

Run axe assertions in component tests — catches missing labels and ARIA misuse. Color contrast is not checked at all in JSDOM (no layout engine, so axe disables the rule); it needs a browser pass.

## When to Reach for Playwright / Cypress

Component test with RTL + JSDOM cannot:

- Test real layout (flexbox, grid, viewport-dependent rendering)
- Test scrolling, drag-and-drop, paste from clipboard
- Test browser-native animation, CSS transitions
- Test cross-frame interactions (iframes, popups)

For those, use Playwright Component Testing or end-to-end Playwright/Cypress runs. See `e2e-testing` skill.

## Coverage Targets

| Layer | Target |
|---|---|
| Pure utility functions | ≥90% |
| Custom hooks | ≥85% |
| Components (presentational) | ≥80% — behavior, not lines |
| Container components | ≥70% — golden paths + error states |
| Pages (E2E covered separately) | Smoke test per route minimum |

## Anti-Patterns

- Asserting on `container.querySelector` — bypasses accessibility queries
- Asserting on number of renders — implementation detail
- Mocking React hooks (`jest.mock("react", ...)`) — refactor the component instead
- Mocking child components by default — tests the integration, not the parent in isolation
- Manual `act()` warnings ignored — they indicate real bugs