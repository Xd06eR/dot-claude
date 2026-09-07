---
name: setup-workflow
description: Writes the Workflow-docs block into a project's CLAUDE.md, adopting the 4-phase workflow's document conventions for future sessions.
disable-model-invocation: true
origin: custom
---

Write the block below into the project's `CLAUDE.md` and nothing else: directories and artifact files are created lazily by their writer skills when they first have content. Re-run to switch layouts or after the workflow conventions change.

## Process

1. **Detect.** Find the project root (`git rev-parse --show-toplevel`; fall back to the working directory if not a git repo). Does `CLAUDE.md` exist at the root? Do any workflow artifacts already exist (any of the artifacts named in the block below)? Does a non-default layout exist — design docs living under other paths the user names or you find?
2. **Present findings and the block.** Show exactly what will be written. If an existing layout diverges from the defaults, adapt the paths in the block to reality rather than imposing the defaults.
3. **Write.** If `CLAUDE.md` exists, add the `## Workflow docs` section, or update it in place if one already exists: never duplicate it, never overwrite surrounding user content. If no `CLAUDE.md` exists, ask before creating one.
4. **Stop.** Report which artifacts exist already and which will appear lazily. Do not create directories, do not create artifact files, do not start any workflow phase.

## The block

Adapt paths to the detected layout; keep one line per artifact.

```markdown
## Workflow docs

This project uses the 4-phase workflow (Design → Plan → Build → Review). Cross-session continuity lives in these artifacts. Paths in this block override the defaults the workflow skills name. **State docs are rewritten to current truth; logs are appended, never rewritten.**

- `CONTEXT.md` — domain glossary: what things are named here (plus banned synonyms). Read before writing domain-facing text; updated as terms settle.
- `docs/adr/` — decision snapshots: one frozen file per independently-reversible choice (what forced it, what was chosen, what lost), with a `README.md` index. Canonical carries the spec; the ADR carries the why.
- `docs/design/` — canonical design: settled, user-approved, determined-only (no open/provisional markers). Specs derive from these.
- `OPEN-QUESTIONS.md` — the design capture surface: every ruling lands here as it is made, created lazily on the first ruling (it may stay empty). Entries leave at bake (promotion into canonical).
- `docs/plan/` — per-component `<component>-spec.md` + `<component>-plan.md` + `INDEX.md` (dependency order + status tracker). Consumable: once the feature's Review passes, the spec's durable content flows home (decisions → ADR, as-built deltas → design, criteria → tests); then spec, plan, and the feature's INDEX rows delete, each in its own commit.
- `docs/build/` — per-feature `<feature>.md` brief + `<feature>.ledger.md` (build progress log) + `INDEX.md`. Consumable: retires with the feature's plan docs once Review passes.
- `TODO.md` — session resume anchor (`▶ Next-session resume`) + current task table. First read at session start.
- `PROGRESS-LOG.md` — append-only session log: the reasoning narrative behind each session's work.
- `docs/build/implementation-notes.md` — build-phase decisions, deviations, and tradeoffs, logged as built. Consumable: a feature's entries retire with its plan docs once Review passes; the file deletes when no build work is in flight.
```
