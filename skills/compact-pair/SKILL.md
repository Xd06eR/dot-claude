---
name: compact-pair
description: "Produce the pre-compact prompt pair for a session about to be compacted: a custom /compact instruction (a short positive Keep-list) and a post-compact resume prompt (re-ground reads + scaled context recovery). Auto-invoke when the user signals they will compact, asks for compact or resume prompts, or the session spans multiple compactions."
origin: custom
---

Produce two prompts, written fresh from the current conversation state — never canned text. The user pastes the first into `/compact`'s custom-instruction field and the second into the fresh session after compaction. Sibling artifact: the `handoff` skill writes a state doc for another agent; this skill writes the compaction-machinery prompts for continuing this session's work. Use the right one.

Best fired around ~60% context utilization: compacting while context is still clean produces a better summary. What compaction silently drops when left to itself (the keep-checklist's source): exact file paths, error messages verbatim, debugging steps, decisions with rationale, config values and function names.

1. Gather the current state from the session's durable docs (state/context docs, todo files, plan files — whatever the session has been maintaining), not from memory. Extract: the resume reads (which docs, in what order), the current task state (what is done, what is committed, what verdicts exist), and the next task and its gate. Do NOT extract standing rules (git, review, wording, process): those auto-load with the harness every session, so restating them is pure cost.

2. Write the custom compact instruction as one compact block — a `Keep:` line with a compressed item list, nothing else. The standard is a positive preserve-list; there is no Drop clause (naming what to exclude drags it into the summarizer's context — absence is the drop mechanism). Optionally add `Focus on X` as a positive priority when one thread matters most.
   - Keep: pointers to the durable docs + their read order; decisions WITH their rationale; exact file paths that matter; the current task state; the next task + its gate; unresolved errors verbatim where they exist. No standing-rule restatements (auto-loaded), no examples.
   - Form rule: each item is a phrase, not a sentence; the whole instruction is one block. If an item needs a full sentence or a numbered list, compress it.

3. Write the post-compact resume prompt with this shape, and nothing else (a pure resume prompt: the fresh session already has the auto-loaded instructions, so repeat none of them). Write it in the user's voice — "you" = the agent, "I" = the user; never third-person "the user" narration.
   - Situation framing: what was compacted, what is recorded where, the latest commit.
   - Re-ground reads: the durable docs, in read order.
   - Numbered recovery tasks, scaled to what the next work needs: (a) deep-read the sources the docs cite for any decision whose compressed reasoning is insufficient; (b) mine the just-compacted session's transcript (newest .jsonl in the projects dir) for decisions made after the docs were last written; (c) deeper byte-level sweeps (tool payloads, sidechains) — always marked ask-the-user-first.
   - Recovery rules, verbatim in the prompt (they spec the recovery tasks and live nowhere else): quote the user's words verbatim with refs; mark anything unconfirmable as UNVERIFIED, never guess; report what was NOT covered; verify new finds before canonizing them; flag ambiguity and ask instead of guessing.
   - Canonize-under-gate: update the durable docs only with verified finds, under a fresh-context read-back gate.
   - Next-task pointer + its gate, stated as a hard condition where one exists (for example a design-approval gate: no edits until the user approves the design).
   - If the session was short or the next task needs no historical depth, drop the recovery tasks and keep the prompt to re-ground reads + the next step. Do not dispatch recovery for its own sake.
   - If the next task does not depend on recent history at all, recommend `/clear` over `/compact`: nothing to preserve means no compact instruction and no resume prompt.
   - Output as one fenced block.

4. Present both blocks with a one-line usage note each. The user runs `/compact` with the instruction, then pastes the resume prompt into the fresh session.
