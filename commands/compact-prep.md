---
description: Produce the pre-compact prompt pair for a session about to be compacted: a custom /compact instruction (Keep/Drop schema) and a post-compact resume prompt (re-ground reads + scaled context recovery). Auto-invoke when the user signals they will compact, asks for compact or resume prompts, or the session spans multiple compactions.
origin: custom
---

# Compact Prep

Produce two prompts, written fresh from the current session state — never canned text. The user pastes the first into `/compact`'s custom-instruction field and the second into the fresh session after compaction. Sibling artifact: the `handoff` skill writes a state doc for another agent; this command writes the compaction-machinery prompts for continuing this session's work. Use the right one.

1. Gather the current state from the session's durable docs (state/context docs, todo files, plan files — whatever the session has been maintaining), not from memory. Extract: the resume reads (which docs, in what order), the current task state (what is done, what is committed, what verdicts exist), and the next task and its gate. Do NOT extract standing rules (git, review, wording, process): those auto-load with the harness every session, so restating them is pure cost.

2. Write the custom compact instruction with the Keep/Drop schema, kept short:
   - Keep: pointers to the durable docs + their read order; the current task state and latest commit; the next task + its gate. No standing-rule restatements (auto-loaded), no examples.
   - Drop: subagent report contents, verification mechanics, rejected draft iterations, and anything recoverable by re-reading the docs.
   - Phrase it as `Keep: ... Preserve (1) ... (2) ... Drop: ...` — a few numbered preserves, not an essay — and output it as one fenced block.

3. Write the post-compact resume prompt with this shape, and nothing else (a pure resume prompt: the fresh session already has the auto-loaded instructions, so repeat none of them):
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
