---
description: Audit current dir or a target dir for drift, contradictions, stale refs, format defects, weak-model-misread wording, routing violations, dead installs, and context-cost bloat. Run at the start of a harness-improvement session or when drift is suspected. Periodic review, not rebuild.
argument-hint: "[optional target dir; defaults to cwd]"
origin: custom
---

# Audit

The one comprehensive audit: drift, format, wording, routing, installs, coverage, and context cost. **Review, not rebuild.** Surgical fixes only. Never wholesale rewrite.

Quality bar: exhaustive, meticulous, inventory-wide. Every check states its own spec inline; no finding may lean on a document the reader must fetch.

## Target

Arguments: "$ARGUMENTS"

- Empty → audit the current working directory.
- Path given → audit that directory.

Detect what kind of target it is (a harness dir like `~/.claude`, or a project repo) and run the matching checks below. State the detected target type before proceeding.

## Checks — harness-style target (e.g. `~/.claude`)

### A. Drift and contradictions

1. **Cross-file contradictions (clash).** Rules in different files that conflict when both apply. This is the self-authored failure class: contradictory guidance an agent must silently arbitrate, invisible because output still looks fine. Example: one file says "two retries max", another says "three".
2. **Stale references.** File paths, tool names, MCP connectors, skill names, frontmatter `paths:` globs that no longer resolve.
3. **Rejected-proposal resurfacing.** Current state or recent changes re-propose something memory'd as a rejected proposal.

### B. Format and attachment

4. **Source-line readability.** Two defects, opposite directions.
   - **Cramming:** a whole list or multi-sentence block crammed onto one 400+ char source line; fix by putting each list item on its own bullet line. One item per line does not break inside a sentence, so the atomic-unit rule (never split a sentence, token, or string literal across source lines) still holds.
   - **Sticking:** a multi-claim block whose claims are joined by bare newlines with no blank line between; markdown joins them into one paragraph in render, silently merging claims. A single atomic sentence stays exempt even when long; bold-lead-in principle bullets are a false-positive class — never split them. Fix by function: fold sentences that illustrate one claim into one block; blank-separate a framing statement from its action; bullet obligations; give a hard requirement its own block.
5. **Markdown attachment defects.** Four kinds, all invisible in source; reading source hides them, so render the file and diff against source to catch them, and after a fix render-and-diff again to confirm it changed what was intended and nothing else. Rule of thumb: attachment is meaning. What a line touches decides its owner; never indent a sub-item with plain spaces.
   - **Sub-item by plain indent:** a subordinate line indented with spaces instead of nested under a `- ` marker reads as continuation in source but drops to a joined paragraph in render, silently losing the subordination.
   - **Detached lead-in:** a `:`-ended line separated from the list it introduces, or a `.`-ended line missing its blank line before what follows.
   - **List turned loose:** a blank line between a list item and its sub-items detaches the sub-items from their owner.
   - **Merged lists:** two lists separated only by a blank line merge into one in render.

### C. Wording

6. **Weak-model-misread wording.** Abstract asks without criteria or examples ("maintain high quality", "be careful"). Every rule must be executable by a mid-tier model: concrete, with judgment criteria, at least one positive example.

### D. Routing and invocation

7. **Description drift (auto-invocation).** Descriptions keyed to trigger phrases ("use when the user says X") instead of intent/phase ("use at the [phase] when [situation]"): the former only fire on literal lexical matches and are the top cause of skills not auto-invoking. Also flag a description whose chaining clause names a renamed, converted, or deleted skill.
8. **Skill-invocation probe.** For skills with clear trigger phrases, run `claude -p '<probe prompt>' --tools "Skill" --output-format stream-json --verbose` and check the stream for a real `Skill` tool_use (`"name":"Skill"`) invoking the expected skill, or a phase-gate predecessor of it (a build-phrased probe may correctly fire a Design-phase skill first). A positive proves prompt-to-skill routing and actual invocation, not just an announce line. A zero is uninformative, not evidence of breakage. The skill's full workflow still needs an interactive session to verify.
9. **Routing-not-inventory.** An always-loaded file (CLAUDE.md, unscoped rules) enumerating discoverable items: skill/agent lists with restated descriptions, situational enumerations that duplicate the session injection. The catalog is a routing table: phase-fired and auto-invoked names only. Descriptions live in frontmatter; discovery comes from the injection.

