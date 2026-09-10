---
name: session-sync
description: "Sync work across sessions: §Start re-grounds from TODO.md; §End captures state into TODO.md and PROGRESS-LOG.md."
disable-model-invocation: true
origin: custom
---

Bridge two sessions: §Start re-grounds at the beginning of one, §End captures state before one dies. This skill writes `TODO.md` and `PROGRESS-LOG.md`, with two exceptions — `bake-design` appends the bake session narrative to `PROGRESS-LOG.md` (it must land at bake time, not batched to session end) and writes the bake hand-off row to `TODO.md`.

Routing, in order. Wording alone is unreliable, so check state first:

1. **Session state decides it.** A session with prior work in it (decisions made, files edited) is §End. A session that has done nothing yet is §Start.
2. **Wording confirms it.** "resume / continue" points at §Start. "compact / pause" points at §End.
3. **When the two disagree, or anything is unclear: run §Start.** Apart from the step-1 pull, it is read-only. §End rewrites the "▶ Next-session resume" block, so running it by mistake in a fresh session overwrites its real content with an empty one, the only irreversible failure in this skill.

Compaction drops the conversation from context; the transcript stays on disk. Write everything down before compacting anyway; the transcript is a recovery tool, never the plan.

## §Start — starting a session

1. **Check the repo is current.** `git status -sb` and `git log -1 --format='%h %ad %s' --date=relative`. Behind upstream: pull before continuing. A stale read produces confidently wrong state. A pull conflict means local work has diverged from upstream; stop and resolve it with the user before continuing. Uncommitted work elsewhere produces no git signal here; step 2 is the only net.
2. **Read `TODO.md`**, starting at "▶ Next-session resume". Absorb current state, the don't-re-litigate pointers, and the task table.
3. **Treat user context as claims to reconcile.** The user may say what was resolved or decided since the docs were written. Check each claim against the docs and FLAG any mismatch, rather than silently believing either side.
4. **Classify the task table before offering it.** Sort into:
   - **Pickable now** — no gate, no unmet dependency.
   - **Blocked** — name the blocker.
   - **Not due** — a trigger that has not fired; state the current reading against it.
5. **Read any `OPEN-QUESTIONS.md` entry the user names** (#NN) in full before discussing it. Entries are deleted at bake; their decision record lives in `docs/adr/`.
6. **Echo and stop.** Report current state, the classified task list, and what you would pick next with one line of reasoning. Wait for the user's pick before doing any work. The pick routes normally: a design discussion opens with `grill-with-docs`; a settled entry goes to `/bake-design`.

Read enough to echo state accurately, then wait.

## §End — ending a session

1. **Rewrite `TODO.md`'s "▶ Next-session resume" block** per the TODO.md format below. This block is the only part of `TODO.md` that gets rewritten.
2. **Condense mechanically.** If `TODO.md` exceeds ~250 lines OR ~10 KB, fold still-relevant old material into the resume block now, not when someone notices. Line counts miss prose walls; the byte threshold is the backstop for that failure shape.
3. **Verify capture before logging.** If the session produced design rulings, confirm each one landed in `OPEN-QUESTIONS.md`, an ADR, or a design doc. The log entry records the session; it is not the capture net for rulings. Then propose `design-audit` `full` on the transcript: completeness, consistency's said-vs-written, and soundness on rulings still unbaked; state the spend (how many agents, reading what) and wait for the call; skip the proposal when a bake already ran `full` this session. Soundness findings land in the entry itself, not only in the report.
4. **Append to `PROGRESS-LOG.md`**, one dated entry: what was decided and why. Record the number or constraint that killed each alternative, rejected proposals with their reasons, and corrections the user made mid-discussion. The outcome lives in the state docs; the reasoning lives here.
5. **Condense mechanically.** If `PROGRESS-LOG.md` exceeds ~500 lines OR ~50 KB, delete the oldest whole entries down under the window. Confirm the outgoing entries are committed first — deletion hands the verbatim to git history, which is the archive; the file is the recent window. No archive file, no marker line.
6. **Cross-check consistency.** `TODO.md` against `OPEN-QUESTIONS.md` — no gaps, statuses consistent.
7. **Commit and push the captured docs.**
8. **Confirm** the next session has everything it needs, and it is safe to compact or switch away.

## TODO.md format

```markdown
# TODO

## ▶ Next-session resume

<3-6 lines, bullets, no prose walls: current state · what just finished · where to resume · don't-re-litigate pointers (ADR refs, never restated)>

## Tasks

| Pri | Effort | Task | Gate |
|---|---|---|---|
```

- **One task per row**, one bounded action each. Open-question items reference their entry (`#NN`).
- **Pri:** P0 critical path (blocks build) · P1 important, do soon · P2 improvement/housekeeping. **Effort:** trivial / easy / medium / hard.
- **Gate is required.** `—` means pickable; anything else names why the row is not pickable (a blocker, or the trigger that has not fired). §Start reads the Gate column to classify. Never infer from prose.
- The task table is edited in place as tasks open, move, and close.
- Don't-re-litigate decisions are NOT a section here: they live in `docs/adr/`.