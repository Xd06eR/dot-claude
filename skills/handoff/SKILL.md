---
name: handoff
description: "Write a handoff document for a fresh agent: continue the work in a new or compacted session, or transfer what this session covered to another session or project."
disable-model-invocation: true
argument-hint: What will the next session be used for?
origin: mattpocock
---

Write a handoff document for a fresh agent — yours in a new or compacted session, or another agent's, in this project or a different one.

A handoff carries what this session did or covered. For state that lives in another project's own artifacts, point at those artifacts instead of summarizing them.

Save it to the working directory's `.scratch/` by default; if the user names a location, use that instead. Report the saved path.

For the compaction-machinery prompts (a custom compact instruction and a resume prompt), use `compact-pair`; this skill writes the state document.

If the user passed arguments, treat them as the next session's focus and tailor the doc toward it.

## Document structure

The doc opens with a **read order**: the durable artifacts the next session re-grounds from, in order, each named for what it carries.

The shape is free. What is not free is the receiver's needs: pick the floor by the receiver's job and cover its list, in whatever sections serve. Task when the next session continues the work, context when it absorbs what this session covered. An empty "done" list is the signal you are writing a context handoff.

**Task handoff** — the next session continues the work. It needs:

- what is complete, with the evidence (test output, commit, command result)
- what remains, stated honestly, including partial work
- the established truths it cannot re-derive cheaply (decisions made, paths, ids, config values)
- what was assumed but never verified — it verifies before building on those
- the single action to resume with
- the traps and dead ends already hit, so it does not retry them

**Context handoff** — the next session absorbs what this session covered: understanding, not a work queue. It needs:

- this session's topic, why it mattered, what the user wanted from it
- the significant threads in order and where each landed: a decision with its rationale, an exploration with its outcome
- what is settled, open, or parked — state, not a to-do list
- the traps and dead ends already hit, so it does not retry them

Then name any skills the next agent should invoke, and for what.

## Rules

- Never duplicate content already captured in other artifacts (specs, plans, ADRs, commits, diffs): reference them by path.
- Redact sensitive information (keys, passwords, personal data) before writing.
- A handoff is written for one reader, not kept: one that outlives the next session states what retires it (refresh or delete on a named event or condition); a one-shot says so, and the receiver deletes it after re-grounding. Claims decay either way. The doc does not update itself.
