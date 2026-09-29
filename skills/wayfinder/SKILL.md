---
name: wayfinder
description: Chart an effort too big to decide in one session as a staging map (destination, decisions index, fog, out-of-scope) whose sharp questions live as OPEN-QUESTIONS.md entries, then resolve them one entry per session until the way is clear and hand off to bake-design.
disable-model-invocation: true
argument-hint: "[new effort idea — omit to work the active map]"
origin: mattpocock
---

A loose idea has arrived, too big for one session to decide, wrapped in fog. Wayfinding finds the way; it never charges at the destination.

It plans, it does not do: every question on the map resolves into a decision, and the map is done when nothing is left to decide. There is no override: execution lives downstream in `build-feature`. The pull to just do the work is usually the signal the map has reached its edge: hand off, don't charge.

## The map

`WAYFINDING.md` at the project root, one active map per project: staging, never canonical, it dies at hand-off.

- Sections: Destination / Notes / Decisions so far / Not yet specified / Out of scope.
- An index, not a store: Decisions so far carries one line per ruled register entry (`#NN` + title + gist), never restating the ruling.

Fog lives only in Not yet specified; the test for fog vs entry is whether you can state the question precisely now, not whether you can answer it. Don't pre-slice fog into entry-sized pieces: it is coarser than an entry, and one patch may graduate into several entries, or none.

Work ruled out of scope returns only if the destination is redrawn, and then as a fresh effort, never a resumption.

## The entries

Sharp questions are ordinary `OPEN-QUESTIONS.md` entries (format per `open-questions`) carrying up to three extra fields: `**Effort:**` <this map's name> (required for map entries), `**Type:**` talk | prototype | research | task (default talk), `**Blocked by:**` #NN. The frontier is the effort's OPEN entries with no live `Blocked by`.

Type routes resolution:

- talk → call the Skill tool with "grilling"
- prototype → call the Skill tool with "prototype"
- research → call the Skill tool with "research" as a background agent
- task → do it directly, only when manual work blocks a decision

## Chart the map (invoked with a new effort)

1. Settle the Destination first: call the Skill tool with "grilling" and "domain-modeling". The destination fixes every entry's scope.
2. Grill again, breadth-first: fan across the whole decision space, surfacing open decisions and the first takeable questions. If this surfaces no fog, stop: the effort fits one session — hand back to `grill-with-docs`.
3. Write `WAYFINDING.md` (Destination, Notes, empty Decisions so far, fog in Not yet specified).
4. Call the Skill tool with "open-questions", then create register entries for the questions already sharp, with Effort/Type/Blocked-by fields. Fire research entries as background agents now.
5. Stop. Charting is one session's work; it hand-resolves nothing.

## Work the map (invoked with an active map)

1. Load the map (the low-res view), then one entry: the user-named one, else the first frontier entry.
2. Resolve it per its Type. Never more than one entry per session (research excepted). Call the Skill tool with "open-questions" and write rulings as you go.
3. Append the entry's line to Decisions so far; graduate any fog the ruling made phrasable into fresh entries; strike what graduated from Not yet specified. A ruling that exposes an entry as beyond the destination rules it out of scope (one line in Out of scope; the entry drops per `bake-design`'s Drop path: deleted from the register, no ADR, one PROGRESS-LOG line).
4. Stop. Report what resolved, what graduated, what is now takeable.

## Map cleared

Not yet specified empty and every effort entry RULED → `bake-design` per entry, then `plan-from-design`. Delete the map when its last entry retires; the narrative lands in `PROGRESS-LOG.md` at bake.

## It's working if

- The destination is written down and agreed before any entry exists.
- Every entry reads as a question; "build the X" is mis-typed or downstream work.
- One session resolves one entry and stops; Not yet specified shrinks over time; a cleared map hands toward bake, never toward code.
