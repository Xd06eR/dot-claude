---
description: Design→Plan command. Decompose BASELINE design docs into per-component spec + implementation plan (with embedded numbered checklist). Run at the Design→Plan handoff; gates via plan-review before /build-brief.
argument-hint: [required: design-doc dir, glob, or file list] [--out <output-dir>]
---

# Plan Generator (Design → Plan)

Design→Plan handoff. Read the project's BASELINE design docs, decompose into one spec + implementation-plan pair per BUILD-TARGET component, emit each as files `/build-brief` later consumes. `plan-review` gates this output before Build.

**Baseline** = design that is owner-approved + baked into the canonical design set (e.g., `system_design/`), carrying no OPEN/TBD markers. Anything still in progress (staging, open-questions, research) is NOT baseline — exclude it.

## Inputs — BASELINE design docs ONLY

Arguments: "$ARGUMENTS" — **required**: the design-doc source (a directory, a glob, or a list of files holding the baseline design). The command does NOT assume any folder name; you point it at wherever the baseline design lives. Optional: `--out <dir>` overrides the default `plan-docs/` output location. There is NO positional output dir — use `--out`.

Also read:
- the project's `CLAUDE.md` — standing context

Everything else (WIP notes, open-question files, staging dirs, research, archives) is NOT baseline — exclude it. If `$ARGUMENTS` is empty, stop and ask where the baseline design docs live; do not guess a folder. If a pointed-at doc still carries open/TBD markers, it is not baseline yet — flag it; do not invent.

## Classify each design doc — build target vs reference doc

Not every baseline doc is a build target. Classify each before writing:
- **BUILD TARGET** — defines something to CONSTRUCT (a schema, a pipeline, a service, the UI, a storage layer, an API). Gets a spec + plan.
- **REFERENCE doc** — a digest, summary, or reference card that states subordination ("derived from," "reference card," "subordinate to") OR whose content is fully covered by other docs. NOT built independently. Gets NO spec/plan; recorded in INDEX as "reference — consumed by <X, Y>; no standalone build."

When unsure, check whether the doc defines a thing to BUILD or just summarizes other docs. State the classification of every doc before writing.

## Decompose by component (build targets only)

One spec+plan pair per BUILD-TARGET component. A component is the smallest unit that can be spec'd, planned, built, and acceptance-gated INDEPENDENTLY — high cohesion, low coupling (per CLAUDE.md). Typically maps to one design doc. Split a doc that covers multiple independent concerns; group tiny docs that form one concern. State the proposed components before writing.

## Order by dependency

Foundation-first. Cross-ref graph: referenced-by-many → early (foundation); references-many → late (UI/edge).

## Emit per component → `plan-docs/` (or `--out <dir>`)

For each BUILD-TARGET component, write:
- `<component>-spec.md` — what + why + SUCCESS CRITERIA, distilled from the design doc. Success criteria must be CHECKABLE (a test that passes, a query that returns X), not "works" or "is good."
- `<component>-plan.md` — technical approach plus a numbered checklist of decomposed steps as `[Step] → verify: [check]`, with decisions likely to change listed first.

The checklist lives INSIDE the plan as a section — not a separate file. One spec + one plan per component, no third doc.

**Distill, do not invent.** Specs capture OWNER-APPROVED decisions already in the baseline. No new schema, contract, or prompt-template decisions — those require the project's change-control workflow (staging → owner approval → bake into the baseline set). If a spec needs a decision not present in the baseline, flag it; do not invent.

## INDEX → `plan-docs/INDEX.md`

Ordered BUILD-TARGET component list + one-line dependency graph + status tracker (☐ design done · ☐ spec+plan · ☐ plan-reviewed · ☐ built). REFERENCE docs listed separately: "reference — consumed by <X, Y>; no standalone build." Rule at top: `plan-review` gates every build target before `/build-brief`.

## Gate

After emitting, iterate with the user on the artifacts: fix what reads wrong, settle the decisions likely to change. Then the user runs `plan-review` (the Plan-phase gate). Do not run `/build-brief` until `plan-review` passes.

## Output

Write `plan-docs/` (or the `--out <dir>`) + `INDEX.md`, print the component classification + list + order for review. Do not start `/build-brief` — user reviews + `plan-review` gates first.
