---
name: e2e-testing
description: "Playwright E2E rules: never wait on time, locate by data-testid, capture artifacts on failure only, and the flaky-test diagnosis loop. Use when setting up or debugging Playwright E2E test suites."
origin: ECC
---

E2E covers critical user flows; the unit and integration layers cover the rest. Test policy lives in `~/.claude/rules/common/index.md` — including the flaky rule: a flaky test is a defect; fix the test, never mute it with retries or quarantine (`test.fixme` / `test.skip`). The sole sanctioned `test.skip` is the production guard under Critical flows.

## Rules

- **Never wait on time.** No `waitForTimeout`, no fixed sleeps, no `waitForLoadState('networkidle')`: wait on a specific condition — a locator's auto-wait, `waitForResponse` on the exact request, or an expected state. Time-based waits are the top flakiness source.
- **Locate by `data-testid`.** Never by CSS classes, XPath, or visible text — those couple tests to styling and copy.
- **Capture artifacts on failure only.** Config-level `trace: 'on-first-retry'`, `screenshot: 'only-on-failure'`, `video: 'retain-on-failure'` — passing runs produce no noise.

## Diagnosing a flaky test

```bash
npx playwright test tests/<name>.spec.ts --repeat-each=10   # reproduce intermittency
npx playwright test tests/<name>.spec.ts --retries=3        # reveal tests that only pass on retry
```

Then fix the test itself per `~/.claude/rules/common/index.md`.

## Critical flows

A test touching real money, credentials, or production data is skipped there by default: `test.skip(process.env.NODE_ENV === 'production', 'Skip on production')`.
