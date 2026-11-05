---
name: compact-pair
description: "Produce the pre-compact prompt pair: a custom /compact instruction and a post-compact resume prompt. Use when the user is about to compact the session."
argument-hint: What will the next session be used for?
origin: custom
---

Produce two prompts, written fresh from the current conversation state. The user pastes the first into `/compact`'s custom-instruction field and the second as the first message of the post-compact session.

## The relevance gate

The invocation names the next session's purpose; when none is given, the session's open work (unfinished tasks, active threads) names it. Everything you keep or write is filtered by that purpose: an item is kept only if the purpose needs it. A purpose the user names governs strictly — keep nothing for threads it does not touch.

If the purpose needs nothing from this session, recommend `/clear` over `/compact`: nothing to preserve means no pair.

## 1. Gather

Gather the current state from the session's durable docs (state docs, todo files, plan files), not from memory.

- Extract: the re-ground reads (which docs, in what order), the current task state (done, committed, verdicts), and the next task's gate.
- Check the docs' sync state while gathering: a decision not yet in them is a Keep candidate only when the purpose depends on it.

## 2. The compact instruction

One fenced block: a single `Keep:` line with a semicolon-separated compressed item list, optionally ending with `Focus on X` when one thread matters most, and nothing else. A positive preserve-list; there is no Drop clause (naming what to exclude drags it into the summarizer's context — absence is the drop mechanism).

- Keep: the purpose's task state and gate; exact file paths the purpose needs; unresolved errors verbatim; a decision not yet in the docs whose outcome the purpose depends on, its rationale compressed to a clause, never a sentence.
- Hard caps: at most 8 items, one compressed clause each. Count before presenting; over the cap, cut the weakest.

## 3. The resume prompt

One shape, written in the user's voice — "you" = the agent, "I" = the user; never third-person.

- Re-ground reads: the durable docs, in read order.
- The next task + its gate, stated as a hard condition where one exists.
- Further directives as the session needs them (a warning, an ordering, a method note), within the same cap.
- No restatements of always-loaded rules: the fresh session already carries them.
- Output as one fenced block: blank line between blocks (e.g. a directive, a note, a numbered step), at most 15 lines including blanks.

## 4. Present

Present both blocks with a one-line usage note each.
