---
description: Plan→Build command. Produce one comprehensive build brief per feature (a group of components named in $ARGUMENTS) from the project's Plan-phase artifacts. Run at the Plan→Build handoff.
argument-hint: "[feature: component1, component2, ...]"
origin: custom + mattpocock
---

# Build Brief Generator (Plan → Build)

Plan→Build handoff.

Terms: a **feature** is a buildable chunk of 2-6 components; an **INDEX** is the cross-feature menu with dependency ordering. These are the only batching terms — never "batch" or "menu".

Read the spec+plan for the components the user groups into a feature, produce ONE comprehensive build brief for that feature.

The build session then dispatches subagents per independent component (per CLAUDE.md Build phase + `rules/common/dispatch-protocol.md`).

Review phase starts only after every feature is built.

## What is a feature

A feature is a buildable chunk of the project spanning MULTIPLE components — smaller than the whole project, bigger than a single component.

The project has many features. Each feature is one build-brief.

Do NOT emit one brief per component — that multiplies files. Group related components into a feature and emit one comprehensive brief covering all of them.

**Sizing:** A feature usually spans 2-6 components.

Fewer than 2 and it is just a component (group it with related components) — EXCEPT a terminal integration component (e.g., the UI layer that depends on everything else), which is legitimately its own feature.

More than ~7 is too big — split along dependency seams into two features.

**Slicing:** components are tracer-bullet vertical slices wherever possible. Each slice cuts a narrow but COMPLETE path through every layer it touches (schema, API, UI, tests) — not a horizontal slice of one layer. A finished slice is demoable or verifiable on its own, and sized to fit in a single fresh context window. Any prefactoring that would make the implementation easier lands first ("make the change easy, then make the easy change").

**Wide refactors are the exception to vertical slicing.** A wide refactor is one mechanical change (rename a column, retype a shared symbol) whose blast radius fans across the whole codebase, so no vertical slice can land green. Sequence it as **expand–contract**: first expand (add the new form beside the old so nothing breaks), then migrate call sites in batches sized by blast radius, each batch its own step blocked by the expand, green batch to batch because the old form still exists, finally contract (delete the old form once no caller remains), blocked by every migrate batch. When even the batches can't stay green alone, keep the sequence but let them share an integration branch that all block a final integrate-and-verify step — green is promised only there.

## Inputs — Plan-phase artifacts ONLY

Arguments: "$ARGUMENTS" — **required**: the feature name + the components in it.

Each named component must already have a spec and a plan (produced by `/plan-from-design`).

Discover and read, wherever they live in the project:

- the spec + plan for each named component (`<component>-spec.md`, `<component>-plan.md`)
- `implementation-notes.md` — notes logged so far (decisions, deviations, tradeoffs, open questions), if it exists
- the project's `CLAUDE.md` — standing baseline context

Everything else is upstream (design-phase, research, archives) — do not read it. If its content matters here, it is already distilled into the specs.

If a named component has no spec or plan, stop and say so — Plan has not produced it. Do not invent.

## Synthesize ONE feature brief → `build-briefs/<feature>.md`

Write a single comprehensive brief covering every component in the feature:

1. **Feature goal** — what this feature delivers overall + its load-bearing design decisions (drawn from the component specs).
2. **Component map** — the components in this feature, with dependency order between them (foundation → dependent). Cross-ref graph: referenced-by-many → early. References-many → late. Dependencies are blocking edges: a component whose blockers are all done can start immediately — work that frontier.
3. **Per component** — a section for each:
   - **Goal** — what this component delivers within the feature.
   - **Scope** — files/modules/subsystems it creates or touches.
   - **Depends on** — prior components (in this feature or earlier features) that must be built first.
   - **Build steps** — the plan's checklist for this component, ordered. Each step: what to produce + its verify check (`[Step] → verify: [check]`).
   - **Acceptance** — what "this component done" means (checkable).
4. **Dispatch plan** — split the feature's components:
   - INDEPENDENT components: one subagent each, in parallel, per `rules/common/dispatch-protocol.md` (residue test, escalation levers, report contract).
   - Sequential/dependent components: built in the main session, in dependency order.
   - Every build prompt (main session or dispatched) runs the TDD loop per `tdd` at the seams agreed in the specs: failing test first, implement, then lint + format + type-check + tests; typecheck and single test files regularly, the full suite once at the end. Verify before returning.
5. **Feature acceptance** — the feature is done when every component's acceptance passes. State explicitly.

## Integration

After dispatched subagents return, the main session integrates: resolves any seams between components, runs the feature's full acceptance, and logs notes to `implementation-notes.md`.

## INDEX → `build-briefs/INDEX.md`

One line per feature: name · components · status (☐/✅).

Rule at top: build features in dependency order.

Review phase starts only when every feature is ✅.

## Principles to encode

- Surgical (touch only what each step requires).
- TDD (failing test → implement → refactor).
- One concern per step, tight diffs.
- Evidence at every gate (test output, not "should work").
- Notes → `implementation-notes.md`.

## Output

Write `build-briefs/<feature>.md`, update `INDEX.md`, print the component map + dispatch plan for review.

Do not start the build — quiz the user first: does the granularity feel right (too coarse / too fine), are the blocking edges correct (each component gated only by what genuinely blocks it), should any components be merged or split. Iterate until the user approves, then build.
