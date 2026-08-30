---
name: bake-design
description: Promote a settled, user-approved OPEN-QUESTIONS.md entry into a canonical design doc. Run at the staging→canonical gate.
disable-model-invocation: true
argument-hint: <register entry #NN>
origin: custom
---

# Bake Design

Canonical docs are determined-only: no open or provisional markers inside. One item per bake.

A bake separates design from context: the design goes to canonical (state, rewritten), the context (the why and the rejected options) goes to ADRs (log, frozen), and the entry leaves the register.

## Pre-invoke checklist

1. Item is settled: the user made the call, or it is deterministic from prior decisions.
2. Repo is current: `git status -sb` shows no behind-upstream or diverging state.
3. A fresh session is fine: the skill self-anchors via `TODO.md` + `OPEN-QUESTIONS.md`.

## Process

The workflow is mechanical on purpose: each gate catches a failure the other steps structurally miss. Do not reorder or skip.

1. **Confirm settled, and confirm it has an entry.** Read the item's entry in `OPEN-QUESTIONS.md` — the Open list and each ruling's ⚠️ PROVISIONAL marker, not just the headline glyph. If it is still open, stop and surface the gap. The `#NN` in the invocation identifies the entry; any prose around it is context, not a lookup key. No `#NN`, or no live entry with that number, means nothing to bake. Report and stop; never guess from the description. **Settled is not sound.** A ruling can be confirmed, faithfully captured, and still depend on a value that a still-open question has yet to define. Read each ruling's inputs. A ruling with an open input is PROVISIONAL, gets marked so, and does not bake; the rest of the entry proceeds without it. Where a marker's named dependency has since been ruled, re-check the ruling against that answer and clear the marker rather than blocking on a dependency that no longer exists. If this session authored rulings, their capture has never been verified: propose `design-audit` `full` over the session before continuing (all three checks, one transcript read). The transcript catches what write-as-you-go missed.
2. **Soundness gate.** Invoke the `design-audit` skill: soundness on this entry's rulings (`docs` mode). No later step soundness-checks the entry's rulings; step 7 covers only what the draft fixes. If step 1's audit ran, it soundness-checked only this session's rulings. Run this gate on the entry's older rulings, and re-probe whatever its fixes changed.
3. **Plan the doc.** Blueprint the section list and what each section holds, determined vs extracted-to-open. Trace every related contract in existing `design-docs/*.md` (paths, event names, field names, schema columns) so the new doc aligns.
4. **Draft.** Determined-only prose — the design as it is right now, with no rationale, no rejected alternatives, no history. Match the structure and tone of the existing canonical docs.
5. **Extract opens.** Genuinely-open items surfaced while drafting go to `OPEN-QUESTIONS.md`, never into the doc body; entry writes follow `open-questions`: read it before writing.
6. **Self-review.** (a) Determined-only grep on the draft (`OPEN|TBD|maybe|\?|⚠️|🟡|🟢|⛔`): judge each hit in context — a literal `?` in prose or a code span, or text quoting the rule itself, is not a violation. (b) Gap-closure matrix — every gap marked resolved-in-doc or moved-to-open. (c) Cross-doc contract grep — names identical here and in canonical.
7. **Adversarial subagent.** Dispatch one fresh subagent to review the draft: contradictions with canonical, over-reach past scope, under-reach (determined gaps left undecided), determined-only violations, and a soundness pass on every ruling the draft fixes. Brief it on `file:line` and the claim only, never on your reasoning, so it refutes the design rather than following it. Fix all CRITICAL/HIGH; anything left unfixed surfaces at the user gate.
8. **Reconciliation checklist.** List every `file:line` edit needed in stale docs (indexes, peer sections, `CONTEXT.md` entries, CLAUDE.md rows) and append the checklist to the item's entry: it is the completeness audit's claim source at step 10. Do NOT apply the edits yet.
9. **User gate.** Surface for review: the draft, the new open entries, every contract the draft fixes (schema, API, event names, prompt templates), and any findings left unfixed from step 7. Wait for approval.
10. **Post-approval.** Apply the reconciliation edits, then reconcile the step-8 checklist to what was actually applied: the gate may have dropped or added edits, and a frozen checklist makes the audit report phantom gaps. Then invoke `design-audit`: consistency and completeness (`docs` mode) over the checklist plus the entry. The reconciliation edits landed after step 7's review, so this pass is the only review they get. The bake is not done until the gap list is empty.
11. **Write the ADRs.** Score every baked ruling against the granularity test (could a future session reverse this choice without touching the others: execute per ruling, never estimate per entry). Qualifying rulings become ADRs; a ruling that rides on another decision but had a real rejected alternative lands as a Considered-options line in the parent's ADR; pure consequences land as Consequences lines named by original id. Format, guardrail, and numbering per `~/.claude/skills/domain-modeling/ADR-FORMAT.md`. Append one index row per new ADR to `docs/adr/README.md`.
12. **Retire the entry.** Confirm the entry's current text is committed to git (an uncommitted entry deleted here is unrecoverable). Then delete the entry from `OPEN-QUESTIONS.md`. A partially-baked entry is NOT deleted: it stays, holding only its unbaked rulings. Append the session narrative (what baked, which ADRs were written, how many adversarial rounds ran, what was approved) to `PROGRESS-LOG.md`.
13. **Commit the bake.** One commit holding the new canonical doc, the reconciliation edits, the ADRs and their index rows, the entry's deletion, and the `PROGRESS-LOG.md` entry.

## Supersession — when a later decision replaces a baked one

- Canonical is rewritten to the new decision; the old one is gone from canonical.
- The old ADR's `Status` flips to `superseded by NNNN`; its body stays untouched.
- The new ADR is written normally, plus `Supersedes: NNNN`.
- The old ADR's index row is updated to the new status.
- The new decision's entry is retired as usual.

Canonical then answers "what now" and the ADR chain answers "what changed and why", with neither polluted by the other.

## Drop — when an entry is abandoned

Not every entry bakes. An abandoned entry is deleted from the register with NO ADR, because no decision was made. One line in `PROGRESS-LOG.md` records what was dropped and why.

## Notes

- User-authority content always surfaces at step 9, never settles silently.
