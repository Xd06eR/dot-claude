---
name: build-brief
description: Produce one comprehensive build brief per feature from the project's spec and plan docs. Use when the user asks to build a planned feature that has no build brief yet.
argument-hint: <feature ... | all>
origin: custom + mattpocock
---

Read the spec+plan for the components of the named feature(s) and produce ONE comprehensive build brief per feature. This skill only writes the briefs and their INDEX rows.

## What is a feature

A feature is a buildable chunk of the project: a group of components built together, sized so the brief fits one fresh context. A terminal integration component (the UI layer that depends on everything else) is legitimately its own feature.

The test is empirical: a builder that repeatedly cannot finish inside one fresh context means the feature was too big (split at dependency seams); a build whose brief and dispatch overhead outweighs the work means it was too small (merge it into a neighbor).

**Slicing:** components are tracer-bullet vertical slices wherever possible. Each slice cuts a narrow but COMPLETE path through every layer it touches (schema, API, UI, tests), not a horizontal slice of one layer. A finished slice is demoable or verifiable on its own, and sized to fit in a single fresh context window. Any prefactoring that would make the implementation easier lands first ("make the change easy, then make the easy change").

**Wide refactors are the exception to vertical slicing.** A wide refactor is one mechanical change (rename a column, retype a shared symbol) whose blast radius fans across the whole codebase, so no vertical slice can land green. Sequence it as **expand–contract**: first expand (add the new form beside the old so nothing breaks), then migrate call sites in batches sized by blast radius, each batch its own step blocked by the expand, green batch to batch because the old form still exists, finally contract (delete the old form once no caller remains), blocked by every migrate batch. When even the batches can't stay green alone, keep the sequence but let them share an integration branch that all block a final integrate-and-verify step: green is promised only there.

## Input

The invocation names one or more features; `all` means every feature in the plan INDEX without a build-INDEX row. A feature's components are the plan INDEX's rows under that feature; each must already have a spec and a plan in `docs/plan/` — read both per component.

If a named component has no spec or plan, stop and say so: Plan has not produced it. Do not invent.

## Synthesize ONE feature brief → `docs/build/<feature>.md`

One brief per feature, covering every component. The shape, on a small auth feature (one section per component, in map order; auth-api shown):

```markdown
Executed by `build-feature auth-flow`. This document is the requirements source; progress lives in `docs/build/auth-flow.ledger.md`.

# auth-flow — build brief

## Feature goal

Users can register, log in, stay logged in, and log out. Load-bearing: sessions are server-side opaque tokens in httpOnly cookies.

## Global constraints

- Node >= 20; no new runtime dependencies.

## Component map

user-model → auth-api → login-ui

## Component: auth-api

- Goal: the HTTP auth API — the only session path.
- Scope: session module, auth routes, middleware.
- Depends on: user-model.
- Interfaces — Consumes: `createUser`, `findByEmail`. Produces: `attachAuth(router): void`, `requireSession`, `AuthError`.
- Build steps: <the component plan's checklist, verbatim>
- Acceptance: every success criterion in the auth-api spec passes as an integration test.

## Feature acceptance

All three components' acceptance checks pass; one browser flow registers, survives refresh, and logs out.
```

What the skeleton cannot show:

- Feature goal: what the feature delivers plus its load-bearing design decisions, drawn from the component specs.
- Global constraints carry VERBATIM from the component plans' Global constraints blocks: they bind every build step and are the reviewers' attention lens, so exact values travel, not paraphrases.
- Component map edges are blocking: a component starts only when its blockers are complete. Order foundation-first.
- Interfaces copy verbatim from the component plans: the exact signatures a fresh-context builder needs from neighbors it cannot see.
- Build steps carry the plan's checklist in full: brief sections are read out of order.
- Acceptance is checkable. The feature is done when every component's acceptance passes; state it explicitly.
- The brief carries approved content forward and adds assembly (order, edges), never new decisions: anything the feature needs that no plan holds is flagged, not invented.

## INDEX → `docs/build/INDEX.md`

A feature's row sits below every row its Depends on names. The shape, with two features in flight:

```markdown
# Build INDEX

Build features in dependency order.

| Feature | Components | Depends on | Built |
|---|---|---|---|
| auth-flow | user-model, auth-api, login-ui | — | ☐ |
| notes | notes-model, notes-api, notes-ui | auth-flow | ☐ |
```

## Gate

Print each feature's component map + blocking edges for review, then quiz the user: does the granularity feel right (too coarse / too fine), are the blocking edges correct (each component gated only by what genuinely blocks it), should any components be merged or split. Iterate until the user approves, then output the exact commit command covering the new `docs/build/` content. Do not start the build; point them at `build-feature`.