### E. Installs and safety

10. **Dead skill/agent installs.** A thing that reads "available" but fails at invocation:
    - A `SKILL.md` whose body references a bundled file, script, or sibling skill that is not on disk.
    - A skill dir whose `SKILL.md` is a broken symlink (`find skills -xtype l`, want 0).
    - An agent named in a phase-gate or chaining clause that has no `agents/*.md`.
11. **Git-safety in skills.** Any skill body that executes `git commit`/`git push`/`gh pr create`/`glab mr create` or another remote mutation instead of emitting it as an output-for-the-user block. Mutations belong in a fenced block whose first line is an explicit do-not-execute marker. Flag any that run directly (violates the never-run-git rule: the agent outputs exact commands, the user runs them).
12. **Cross-platform commands.** Skill/hook commands assuming one OS. The harness runs on Linux, macOS, and Windows Git Bash.
    - bare `python3` or bare `python` without a `command -v python3 || command -v python` detect chain
    - a file opener without an `open || xdg-open || start || echo` fallback
    - Linux-only tools (`lsof`, `xclip`, `xdg-*`) with no fallback

### F. Coverage and lifecycle

13. **Coverage gaps.** Task types appearing in real use but missing from the per-task-type acceptance checklist in `rules/common/dispatch-protocol.md` section 3 (named rows: merge/research/review; other types are covered by the generic report contract).
14. **Promotion candidates.** Lessons in memory that have held across 3+ sessions and read as stable rules, but are not yet in `rules/**`.
15. **Orphaned memory.** Memory entries nothing links to (`[[name]]` pointing nowhere), or memory links pointing at deleted entries.

### G. Context cost

Context is a standing cost: every always-loaded byte is paid every session. Estimate token consumption per layer (`words × 1.3` for prose, `chars / 4` for code-heavy files), then flag:

16. **Size budgets.** Any single `rules/**` file beyond ~8 KB. Unscoped set (`rules/common/*.md`) beyond ~40 KB total. `MEMORY.md` beyond ~30 lines. Measure with `wc -c`.
17. **Per-layer bloat.**
    - `agents/*.md`: file >200 lines (heavy on every spawn); `description` frontmatter >~30 words (loads into every agent-listing context).
    - `skills/*/SKILL.md`: file >400 lines; skip duplicate copies of the same skill elsewhere in the tree.
    - `rules/**/*.md`: governed by check 16's budgets; do not double-flag.
    - MCP servers (`.mcp.json` or active config): count servers and tools; estimate ~500 tokens per tool schema. Flag servers with >20 tools and servers that wrap CLI commands available for free (`gh`, `git`, `npm`).
    - `CLAUDE.md` chain (user + project): combined total beyond ~300 lines.
18. **Classify flagged components.** Sort each flagged component by reference evidence: **always needed** (referenced in CLAUDE.md, backs an active command, matches the current project type) → keep; **sometimes needed** (domain-specific, not referenced) → consider on-demand activation; **rarely needed** (no command reference, overlapping content, no project match) → remove or lazy-load. Removal proposals are ask-first, per Phase 4.

## Checks — project-style target

1. **CLAUDE.md / AGENTS.md.** Depth judgment: these files load into every agent session in this tree and shape all downstream behavior, so contradictions here compound across skills. Find every `CLAUDE.md` and `AGENTS.md` in the target tree (root + subfolders); per file check:
   - **Layering**: nested files add specificity vs parent and vs global `~/.claude/CLAUDE.md`. Restating = drift bait.
   - **Contradictions**: with global rules, with parent file, with actual code state.
   - **Stale instructions**: referenced files, tools, commands, env vars that no longer exist.
   - **Missing critical sections**: test/lint/build commands, architecture overview, gotchas, conventions.
   - **Cargo-cult**: rules that no longer match reality or that no one follows. Test: if deleted, what breaks?
   - **Quality bar**: concrete and executable, not abstract ("be careful" fails this). For deep per-file quality audit, defer to `claude-md-improver`.
