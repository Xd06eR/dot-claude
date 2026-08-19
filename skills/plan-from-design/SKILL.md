---
name: plan-from-design
description: Turn baseline design docs, a settled conversation, or a vague request into per-component spec + implementation plan (with embedded numbered checklist). Run at the Design→Plan handoff; gates via plan-review before /build-brief.
disable-model-invocation: true
argument-hint: "[design-doc dir, glob, or files — omit for conversation mode] [--out <dir>]"
origin: custom + mattpocock
---

# Plan Generator (Design → Plan)

Design→Plan handoff.

Produce one spec + implementation-plan pair per BUILD-TARGET component, emit each as files `/build-brief` later consumes.

`plan-review` gates this output before Build.

## Input modes

Three states the input can be in. Pick by what exists, not by preference:

- **Mode A — baseline design docs.** The default. Read the docs, decompose, emit.
- **Mode B — settled conversation.** No design docs, but the discussion already settled what + why. Synthesize from the conversation — do NOT interview. If a needed decision never came up, flag it or ask one targeted question; do not restart clarification.
- **Mode C — vague or underspecified request.** Interrogate first (below) until what + why are locked, then proceed as Mode B.

**Baseline** = design that is owner-approved + baked into the canonical design set (e.g., `system_design/`), carrying no OPEN/TBD markers.

Anything still in progress (staging, open-questions, research) is NOT baseline — exclude it.

## Mode C: interrogate until unambiguous

Ambiguity is a bug; find it before writing. Never produce the spec from the first message.

- **Round discipline:** 3-5 numbered questions per round, highest-ambiguity first. End every message with the questions. Call out assumptions explicitly ("I am assuming X, right?").
- **Lock the why first:** who is affected, current behavior (verified, not assumed), expected behavior, why now, how done is observed. No *how* before *what* and *why* are locked.
- **Lock scope early:** explicit out-of-scope list; the smallest version that delivers the value; failure modes and rollback.
- **Read code before asking.** Before any technical question, read evidence via Grep/Glob/Read and cite `path:line`. Never ask what reading answers. If genuinely greenfield, say so and proceed.
- **Quantify.** "Several files" is not acceptable — exact counts, metrics, targets.
- **Draft review:** present the full draft and ask "does this capture what you want — what did I get wrong?" Iterate until confirmed.
- **Stranger self-check:** re-read the confirmed draft as the unfamiliar implementer. Every residual ambiguity — vague criterion, fuzzy metric, undecided choice — gets fixed or flagged. The bar: a stranger executes with zero follow-up questions. For a deeper adversarial pass, hand the draft to `grill-me`.

## Inputs — Mode A: BASELINE design docs ONLY

Arguments: "$ARGUMENTS" — Mode A **required**: the design-doc source (a directory, a glob, or a list of files holding the baseline design). Mode B/C: omit — the source is the conversation.

The command does NOT assume any folder name. You point it at wherever the baseline design lives.

Optional: `--out <dir>` overrides the default `plan-docs/` output location. There is NO positional output dir — use `--out`.

Also read:

- the project's `CLAUDE.md` — standing context

Everything else (WIP notes, open-question files, staging dirs, research, archives) is NOT baseline — exclude it.

In Mode A, if `$ARGUMENTS` is empty, stop and ask where the baseline design docs live. Do not guess a folder.

If a pointed-at doc still carries open/TBD markers, it is not baseline yet — flag it. Do not invent.

## Classify each design doc — build target vs reference doc

Not every baseline doc is a build target.

Classify each before writing:

- **BUILD TARGET** — defines something to CONSTRUCT (a schema, a pipeline, a service, the UI, a storage layer, an API). Gets a spec + plan.
- **REFERENCE doc** — a digest, summary, or reference card that states subordination ("derived from," "reference card," "subordinate to") OR whose content is fully covered by other docs. NOT built independently. Gets NO spec/plan; recorded in INDEX as "reference — consumed by <X, Y>; no standalone build."

When unsure, check whether the doc defines a thing to BUILD or just summarizes other docs.

State the classification of every doc before writing.

## Decompose by component (build targets only)

One spec+plan pair per BUILD-TARGET component.

A component is the smallest unit that can be spec'd, planned, built, and acceptance-gated INDEPENDENTLY — high cohesion, low coupling (per CLAUDE.md). Typically maps to one design doc.

Split a doc that covers multiple independent concerns. Group tiny docs that form one concern.

State the proposed components before writing.

## Seams before specs

Sketch the seams at which each component will be tested. Prefer existing seams to new ones, use the highest seam possible, and keep the count low — the ideal number across the codebase is one. New seams go at the highest point that works.

Check with the user that the seams match their expectations before writing the specs.

## Order by dependency

Foundation-first.

Cross-ref graph: referenced-by-many → early (foundation). References-many → late (UI/edge).

## Emit per component → `plan-docs/` (or `--out <dir>`)

For each BUILD-TARGET component, write:

- `<component>-spec.md` — what + why + SUCCESS CRITERIA, distilled from the design doc. Success criteria must be CHECKABLE (a test that passes, a query that returns X), not "works" or "is good." Also carries: **Implementation Decisions** (modules built/modified, interfaces, contracts, schema changes, architectural calls — NO file paths or code snippets, they go stale fast; exception: a prototype snippet that encodes a decision more precisely than prose, trimmed to the decision-rich parts), **Testing Decisions** (what makes a good test here — external behavior through the agreed seams, not implementation details; which modules are tested; prior art in the codebase), and **Out of Scope** (mandatory beyond trivial scope). Leave zero design decisions for the implementer.
- `<component>-plan.md` — technical approach plus a numbered checklist of decomposed steps as `[Step] → verify: [check]`, with decisions likely to change listed first.

The checklist lives INSIDE the plan as a section — not a separate file. One spec + one plan per component, no third doc.

**Distill, do not invent.**

Specs capture OWNER-APPROVED decisions already in the baseline. No new schema, contract, or prompt-template decisions — those require the project's change-control workflow (staging → owner approval → bake into the baseline set).

If a spec needs a decision not present in the baseline, flag it. Do not invent.

## INDEX → `plan-docs/INDEX.md`

INDEX = the cross-feature menu with dependency ordering (feature = 2-6 components). These are the only batching terms — never "batch" or "menu".

Ordered BUILD-TARGET component list + one-line dependency graph + status tracker (☐ design done · ☐ spec+plan · ☐ plan-reviewed · ☐ built).

REFERENCE docs listed separately: "reference — consumed by <X, Y>; no standalone build."

Rule at top: `plan-review` gates every build target before `/build-brief`.

## Gate

After emitting, iterate with the user on the artifacts: fix what reads wrong, settle the decisions likely to change.

Then the user runs `plan-review` (the Plan-phase gate).

Do not run `/build-brief` until `plan-review` passes.

## Output

Write `plan-docs/` (or the `--out <dir>`) + `INDEX.md`, print the component classification + list + order for review.

Do not start `/build-brief` — user reviews + `plan-review` gates first.
