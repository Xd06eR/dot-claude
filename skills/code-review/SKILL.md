---
name: code-review
description: Comprehensive code review of a diff or PR. Run when a diff needs an independent pass before it ships. Returns deduplicated, severity-ranked findings.
argument-hint: "[aspects: all | code | tests | errors | types | spec | simplify]"
origin: pr-review-toolkit + mattpocock + code-review plugin
---

The invocation may name review aspects to run; unnamed, run all applicable.

## Review workflow

1. **Determine Review Scope**
   - Check git status to identify changed files
   - Read `docs/build/implementation-notes.md` if it exists: build-phase deviations, tradeoffs, and parked findings inform where the review looks hardest
   - Read the invocation for named review aspects
   - If the user names a fixed point (commit, branch, tag), verify it resolves (`git rev-parse <point>`) and the diff is non-empty (`git diff <point>...HEAD`, three-dot) BEFORE dispatching any agent. Fail here, not inside the agents
   - Run the history probe in the main context, no dispatch: read the touched files' recent history (`git log`, `git blame` where the diff edits loaded areas) and prior merged-PR comments on them (`gh pr list --state merged`, `gh pr view --comments`). A change that contradicts or reintroduces a prior fix, or repeats something a prior review already flagged, is a finding like any other. Greenfield files and no prior PRs end the probe.

2. **Available Review Aspects:**

   - **tests:** Review test coverage quality and completeness
   - **errors:** Check error handling for silent failures
   - **types:** Analyze type design and invariants (if new types added)
   - **code:** General code review for project guidelines, comments included
   - **spec:** Review fidelity to the originating spec/PRD (if one exists)
   - **simplify:** Simplify code for clarity and maintainability
   - **all:** Run all applicable reviews (default)

3. **Identify Changed Files**
   - Run `git diff --name-only` to see modified files
   - Check if PR already exists: `gh pr view`
   - Identify file types and what reviews apply

4. **Determine Applicable Reviews**

   Based on changes:
   - **Always applicable:** code-reviewer (general quality, comments included); its dispatch prompt names `~/.claude/skills/code-review/review-standards.md` as the checklist source
   - **If test files changed:** pr-test-analyzer
   - **If error handling changed:** silent-failure-hunter
   - **If types added/modified:** type-design-analyzer
   - **If an originating spec/issue/PRD exists:** spec-reviewer. Search order: issue references in commit messages → a path the user passed → a spec file matching the branch/feature under the project's spec/plan dirs. If none found, ask the user; if there is none, skip and note "no spec available" in the summary
   - **After passing review:** code-simplifier (polish and refine)

5. **Launch Review Agents**

   Launch sequentially by default: each report is complete before the next dispatch. Parallel on explicit request.

6. **Aggregate Results**

   Cross-agent aggregation with dedup and severity normalization. See the Aggregation section below for the full logic.

7. **Provide Action Plan**

   Organize findings (severity-normalized; see Aggregation for dedup and ranking):
   ```markdown
   # PR Review Summary

   ## CRITICAL (N)
   - **CRITICAL** [file:line]: [issue] [[agents]] — [fix]

   ## HIGH (N)
   - **HIGH** [file:line]: [issue] [[agents]] — [fix]

   ## MEDIUM (N)
   - **MEDIUM** [file:line]: [issue] [[agents]] — [fix]

   ## LOW (N)
   - **LOW** [file:line]: [issue] [[agents]] — [fix]

   ## Strengths
   - [strength] [[agents]]

   ## Per-agent finding counts
   - code-reviewer: N
   - pr-test-analyzer: N
   - silent-failure-hunter: N
   - type-design-analyzer: N
   - spec-reviewer: N

   ## Recommendation
   BLOCK — N CRITICAL finding(s) must fix before merge.
   # or
   SHIP — no CRITICAL; N HIGH to address when convenient.
   # or
   SHIP — clean.
   ```

   Omit empty severity buckets and an empty Strengths bucket. If every bucket is empty, emit a single line under `## Recommendation`: `SHIP — no findings at or above threshold.`

## Aggregation

Each finding-producing agent returns findings independently; without this step, the same defect reported by two agents appears twice, and findings are not severity-normalized or ranked.

1. **Collect.** Gather every finding from every dispatched finding-producing agent. Each finding carries the contract: location (`file:line` or range) + severity (`CRITICAL` / `HIGH` / `MEDIUM` / `LOW`) + issue + fix.
2. **Dedup.** Merge findings that target the same `file:line` (or overlapping line ranges) and the same issue. Each merged entry cites every contributing agent, e.g. `[code-reviewer, type-design-analyzer]`. Do not drop a finding only one agent produced; do not double-count identical findings from two agents.
3. **Normalize.** Group by severity bucket using this scale:

   | Level | Meaning | Action |
   |-------|---------|--------|
   | CRITICAL | Security vulnerability or data loss risk | **BLOCK** - Must fix before merge |
   | HIGH | Bug or significant quality issue | **WARN** - Should fix before merge |
   | MEDIUM | Maintainability concern | **INFO** - Consider fixing |
   | LOW | Style or minor suggestion | **NOTE** - Optional |

   Calibrate the report: one substantiated blocker outweighs a list of nits. Deliberate half-built work the change leaves behind (a spike, harness, scaffold, phased feature, blast-radius buffer, incidental cleanup) is not a defect; report it only when accidental or when the change half-repairs it.
4. **Rank and output.** CRITICAL first, then HIGH, MEDIUM, LOW. Each entry: severity, location, issue, contributing agent(s), fix.
5. **Per-agent tally.** Append a one-line count per dispatched finding-producing agent (pre-dedup count), so no agent's contribution is hidden by dedup.
6. **Ship/block recommendation.** Block if any CRITICAL; otherwise ship. HIGH findings are ship-with-caution, not block.
7. **Empty case.** If zero findings, say so explicitly. Do not imply clean by silence.

## `code-simplifier` gating

`code-simplifier` runs LAST, only after the finding-producing agents finish and the review passes (no CRITICAL and no HIGH), and only when the invocation names `simplify` (never under `all`). It applies simplifications in place; it does not produce findings.

## Ruled out (do not do)

- Dispatch agents other than the six in step 4: `code-reviewer`, `pr-test-analyzer`, `silent-failure-hunter`, `type-design-analyzer`, `spec-reviewer`, `code-simplifier`.
- Run `git commit`, `git push`, or any destructive op. Output commands for the user.
- Emit usage examples, agent descriptions, tips, workflow integration, or troubleshooting notes; CLAUDE.md routes usage.
- Skip aggregation. The dedup and severity normalization are the point of this skill.
- Auto-apply fixes from finding-producing agents. Only `code-simplifier` applies changes, and only after review passes.
