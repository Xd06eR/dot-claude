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

> This file extends [typescript/testing.md](../typescript/testing.md) and [common/testing.md](../common/testing.md) with React specific content.

## Library choice

- **React Testing Library (RTL)** — the standard for component testing. Tests behavior through the rendered DOM.
- **Runner:** per [typescript/testing.md](../typescript/testing.md) (vitest for new projects; Jest where the framework defaults to it). RTL works identically under both.
- **Playwright Component Testing** — when component tests need a real browser engine (animation, layout, complex events)
- **Cypress Component Testing** — alternative real-browser component runner

Pick one component-testing approach per project — do not mix RTL and Playwright CT in the same repo.

## Core principle

Test what the user sees and does, not implementation details.

- Query by accessible role first, then label, then text — fall back to `data-testid` only when nothing else fits
- Never assert on internal state, props passed to children, or which hooks were called
- `getBy*` throws when no match, `queryBy*` returns null (assert absence), `findBy*` returns a promise (async)

## User interaction

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

## Async assertions

- `findBy*` for async element appearance
- `waitFor` for async expectations on side effects or other matchers
- Never `setTimeout` + assertion — flaky

## Network mocking with MSW

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

## Avoid snapshot tests for components

Snapshots of rendered output are brittle, hard to review, and rubber-stamped by reviewers. Use them only for:

- Pure data serialization (e.g., a transformer that produces a stable string)
- Catching unintended regressions in non-visual output

For component visual regression, use Playwright / Cypress / Percy screenshots — actual visual diffs, not DOM diffs.

## Test setup helpers

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

## Custom hook testing

Use `renderHook` from RTL:

```tsx
import { renderHook, act } from "@testing-library/react";

test("useCounter increments", () => {
  const { result } = renderHook(() => useCounter());
  act(() => result.current.increment());
  expect(result.current.count).toBe(1);
});
```

- Always test through the public hook API, not internal implementation

## Accessibility assertions

```tsx
import { axe } from "vitest-axe";   // or jest-axe

test("UserCard has no a11y violations", async () => {
  const { container } = render(<UserCard user={mockUser} />);
  expect(await axe(container)).toHaveNoViolations();
});
```

Run axe assertions in component tests — catches missing labels and ARIA misuse. Color contrast is not checked at all in JSDOM (no layout engine, so axe disables the rule); it needs a browser pass.

## When to reach for Playwright / Cypress

Component test with RTL + JSDOM cannot:

- Test real layout (flexbox, grid, viewport-dependent rendering)
- Test scrolling, drag-and-drop, paste from clipboard
- Test browser-native animation, CSS transitions
- Test cross-frame interactions (iframes, popups)

For those, use Playwright Component Testing or an E2E run (framework per [typescript/testing.md](../typescript/testing.md)). See `e2e-testing` skill.

## Coverage targets

| Layer | Target |
|---|---|
| Pure utility functions | ≥90% |
| Custom hooks | ≥85% |
| Components (presentational) | ≥80% — behavior, not lines |
| Container components | ≥70% — golden paths + error states |
| Pages (E2E covered separately) | Smoke test per route minimum |

## Anti-patterns

- Asserting on `container.querySelector` — bypasses accessibility queries
- Asserting on number of renders — implementation detail
- Mocking React hooks (`jest.mock("react", ...)`) — refactor the component instead
- Mocking child components by default — tests the integration, not the parent in isolation
- Manual `act()` warnings ignored — they indicate real bugs