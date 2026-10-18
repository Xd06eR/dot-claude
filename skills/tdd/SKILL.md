---
name: tdd
description: "Test-driven development. Use on any feature or bug build: the build runs test-first (red → green) by default. Also use when writing or reviewing tests."
origin: mattpocock + superpowers
---

TDD is the red → green loop. This skill is the reference that makes that loop produce tests worth keeping: what a good test is, where tests go, the anti-patterns, and the rules of the loop. Every section applies on every cycle: consult them before and during the loop, not after.

## What a good test is

Tests verify behavior through public interfaces, not implementation details. Code can change entirely; tests shouldn't. A good test reads like a specification ("user can checkout with valid cart" tells you exactly what capability exists) and survives refactors because it doesn't care about internal structure.

Read [tests.md](tests.md) when writing, changing, or reviewing tests, and [mocking.md](mocking.md) when adding, changing, or reviewing mocks.

## Seams — where tests go

A **seam** is the public boundary you test at: the interface where you observe behavior without reaching inside. Tests live at seams, never against internals.

**Test only at pre-agreed seams.** Seams already settled by a plan, a brief, or the code's existing public interfaces stand as-is. Otherwise, write down the proposed seams and confirm them with the user before writing tests at them: "What's the public interface, and which seams should we test?" Give each proposed seam a one-line note on what it catches and what it misses. You can't test everything, so agreeing the seams up front is how testing effort lands on the critical paths and complex logic instead of every edge case.

When the shape of that interface is itself in question (how deep the module is, where the seam belongs, what the interface should expose), call the Skill tool with "codebase-design" for the vocabulary. It is the shared source of the module, interface, depth, seam, adapter, leverage and locality terms, and it is a reference to consult, not a session to run.

## Anti-patterns

- **Implementation-coupled** — mocks internal collaborators, tests private methods, or verifies through a side channel (querying the database instead of using the interface). The tell: the test breaks when you refactor but behavior hasn't changed.
- **Tautological** — the assertion recomputes the expected value the way the code does (`expect(add(a, b)).toBe(a + b)`, a snapshot derived by hand the same way, a constant asserted equal to itself), so it passes by construction and can never disagree with the code. Expected values must come from an independent source of truth — a known-good literal, a worked example, the spec.
- **Horizontal slicing** — writing all tests first, then all implementation. Bulk tests verify _imagined_ behavior: you test the _shape_ of things rather than user-facing behavior, the tests go insensitive to real changes, and you commit to test structure before understanding the implementation. Work in **vertical slices** instead — one test → one implementation → repeat, each test a **tracer bullet** that responds to what the last cycle taught you.

## Rules of the loop

- **Red before green.** Write the failing test first, then only enough code to pass it. Don't anticipate future tests or add speculative features.
- **Verify the red.** Run the test and watch it fail for the expected reason (the feature is missing), not on a typo or an error. A test that passes immediately is testing existing behavior; fix the test. If you didn't watch it fail, you don't know it tests the right thing.
- **Verify the green.** Run the test and watch it pass, the rest of the test file still green, output pristine. On failure, fix the code, not the test.
- **One slice at a time.** One seam, one test, one minimal implementation per cycle.
- **A hard-to-write test is a design signal.** Simplify the interface, inject the dependency, or write the wished-for API and its assertion first. `codebase-design` has the vocabulary for the interface questions.
- **Refactoring is not part of the loop.** It belongs to the review stage (see `code-review`), not the red → green implementation cycle.

## Rationalizations

The loop's enemies, answered:

- **"I'll test after."** Tests written after pass immediately, which proves nothing: you never watched them fail, so you never proved they can catch the bug.
- **"Too simple to test."** Simple code breaks. The test takes seconds.
- **"I already manually tested it."** Manual verification leaves nothing re-runnable: the next change re-breaks the case with no test to catch it, and cases get skipped under pressure. A test runs the same way every time.
- **"Keep the written code as reference."** You'll adapt it: that is testing after. Delete means delete.
- **"Deleting hours of work is wasteful."** Sunk cost. The real choice is rewrite with proof versus keep code you can't trust.
- **"TDD slows me down."** It catches bugs before commit and keeps refactors safe; the shortcut route is debugging in production.

## Done means

- [ ] Every new behavior has a test, written first, at a pre-agreed seam.
- [ ] You watched each test fail, for the expected reason.
- [ ] You can name the production change that would make each test fail.
- [ ] Each implementation was the minimal code to pass its test.
- [ ] The full suite is green and the output is pristine; a failure that pre-existed your change is reported by name, never silently inherited.
