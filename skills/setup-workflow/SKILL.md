---
name: setup-workflow
description: "Writes the 4-phase workflow's document conventions into a project: the Workflow-docs block in root CLAUDE.md, plus one CLAUDE.md per artifact folder."
disable-model-invocation: true
origin: custom
---

Write the workflow's document conventions into the project: the block into the root `CLAUDE.md`, and a CLAUDE.md per artifact folder carrying that folder's conventions. Folders and their CLAUDE.md files are created here; artifact files stay lazy, created by their writer skills at first content. Re-run to switch layouts, change the layer selection, or after the workflow conventions change.

## Process

1. **Detect.** Find the project root (`git rev-parse --show-toplevel`; fall back to the working directory if not a git repo). Does `CLAUDE.md` exist at the root? Do any workflow artifacts already exist (any artifact named in the block below, or folder CLAUDE.md files from an earlier run)? Does a non-default layout exist — design docs living under other paths the user names or you find?
2. **Interview.** Ask which optional layers the project wants (multi-select, two groups). Design surface: `OPEN-QUESTIONS.md` (rulings captured as they are made; without it they live in the conversation until bake), `CONTEXT.md` (domain glossary), `docs/adr/` (decision snapshots). Continuity: `TODO.md` (the session resume anchor `/session-sync` re-grounds from, plus a machine-kept task queue of pending gate work — every bake/plan/build item a row with its bake commit, so nothing is re-derived; default on), `PROGRESS-LOG.md` (the reasoning trail: decisions, rejected options, corrections). The three `docs/` phase folders (design, plan, build) are not optional: they are the phase artifacts themselves.
3. **Present findings and the writes.** Show exactly what will be written: the block carrying only the chosen layers' lines plus any named-decline lines, and the per-folder CLAUDE.md files for the chosen layers' folders. If an existing layout diverges from the defaults, adapt paths to reality rather than imposing the defaults.
4. **Write.** Root `CLAUDE.md`: add the `## Workflow docs` section, or update it in place if one exists — never duplicate it, never overwrite surrounding user content; if the root has no `CLAUDE.md`, ask before creating it. Folders: create the artifact folders and write each folder's CLAUDE.md from the templates below; an existing folder CLAUDE.md updates in place with the same never-overwrite rule. Declined layers get no artifact line, no folder, and no template; references to a declined layer drop from the remaining lines and templates, rewording where a bare drop breaks the sentence. Every declined optional layer also earns one named-decline line at the block's end (forms below): each has a writer that fires from the workflow's own momentum (rulings, gate advances, session ends, bakes, term resolutions), and the always-loaded block is where that writer meets a standing refusal instead of recreating the file.
5. **Stop.** Report what was written. Do not create artifact files, do not start any workflow phase.

## The block

Adapt paths to the detected layout; keep one line per artifact.

```markdown
## Workflow docs

This project uses the 4-phase workflow (Design → Plan → Build → Review). **Retire a feature's consumables the moment its Review passes**: durable content flows home first (decisions → ADR, as-built deltas → design, criteria → tests), then deletion; output one commit command per deletion. Each artifact folder's CLAUDE.md states its conventions. Paths in this block override the defaults the workflow skills name.

One feature's flow: rulings land in `OPEN-QUESTIONS.md` → bake into `docs/design/` → plan into `docs/plan/` → brief and build in `docs/build/` → Review passes → consumables retire. Status homes: structure and order → `docs/plan/INDEX.md`; briefed and built → `docs/build/INDEX.md`; current phase → the feature row in `TODO.md`; mid-build detail → the ledger; history → git.

- `OPEN-QUESTIONS.md` — the design capture surface: rulings land as they are made; entries leave at bake. [optional layer]
- `CONTEXT.md` — the domain glossary. [optional layer]
- `TODO.md` — the task queue + session resume anchor. [optional layer]
- `PROGRESS-LOG.md` — the append-only session log. [optional layer]
- `docs/design/` — canonical design; specs derive from these.
- `docs/adr/` — decision snapshots. [optional layer]
- `docs/plan/` — specs + plans + `INDEX.md` (consumable).
- `docs/build/` — briefs + ledger + `INDEX.md` + `implementation-notes.md` (consumable).
```

When an optional layer is declined, append its named-decline line to the block:

- `OPEN-QUESTIONS.md` is not adopted: rulings live in the conversation until bake.
- `CONTEXT.md` is not adopted: no domain glossary is kept; use the vocabulary the code and docs already carry.
- `TODO.md` is not adopted: no task queue is kept — pending work is derived from the current docs against `docs/plan/` and the code, planning works on the merged current design (not per bake), and resume after a break reads the ledger, the INDEXes, and git history.
- `PROGRESS-LOG.md` is not adopted: no session log.
- `docs/adr/` is not adopted: no decision snapshots are written; the why stays in the design discussion and git history.

## The folder templates

Write one per artifact folder from the templates below; declined layers get no folder and no file.

`docs/design/CLAUDE.md`:

```markdown
# docs/design/ — canonical design docs

Settled, user-approved design lives here. Determined-only: no open or provisional markers (opens belong to `OPEN-QUESTIONS.md`). The same fact reads the same in every doc that touches it; a change updates every affected doc in the same pass. Design content lands only through bake-design's gate (it owns the content bar and doc placement); mechanical fixes (typos, dead links) edit directly. Derived digests (summaries, overviews, reference cards) are not design docs: never baked, never written here. When the user asks for one, it lives outside this folder as an external convenience doc.

Index the folder's docs in this file as they land: a `| Doc | Scope |` table, one row per doc.
```

`docs/plan/CLAUDE.md`:

```markdown
# docs/plan/ — specs, plans, and the plan INDEX

One `<component>-spec.md` + `<component>-plan.md` pair per component; `INDEX.md` groups components by `## <feature>` in dependency order. Formats are owned by the writer skill (`plan-from-design`); keep hand edits consistent with it.

Consumable: the pairs and the feature's INDEX rows delete at the feature's Review-pass.
```

`docs/build/CLAUDE.md`:

```markdown
# docs/build/ — briefs, ledgers, and the build INDEX

One `<feature>.md` brief per feature; build progress lives in `<feature>.ledger.md`; `INDEX.md` orders features by dependency; `implementation-notes.md` logs build-phase decisions and tradeoffs under `## <feature>` sections. Formats are owned by the writer skills (`build-brief`, `build-feature`); keep hand edits consistent with them.

Consumable: the brief, the ledger, and the feature's INDEX row retire with its plan docs at Review-pass; the notes file deletes when no build is in flight.
```

`docs/adr/CLAUDE.md` (only when chosen):

```markdown
# docs/adr/ — decision snapshots

One frozen file per independently-reversible choice (a future session could reverse it without touching the others): what forced it, what was chosen, what lost. Frozen once written; supersession flips `Status` and writes a new ADR. Format, guardrail, and numbering per `~/.claude/skills/domain-modeling/ADR-FORMAT.md`; one index row per ADR in `README.md`.
```
