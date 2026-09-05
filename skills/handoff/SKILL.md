---
name: handoff
description: Compact the current conversation into a handoff document for another agent to pick up.
disable-model-invocation: true
argument-hint: What will the next session be used for?
origin: mattpocock
---

Write a handoff document so a fresh agent can continue the work. Save it to the working directory's `.scratch/` by default; if the user names a location, use that instead. Report the saved path.

If the user passed arguments, treat them as the next session's focus and tailor the doc toward it.

## Document structure

The doc opens with a **read order**: the durable artifacts the next session re-grounds from, in order, each named for what it carries.

Six sections, all required — one with nothing to report says so, and the case may call for more:

1. **Done:** what is complete, with the evidence (test output, commit, command result).
2. **Not done:** what remains, stated honestly, including partial work.
3. **Facts:** the established truths the next agent needs (decisions made, paths, ids, config values).
4. **Assumptions:** what was assumed but never verified; the next agent verifies before building on these.
5. **Next step:** the single action to resume with.
6. **Pitfalls:** traps and dead ends already hit; what not to retry.

Then a **suggested skills** section naming which skills the next agent should invoke, and for what.

## Rules

- Never duplicate content already captured in other artifacts (specs, plans, ADRs, commits, diffs): reference them by path.
- Redact sensitive information (keys, passwords, personal data) before writing.
- State the doc's lifecycle: what retires it (refresh or delete on a named event or condition), and warn that claims decay since it does not update itself.
