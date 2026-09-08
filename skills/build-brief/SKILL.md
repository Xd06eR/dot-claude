---
name: build-brief
description: Produce one comprehensive build brief per feature (a group of components) from the project's spec and plan docs.
disable-model-invocation: true
argument-hint: <feature>
origin: custom + mattpocock
---

Read the spec+plan for the components the user groups into a feature, produce ONE comprehensive build brief for that feature.

The brief is executed by `/build-feature <feature>`, which owns the build loop (batched dispatch, review, fix loop, ledger). This skill only writes the brief.

## What is a feature

A feature is a buildable chunk of the project spanning MULTIPLE components — smaller than the whole project, bigger than a single component.

**Sizing:** A feature usually spans 2-6 components.

Fewer than 2 and it is just a component (group it with related components) — EXCEPT a terminal integration component (e.g., the UI layer that depends on everything else), which is legitimately its own feature.

More than ~7 is too big: split along dependency seams into two features.

**Slicing:** components are tracer-bullet vertical slices wherever possible. Each slice cuts a narrow but COMPLETE path through every layer it touches (schema, API, UI, tests), not a horizontal slice of one layer. A finished slice is demoable or verifiable on its own, and sized to fit in a single fresh context window. Any prefactoring that would make the implementation easier lands first ("make the change easy, then make the easy change").

**Wide refactors are the exception to vertical slicing.** A wide refactor is one mechanical change (rename a column, retype a shared symbol) whose blast radius fans across the whole codebase, so no vertical slice can land green. Sequence it as **expand–contract**: first expand (add the new form beside the old so nothing breaks), then migrate call sites in batches sized by blast radius, each batch its own step blocked by the expand, green batch to batch because the old form still exists, finally contract (delete the old form once no caller remains), blocked by every migrate batch. When even the batches can't stay green alone, keep the sequence but let them share an integration branch that all block a final integrate-and-verify step: green is promised only there.

## Inputs — Plan-phase artifacts ONLY

The invocation names the feature. Discover its components from the plan INDEX and the specs it names.

Each named component must already have a spec and a plan (produced by `/plan-from-design`).

Discover and read, wherever they live in the project:

- the spec + plan for each named component (`<component>-spec.md`, `<component>-plan.md`)
- `docs/build/implementation-notes.md` — notes logged so far (decisions, deviations, tradeoffs, open questions), if it exists
- the project's `CLAUDE.md` — standing baseline context

Everything else is upstream: do not read it. If its content matters here, it is already distilled into the specs.

If a named component has no spec or plan, stop and say so: Plan has not produced it. Do not invent.

## Synthesize ONE feature brief → `docs/build/<feature>.md`

Write a single comprehensive brief covering every component in the feature. Structure:

1. **Execution header** (top of the file): one line naming the executor — "Executed by `/build-feature <feature>`. This document is the requirements source; progress lives in `docs/build/<feature>.ledger.md`."
2. **Feature goal** — what this feature delivers overall + its load-bearing design decisions (drawn from the component specs).
3. **Global constraints** — carried VERBATIM from the component plans' Global Constraints blocks: exact values, naming rules, version floors. They bind every build step, and reviewers use them as their attention lens.
4. **Component map** — the components in this feature, with dependency order between them (foundation → dependent). Cross-ref graph: referenced-by-many → early. References-many → late. Dependencies are blocking edges: a component starts only when its blockers are complete.
5. **Per component** — a section for each:
   - **Goal** — what this component delivers within the feature.
   - **Scope** — files/modules/subsystems it creates or touches.
   - **Depends on** — prior components (in this feature or earlier features) that must be built first.
   - **Interfaces** — Consumes / Produces, copied from the component plans: the exact signatures a fresh-context builder needs from neighbors it cannot see.
   - **Build steps** — the plan's checklist for this component, ordered. Each step: what to produce + its verify check (`[Step] → verify: [check]`).
   - **Acceptance** — what "this component done" means (checkable).
6. **Feature acceptance** — the feature is done when every component's acceptance passes. State explicitly.

## INDEX → `docs/build/INDEX.md`

One line per feature: name · components · status (☐/✅).

Rule at top: build features in dependency order.

## Output

Write `docs/build/<feature>.md`, update `INDEX.md`, print the component map + blocking edges for review.

Do not start the build. Quiz the user first: does the granularity feel right (too coarse / too fine), are the blocking edges correct (each component gated only by what genuinely blocks it), should any components be merged or split. Iterate until the user approves, then point them at `/build-feature <feature>`.