2. **Dead references.** File paths, function names, env vars, types referenced in docs or comments that don't exist in code.
3. **Documented commands runnable.** Test/lint/build commands in docs actually work. Run them. Report failures.
4. **Doc drift.** Comments, README, docstrings describing old behavior after code changed.
5. **Dependency hygiene.** Unused dependencies declared, missing lockfile, inconsistent version pins.

For project targets, do NOT duplicate work covered by `review`, `qa`, `/review-pr`, `claude-md-improver`. Focus on drift and contradictions. Defer pure code-quality findings to those skills.

## Method (no self-verification)

The context that produced a finding never accepts it; a fresh context verifies. This audit fans out: 2 subagent dispatches (investigator + adversarial reviewer) plus a full read of the target working set. Heavy. Proceed.

**Phase 1 — Map.** Dispatch a fresh-context investigator subagent to inventory relevant files (rules, memory, CLAUDE.md, project docs; for a harness target also `skills/*/SKILL.md` frontmatter + `agents/*.md`). It returns `file:line + one-line role` per item, not file contents. For the routing/installs groups it also returns each skill's `name` + `description` (the fields checks 7-10 judge) and flags any broken symlink or missing bundled file it hits.

**Phase 2 — Audit.** Main agent reads the working set directly (the files findings will touch), runs the applicable checks above, drafts findings.

**Phase 3 — Adversarial review.** Dispatch a fresh-context reviewer subagent. Brief the reviewer with `file:line` + finding only, not the auditor's reasoning, to avoid anchoring. Refute each finding. Look specifically for rules fighting each other, stale path/tool names, and wording a weaker model would misread.

Drop any finding that does not survive. Each surviving finding keeps `file:line + concrete failure scenario`. If the Agent tool is unavailable, fall back to a skeptical self re-read and tag each finding `Self-verified` so the user knows the no-fresh-context caveat.

**Subagent gotcha:** if a pattern-matching PreToolUse hook is active (`block-dangerous-git.sh` matches `git commit`/`push`/`reset --hard`/etc.; `block-secret-paths.sh` matches `.env`/`.ssh`), a dispatched agent that runs `grep 'git commit'` or `grep '.env'` in Bash gets killed: these hooks pattern-match the command string even inside a search. Tell dispatched agents to use the Grep tool (not Bash `grep`) for any search whose pattern contains a git-mutation literal or a secret-path string.

**Phase 4 — Apply per change tier:**

- **Self-serve**: name-only dead-ref fixes (file/tool renamed, path moved, no behavior or routing change), `MEMORY.md` index line updates. Apply directly, show diff.
- **Ask-first**: stale routing or policy rules that look dead but would change behavior if updated; any semantic change to `CLAUDE.md`, `rules/**`, `settings.json`, `hooks/`, `paths:` globs, plugins/skills/MCP. List, do not apply.
- **Never**: wholesale rewrite of a working file, `git commit`/`git push`, touching credentials. Flag only.

**Phase 5 — One-page summary.** What changed (with diffs), what proposed (the ask-first list), what was skipped and why, what the audit cannot catch. For a harness-style target, add the context-cost block: total estimated overhead per layer (agents / skills / rules / MCP tools / CLAUDE.md chain) and the top 3 savings ranked by tokens.

## Output format

Findings ranked per the house severity scale:

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
- **Cross-session drift** is invisible. Audit sees only current state. Note this in the summary.
- **Token figures are estimates** (`words × 1.3`, ~500 per MCP tool schema), not metered spend. Real per-session cost needs runtime telemetry the harness does not collect.

If uncertain: look it up. If unconfirmable: mark `UNVERIFIED`. Never fabricate.

**Behavioral checks need the real runtime.** Full skill auto-invocation can only be confirmed in an interactive session. A headless `claude -p` probe may match a skill (see check 8), but a zero is a false negative. Do not assert pass/fail from a `-p` run.

## Ruled out (do not do)

- Wholesale rewrite of CLAUDE.md, rules, or any working file.
- `git commit`, `git push`, or any destructive op. Output commands for the user.
- Adding dependencies, skills, plugins, or MCP connectors.
- Rebuilding from scratch. Surgical fixes only.
- Auto-applying ask-first or never-tier changes.
- Phase inflation (autoplan-style multi-voice orchestration) — 5 phases is the ceiling.
- Per-fix auto-commit (qa-style) — wrong here. Blast radius is the target dir itself.
