---
description: Audit current dir or a target dir for drift, contradictions, stale refs, weak-model-misread wording. Periodic review, not rebuild.
argument-hint: [optional target dir; defaults to cwd]
---

# Audit

Periodic drift audit. **Review, not rebuild.** Surgical fixes only; never wholesale rewrite.

## Target

Arguments: "$ARGUMENTS"

- Empty → audit the current working directory.
- Path given → audit that directory.

Detect what kind of target it is (a harness dir like `~/.claude`, or a project repo) and run the matching checks below. State the detected target type before proceeding.

## Checks

### Harness-style target (e.g. `~/.claude`)

1. **Cross-file contradictions.** Rules in different files that conflict when both apply. Example: one file says "two retries max", another says "three".
2. **Stale references.** File paths, tool names, MCP connectors, skill names, frontmatter `paths:` globs that no longer resolve.
3. **Size budget.** Any single `rules/**` file beyond ~8 KB; unscoped set (`rules/common/*.md` + `rules/orchestration/*.md`) beyond ~40 KB total; `MEMORY.md` beyond ~30 lines. Measure with `wc -c`.
4. **Weak-model-misread wording.** Abstract asks without criteria or examples ("maintain high quality", "be careful"). Every rule must be executable by a mid-tier model: concrete, with judgment criteria, at least one positive example.
5. **Coverage gaps.** Task types appearing in real use but missing from `rules/orchestration/dispatch-templates.md` (search/implement/refactor/research/review).
6. **Promotion candidates.** Lessons in memory that have held across 3+ sessions and read as stable rules, but are not yet in `rules/**`.
7. **Orphaned memory.** Memory entries nothing links to (`[[name]]` pointing nowhere), or memory links pointing at deleted entries.
8. **Rejected-proposal resurfacing.** Current state or recent changes re-propose something memory'd as a rejected proposal.

### Skill and agent layer (harness-style target)

Descriptions and frontmatter are load-bearing: a skill only fires if its description matches the situation, and a dangling install silently vanishes from the menu. Check `skills/*/SKILL.md`, `agents/*.md`, and `commands/*.md`:

9. **Dead skill/agent installs.** A `SKILL.md` whose body references a bundled file, script, or sibling skill that is not on disk; a skill dir whose `SKILL.md` is a broken symlink (`find skills -xtype l`, want 0); an agent named in a phase-gate or chaining clause that has no `agents/*.md`. These read as "available" but fail at invocation.
10. **Description drift (auto-invocation).** Descriptions keyed to trigger phrases ("use when the user says X") instead of intent/phase ("use at the [phase] when [situation]") — the former only fire on literal lexical matches and are the top cause of skills not auto-invoking. Also flag: a description whose chaining clause names a renamed, converted, or deleted skill.
11. **Skill-invocation probe.** For skills with clear trigger phrases, run `claude -p '<probe prompt>' --tools "Skill" --output-format stream-json --verbose` and check the stream for a real `Skill` tool_use (`"name":"Skill"`) invoking the expected skill — or a phase-gate predecessor of it (a build-phrased probe may correctly fire a Design-phase skill first). A positive proves prompt-to-skill routing and actual invocation, not just an announce line. A zero is uninformative, not evidence of breakage; the skill's full workflow still needs an interactive session to verify.
12. **Git-safety in skills.** Any skill body that executes `git commit`/`git push`/`gh pr create`/`glab mr create` or another remote mutation instead of emitting it as an output-for-the-user block. Mutations belong in a fenced block whose first line is an explicit do-not-execute marker; flag any that run directly (violates the never-run-git rule in `CLAUDE.md`).
13. **Cross-platform commands.** Skill/hook commands assuming one OS: bare `python3` or bare `python` without a `command -v python3 || command -v python` detect chain; a file opener without an `open || xdg-open || start || echo` fallback; Linux-only tools (`lsof`, `xclip`, `xdg-*`) with no fallback. The harness runs on Linux, macOS, and Windows Git Bash.
14. **Source-line readability.** Files (especially agent lens/data files) where a whole list or multi-sentence block is crammed onto one 400+ char source line. One list item per bullet line; long prose gets semantic line breaks. The atomic-unit rule forbids breaking inside a sentence, not putting each item on its own line.

### Project-style target

1. **CLAUDE.md / AGENTS.md.** Depth judgment: these files load into every agent session in this tree and shape all downstream behavior, so contradictions here compound across skills. Find every `CLAUDE.md` and `AGENTS.md` in the target tree (root + subfolders); per file check:
   - **Layering**: nested files add specificity vs parent and vs global `~/.claude/CLAUDE.md`. Restating = drift bait.
   - **Contradictions**: with global rules, with parent file, with actual code state.
   - **Stale instructions**: referenced files, tools, commands, env vars that no longer exist.
   - **Missing critical sections**: test/lint/build commands, architecture overview, gotchas, conventions.
   - **Cargo-cult**: rules that no longer match reality or that no one follows. Test: if deleted, what breaks?
   - **Quality bar**: concrete and executable, not abstract ("be careful" fails this). For deep per-file quality audit, defer to `claude-md-improver`.
