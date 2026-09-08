---
name: plan-from-design
description: Turn canonical design docs into per-component spec + implementation plan.
disable-model-invocation: true
argument-hint: "[design docs dir, glob, or files — the feature to plan]"
origin: custom + mattpocock + superpowers
---

Produce one spec + implementation-plan pair per component, emit each as files `/build-brief` later consumes.

## Input — canonical design docs

The input is always canonical design: user-approved + baked into the canonical design set (`docs/design/`), carrying no open or provisional markers.

No canonical docs? Route on state: still unsettled → back to the Design phase (`grill-me` / `grill-with-docs`); settled in conversation but unbaked → `/bake-design`, then return.

The invocation names the design-doc source (a directory, a glob, or a list of files); the default layout puts it at `docs/design/`. It may also name an output location to use instead of the default `docs/plan/`. If it names no source, stop and ask where the canonical design docs live; do not guess a folder.

The invocation also names the feature to plan. The feature carves the build scope out of the named docs: the sections describing it are what gets built; everything else in the docs is standing context (existing contracts the plan must respect). No feature named means greenfield: the whole source is the build scope.

Ground the boundary on the code, not the docs: what exists in code is already built (reuse or extend); what is absent is this build. Grep the codebase for every contract the feature names, read the signatures the plan consumes from the code as built, and surface a doc-vs-code mismatch as a finding rather than planning against the doc's version.

Also read:

- the project's `CLAUDE.md` — standing context

Any other doc is NOT canonical: exclude it. A doc that still carries open or provisional markers is not canonical yet: flag it. Do not invent.

## Classify each design doc — build target vs reference doc

Not every canonical doc is a build target.

- **BUILD TARGET** — defines something to CONSTRUCT (a schema, a pipeline, a service, the UI, a storage layer, an API). Gets a spec + plan.
- **REFERENCE doc** — a digest, summary, or reference card that states subordination ("derived from," "reference card," "subordinate to") OR whose content is fully covered by other docs. NOT built independently. Gets NO spec/plan; recorded in INDEX as reference-only.

State the classification of every doc before writing.

## Decompose by component (build targets only)

One spec+plan pair per BUILD-TARGET component.

A component is the smallest unit that can be spec'd, planned, built, and acceptance-gated INDEPENDENTLY — high cohesion, low coupling (per CLAUDE.md). Typically maps to one design doc.

Split a doc that covers multiple independent concerns. Group tiny docs that form one concern.

State the proposed components before writing.

## Seams before specs

Sketch the seams at which each component will be tested. Prefer existing seams to new ones and keep the new-seam count low: the ideal is one new seam across the build, placed at the highest point that works.

Check with the user that the seams match their expectations before writing the specs.

## Order by dependency

Foundation-first.

Cross-ref graph: referenced-by-many → early (foundation). References-many → late (UI/edge).

## Emit per component → `docs/plan/`

For each BUILD-TARGET component, write:

- `<component>-spec.md` — what + why + SUCCESS CRITERIA, distilled from the design doc. Success criteria must be CHECKABLE (a test that passes, a query that returns X), not "works" or "is good." Also carries: **Implementation Decisions** (modules built/modified, interfaces, contracts, schema changes, architectural calls — NO file paths or code snippets, they go stale fast; exception: a prototype snippet that encodes a decision more precisely than prose, trimmed to the decision-rich parts), **Testing Decisions** (what makes a good test here — external behavior through the agreed seams, not implementation details; which modules are tested; prior art in the codebase), and **Out of Scope** (mandatory beyond trivial scope). Leave zero design decisions for the implementer.
- `<component>-plan.md` — technical approach plus a numbered checklist of decomposed steps as `[Step] → verify: [check]`, with decisions likely to change listed first. Also carries two binding blocks:
  - **Global Constraints** — the project-wide requirements that bind every step, copied VERBATIM from the design docs: exact values, version floors, naming rules, platform requirements, one line each. Downstream reviewers use this block as their attention lens, so exact values must travel, not paraphrases.
  - **Interfaces** — **Consumes:** the exact signatures this component uses from earlier components. **Produces:** the exact names, parameter types, and return types later components rely on. A fresh-context builder sees only its own spec+plan; this block is how it learns its neighbors' names and types.

The checklist lives INSIDE the plan as a section, not a separate file. One spec + one plan per component, no third doc. Each step is one verifiable action; fold setup, configuration, and scaffolding into the step whose deliverable needs them: no standalone scaffolding steps.

**Distill, do not invent.**

Specs capture USER-APPROVED decisions already in the canonical set. No new schema, contract, or prompt-template decisions: those require the project's change-control workflow (an `OPEN-QUESTIONS.md` entry → user approval → bake via `/bake-design`).

If a spec needs a decision not present in the canonical set, flag it. Do not invent.

## No placeholders

Every step must contain what the builder needs to act. These are plan failures. Never write them:

- "TBD", "TODO", "implement later", "fill in details"
- "Add appropriate error handling" / "add validation" / "handle edge cases"
- "Write tests for the above" (name the test and what it asserts)
- "Similar to component N" (repeat the content: steps may be read out of order)
- References to types, functions, or interfaces no spec or plan defines

## Self-review before emitting

Run this checklist yourself over the drafted files, not as a subagent dispatch:

1. **Spec coverage:** skim each requirement in the source design. Can you point to the step that implements it? List any gaps; add the missing component or step.
2. **Placeholder scan:** search the plan for the patterns above. Fix them.
3. **Type consistency:** do the names, signatures, and property types used by later components match what earlier components produce? A `clearLayers()` produced in one component but consumed as `clearFullLayers()` in another is a build-time failure.

Fix issues inline. No re-review: fix and move on.

## INDEX → `docs/plan/INDEX.md`

INDEX = the cross-feature list with dependency ordering (feature = 2-6 components). Working terms are feature / INDEX / component only.

Ordered BUILD-TARGET component list + one-line dependency graph + status tracker (☐ spec+plan · ☐ plan-reviewed · ☐ built).

REFERENCE docs listed separately: "reference — consumed by <X, Y>; no standalone build."

Rule at top: `plan-review` before `/build-brief` when the user calls it.

## Gate

After emitting, iterate with the user on the artifacts: fix what reads wrong, settle the decisions likely to change.

Then propose `plan-review` when the plan warrants an independent pass; the choice is the user's. With it run or declined, `/build-brief` is next.

## Output

Write `docs/plan/` (or the override) + `INDEX.md`, print the component classification + list + order for review.
