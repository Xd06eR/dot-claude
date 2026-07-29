---
name: implement
description: "Implement a piece of work based on a spec or set of tickets."
origin: mattpocock
---

Implement the work described by the user in the spec or tickets.

Use TDD where possible, at pre-agreed seams — `superpowers:test-driven-development` is the standard; `tdd` carries the house extras (seams, tautological-test anti-pattern).

Run typechecking regularly, single test files regularly, and the full test suite once at the end.

Once done, use /review-pr to review the work.

Git is the user's to run: output the exact commit command instead of running it.