2. **Dead references.** File paths, function names, env vars, types referenced in docs or comments that don't exist in code.
3. **Documented commands runnable.** Test/lint/build commands in docs actually work. Run them; report failures.
4. **Doc drift.** Comments, README, docstrings describing old behavior after code changed.
5. **Dependency hygiene.** Unused dependencies declared, missing lockfile, inconsistent version pins.

For project targets, do NOT duplicate work covered by `/review`, `/qa`, `/code-review`, `claude-md-improver`. Focus on drift and contradictions; defer pure code-quality findings to those skills.

## Method (no self-verification, per `rules/orchestration/dispatch.md` §5)

This audit fans out: 2 subagent dispatches (investigator + adversarial reviewer) plus a full read of the target working set. Heavy; proceed.

**Phase 1 — Map.** Dispatch a fresh-context investigator subagent to inventory relevant files (rules, memory, CLAUDE.md, project docs; for a harness target also `skills/*/SKILL.md` frontmatter + `agents/*.md`). It returns `file:line + one-line role` per item, not file contents. For the skill/agent layer it also returns each skill's `name` + `description` (the fields checks 9-14 judge) and flags any broken symlink or missing bundled file it hits.

**Phase 2 — Audit.** Main agent reads the working set directly (the files findings will touch), runs the applicable checks above, drafts findings.

**Phase 3 — Adversarial review.** Dispatch a fresh-context reviewer subagent. Brief the reviewer with `file:line` + finding only — not the auditor's reasoning — to avoid anchoring. Refute each finding; look specifically for rules fighting each other, stale path/tool names, and wording a weaker model would misread. Drop any finding that does not survive. Each surviving finding keeps `file:line + concrete failure scenario`. If the Agent tool is unavailable, fall back to a skeptical self re-read and tag each finding `Self-verified` so the user knows the no-fresh-context caveat.

**Subagent gotcha:** if a `block-dangerous-git.sh`-style PreToolUse hook is active, a dispatched agent that runs `grep 'git commit'` in Bash gets killed — the hook pattern-matches the command string even inside a search. Tell dispatched agents to use the Grep tool (not Bash `grep`) for any search whose pattern contains a git-mutation literal.

**Phase 4 — Apply per change tier** (per `rules/common/harness-maintenance.md`):
- **Self-serve**: name-only dead-ref fixes (file/tool renamed, path moved — no behavior or routing change), `MEMORY.md` index line updates. Apply directly, show diff.
- **Ask-first**: stale routing or policy rules that look dead but would change behavior if updated; any semantic change to `CLAUDE.md`, `rules/**`, `settings.json`, `hooks/`, `paths:` globs, plugins/skills/MCP. List, do not apply.
- **Never**: wholesale rewrite of a working file, `git commit`/`git push`, touching credentials. Flag only.

**Phase 5 — One-page summary.** What changed (with diffs), what proposed (the ask-first list), what was skipped and why, what the audit cannot catch.

## Output format

Findings ranked per `rules/common/code-review.md` severity:

| Level | Meaning | Action |
|---|---|---|
| CRITICAL | Rules contradict, broken ref causing wrong routing, data-loss risk | BLOCK — fix or flag before next session |
| HIGH | Stale ref, missing criteria, size budget exceeded, doc drift | WARN — propose fix this session |
| MEDIUM | Wording ambiguity, redundancy, minor coverage gap | INFO — note for later |
| LOW | Style polish | NOTE — optional |

Each finding: `file:line: <severity>: <problem>. <fix>. [tier: self-serve|ask-first|never]`

## Honesty clause

Mark what this audit CANNOT catch:
- **Taste and design quality** have no checkable criterion. Flag as "judgment call — escalate model or ask user."
- **Whether a rule actually improves outcomes** requires metrics the audit does not collect. Flag for user review.
- **Cross-session drift** is invisible; audit sees only current state. Note this in the summary.

If uncertain: look it up. If unconfirmable: mark `UNVERIFIED`. Never fabricate.

**Behavioral checks need the real runtime.** Full skill auto-invocation can only be confirmed in an interactive session. A headless `claude -p` probe may match a skill (see check 11), but a zero is a false negative; do not assert pass/fail from a `-p` run.

## Ruled out (do not do)

- Wholesale rewrite of CLAUDE.md, rules, or any working file.
- `git commit`, `git push`, or any destructive op. Output commands for the user.
- Adding dependencies, skills, plugins, or MCP connectors.
- Rebuilding from scratch. Surgical fixes only.
- Auto-applying ask-first or never-tier changes.
- Phase inflation (autoplan-style multi-voice orchestration) — 5 phases is the ceiling.
- Per-fix auto-commit (qa-style) — wrong here; blast radius is the target dir itself.