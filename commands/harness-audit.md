---
description: Audit harness (~/.claude) or a project dir for drift, contradictions, stale refs, weak-model-misread wording. Periodic review, not rebuild.
argument-hint: [target dir; defaults to ~/.claude]
---

# Audit (harness or project)

Periodic drift audit. **Review, not rebuild.** Surgical fixes only; never wholesale rewrite.

## Target

- `$ARGUMENTS` empty → harness mode: audit `~/.claude`.
- `$ARGUMENTS` = dir path → project mode: audit that dir.

## Mode-specific checks

### Harness mode (primary when target = `~/.claude`)

1. **Cross-file contradictions.** Rules in different files that conflict when both apply. Example: one file says "two retries max", another says "three".
2. **Stale references.** File paths, tool names, MCP connectors, skill names, frontmatter `paths:` globs that no longer resolve.
3. **Size budget.** Any single `rules/**` file beyond ~8 KB; unscoped set (`rules/common/*.md` + `rules/orchestration/*.md`) beyond ~40 KB total; `MEMORY.md` beyond ~30 lines. Measure with `wc -c`.
4. **Weak-model-misread wording.** Abstract asks without criteria or examples ("maintain high quality", "be careful"). Every rule must be executable by a Sonnet-tier model: concrete, with judgment criteria, at least one positive example.
5. **Coverage gaps.** Task types appearing in real use but missing from `rules/orchestration/dispatch-templates.md` (search/implement/refactor/research/review).
6. **Promotion candidates.** Lessons in memory that have held across 3+ sessions and read as stable rules, but are not yet in `rules/**`.
7. **Orphaned memory.** Memory entries nothing links to (`[[name]]` pointing nowhere), or memory links pointing at deleted entries.
8. **Rejected-proposal resurfacing.** Current state or recent changes re-propose something memory'd as a rejected proposal.

### Project mode (primary when target = project dir)

1. **Project CLAUDE.md / AGENTS.md / README.** Contradictions with global rules, stale instructions (commands/files that no longer exist), missing critical sections (test, lint, build commands).
2. **Dead references.** File paths, function names, env vars, types referenced in docs or comments that don't exist in code.
3. **Documented commands runnable.** Test/lint/build commands in docs actually work. Run them; report failures.
4. **Doc drift.** Comments, README, docstrings describing old behavior after code changed.
5. **Dependency hygiene.** Unused dependencies declared, missing lockfile, inconsistent version pins.

In project mode, do NOT duplicate work covered by `/review`, `/qa`, `/code-review`. Focus on drift and contradictions; defer pure code-quality findings to those skills.

## Method (no self-verification, per `rules/orchestration/dispatch.md` §5)

**Phase 1 — Map.** Dispatch a fresh-context investigator subagent to inventory relevant files (rules, memory, CLAUDE.md, project docs). It returns `file:line + one-line role` per item, not file contents.

**Phase 2 — Audit.** Main agent reads the working set directly (the files findings will touch), runs the applicable checks above, drafts findings.

**Phase 3 — Adversarial review.** Dispatch a fresh-context reviewer subagent. Brief: refute each finding; look specifically for rules fighting each other, stale path/tool names, and wording a weaker model would misread. Drop any finding that does not survive. Each surviving finding keeps `file:line + concrete failure scenario`.

**Phase 4 — Apply per change tier** (per `rules/common/harness-maintenance.md`):
- **Self-serve**: dead-ref name fixes, `MEMORY.md` index line updates. Apply directly, show diff.
- **Ask-first**: any semantic change to `CLAUDE.md`, `rules/**`, `settings.json`, `hooks/`, `paths:` globs, plugins/skills/MCP. List, do not apply.
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

## Ruled out (do not do)

- Wholesale rewrite of CLAUDE.md, rules, or any working file.
- `git commit`, `git push`, or any destructive op. Output commands for the user.
- Adding dependencies, skills, plugins, or MCP connectors.
- Rebuilding from scratch. Surgical fixes only.
- Auto-applying ask-first or never-tier changes.