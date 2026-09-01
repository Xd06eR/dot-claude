---
name: open-questions
description: Maintain the project's live register of open design questions and their rulings (OPEN-QUESTIONS.md). Use when a design discussion produces rulings, open questions, or rejected options in a project that keeps the file.
origin: custom
---

The live register of design questions still in flight. One register per project (default `OPEN-QUESTIONS.md` at the project root; the project's `CLAUDE.md` may name another path). If the project keeps no such file, this skill does nothing: never push for its creation, never park rulings in another file.

The register is a state document holding live items only. An entry leaves the register at bake: the design goes to canonical, the context goes to ADRs. The reasoning narrative of a session belongs to `PROGRESS-LOG.md` when the project keeps one.

## Status legend

Entry-level statuses:

- 🟡 **OPEN** — no ruling yet
- 🟢 **RULED** — all sub-questions ruled, bake not yet run
- ⛔ **BLOCKED** — cannot proceed; name the gate (user-time, a dependency, something external)

Per-ruling marker:

- ⚠️ **PROVISIONAL** — the ruling is recorded, but one of its inputs comes from a question still open. Written inline as `⚠️ PROVISIONAL — depends on #NN Q#`, naming the question, not just the entry. It blocks that ruling alone from baking while the rest of its entry proceeds, and it is the pointer for the reverse sweep.

There is deliberately no BAKED status. An entry is deleted at bake, so the status would never rest on anything; a terminal state invites entries to linger in the live file.

The glyph is a coarse headline; the real gate for baking is every ruling being free of ⚠️ PROVISIONAL markers.

## Entry format

One entry per question, numbered stably (#NN).

This is the one artifact where design and context may be entangled: an entry may sprawl, hold competing options, and carry half-answered sub-questions while open.

Compaction happens at bake, never before: compressing an entry mid-flight destroys the material the ruling will be built from.

```markdown
## <NN>. <Question title>

**Status:** 🟡 OPEN

**Context:** <what forces the question — the defect, constraint, or gap it names>

- R1: <the current decision> — <the reason that won>
- R2: <another settled sub-point> — <why>  ⚠️ PROVISIONAL — depends on #MM Q3
- Rejected: <option> — <the reason that killed it>

**Open:** <numbered Q1, Q2, … — sub-questions still in play; when one resolves, point it at the R# that settled it rather than deleting it>
```

An entry with related neighbors may add an **Interaction:** block naming which entry owns which neighboring question and what pauses what: the reverse sweep finds marked dependencies, but ownership boundaries between entries live here.

## Discipline

- **Write as you go.** A ruling lands in its entry the moment it is ruled: one sub-item decided, one edit applied. Never batch rulings to the end of the discussion or the session; a ruling that lives only in conversation is one compact away from lost.
- **Number rulings stably (R1, R2, …).** The id is how everything else names the ruling: supersession pointers, resolved open items, and the ADR's Consequences lines (named by original id) all reference it. R-numbers are entry-local: inside the entry cite as `R4`; from anywhere else cite as `#NN R4`.
- **Supersede by strikethrough.** When a new ruling replaces an old one, strike the old line and point at the new (`~~R4: …~~ SUPERSEDED → R9`); never delete it and never silently rewrite it. The struck text stops the old option being re-proposed next session, and it is the raw material the bake's ADR Considered-options draws from. For a partial amendment, strike only the affected clause.
- **Fold, don't fork.** When a new question is the same topic as an open entry, fold it in and note the fold (`folds #NN`): entry numbers are never reused, and the note is what keeps references to the folded entry resolving.
- **Mark PROVISIONAL** any ruling whose inputs come from a question still open, including an open question inside the same entry. Mark it as the ruling is written: a ruling recorded as confirmed reads as confirmed in every later session, and nothing re-derives what it leaned on.
- **Sweep the reverse direction** when a question is ruled: grep `depends on` for its number, re-check every marked ruling against the answer just reached, and clear the marker or restate what still blocks it. Clearing is a required step, not a courtesy: a marker left standing after its dependency lands blocks a bake that should proceed.
- **Rejected options earn a line only when real.** Record a rejection when the option is plausible enough to be proposed again; a rejection nobody would ever revisit needs no record.
- **Create the file lazily** — only when the first open question needs a home.
- **Prune trigger.** If the register exceeds ~1,500 lines OR ~100 KB, run a prune sweep: bake what is ready, drop what is stale, restate what still matters. Sprawl while open is legitimate, so the threshold is loose; the byte half exists because line counts miss prose walls.
- **Entries leave at bake.** `/bake-design` deletes a fully-baked entry; a partially-baked entry stays, holding only its unbaked rulings. Nothing is archived into the register.
- When the project keeps a `TODO.md`, actionable entries (above all BLOCKED ones) also surface there as task rows referencing the entry number, written by `/session-sync`, the table's owner. The register holds the design detail, `TODO.md` holds the pick-next menu.
