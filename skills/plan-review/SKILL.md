---
name: plan-review
description: Review a plan, spec, or PRD before build. Returns one severity-ranked report surfacing only the genuine taste calls.
argument-hint: "[lenses: all | ceo | design | devex | eng]"
origin: gstack + impeccable
---

Gate a plan, spec, or PRD before build: dispatch four independent review lenses in parallel, add a security pass when the plan warrants one, then merge every report into one verdict. Auto-resolve the lens conflicts the six decision principles can settle, and surface only the genuine taste calls to the user.

The reviewers are fresh-context agents that never see each other, so disagreement between lenses is signal, not noise. Your job is the merge: dedupe, rank, resolve what the principles resolve, and hand the user a short list of real decisions.

## Step 1: Locate the plan

If the dispatch or the user names the plan, whether a path or inline text, use that. Otherwise search context and the repo for the artifact: a plan the conversation just produced, or a file like `*-plan.md`, `*-spec.md`, `PLAN.md`, or `SPEC.md` (use Glob).

When exactly one candidate is obvious, use it and say which one. Only when it is genuinely ambiguous, ask in plain text which plan to review: one question.

## Step 2: Decide the security pass

Add a fifth reviewer, the `security-auditor` agent, when the plan touches a security surface. Trigger the pass when the plan involves any of these surfaces:

- authentication or authorization
- payments or financial data
- PII or user data
- infrastructure, deploy, CI/CD, or secrets
- external input: webhooks, file upload, third-party APIs, user-controlled URLs
- an LLM or agent surface: prompts built from user input, tool calls, skill or agent definitions

When none apply, skip it and say so in the report.

## Step 3: Dispatch the panel

Issue all reviewer dispatches in a single turn so they run in parallel. The invocation names the lenses to run; unnamed, run all four.

Each lens is one dispatch with subagent_type `plan-reviewer`. Never fold two lenses into one dispatch.

Every `plan-reviewer` prompt names exactly three things:

- **The plan:** its absolute path, or the inline plan text if there is no file.
- **One lens file, by path:** exactly one of `~/.claude/skills/plan-review/lenses/ceo.md`, `design.md`, `devex.md`, or `eng.md`.
- **The report-contract reminder:** walk every dimension in the lens
  - calibrate to the plan's depth: a strategy or scope plan gets capability-level findings with "the implementer must prove ___" obligations; an implementation-ready plan gets method- and codepath-level findings
  - quote the plan's own lines or a repo `file:line` as evidence
  - rank findings by severity
  - list open questions, each tagged with the decision it blocks
  - end with exactly one verdict (`SHIP`, `SHIP-WITH-CHANGES`, `BLOCK`, or `NEEDS-USER-DECISION`; `NOT-APPLICABLE` when the lens's scope guard finds no surface for it)
  - state what was not covered
  - report unverifiable claims as open questions, never as findings

If Step 2 triggered, add one `security-auditor` dispatch in the same turn. Tell it the artifact is a plan or design doc with no code yet, so it runs the STRIDE threat model against the described design, skips the code and infrastructure scans, and records anything it cannot verify without code as an open question.

Its verdict is `SHIP` or `BLOCK`.

Collect all four or five reports before merging.

## The 6 decision principles

These resolve conflicts between lenses and settle borderline calls during the merge:

1. **Choose completeness:** ship the whole thing. Pick the approach that covers more edge cases.
2. **Boil lakes:** fix everything in the blast radius (files the plan modifies plus their direct importers). Auto-approve expansions that are in blast radius AND under 1 day of agent effort (under 5 files, no new infra).
3. **Pragmatic:** if two options fix the same thing, pick the cleaner one. 5 seconds choosing, not 5 minutes.
4. **DRY:** duplicates existing functionality? Reject. Reuse what exists.
5. **Explicit over clever:** a 10-line obvious fix beats a 200-line abstraction. Pick what a new contributor reads in 30 seconds.
6. **Bias toward action:** merge beats review cycles beats stale deliberation. Flag concerns but do not block.

Conflict tiebreakers, keyed to the lens that raised the conflict:

- **CEO lens:** P1 (completeness) and P2 (boil lakes) dominate.
- **Eng lens:** P5 (explicit) and P3 (pragmatic) dominate.
- **Design lens:** P5 (explicit) and P1 (completeness) dominate.
- **DevEx lens:** P6 (bias toward action) and P3 (pragmatic) dominate.

## Auto-resolve vs user decision

Classify every conflict or borderline call:

- **Mechanical:** one clearly right answer. Auto-resolve silently, then log it as a decided item.
- **Taste:** reasonable people could disagree. Auto-resolve with a recommendation, but surface it to the user. Three sources: close approaches (top two both viable), borderline scope (in blast radius but 3-5 files, or an ambiguous radius), and a lens that disagrees with a valid point.
- **User challenge:** two or more lenses independently agree the user's stated direction should change (merge, split, add, or remove a feature or workflow the user specified). NEVER auto-resolved.

Auto-resolve replaces the user's judgment with the principles. It does not replace the analysis.

A user challenge goes to the user with richer context than a taste call: what the user said, what the lenses recommend, why, what context the lenses might be missing, and the cost if the lenses are wrong and the original direction was right.

The user's stated direction is the default. The lenses must make the case for change, not the reverse.

If a lens flags the change as a security or feasibility risk rather than a preference, say so plainly so the framing is appropriately urgent, but the user still decides.

## Completeness and novelty

The merge applies two standing biases when it scores options.

AI makes completeness cheap, so the complete thing is the goal. Prefer full coverage (tests, edge cases, error paths), one lake at a time.

The only work genuinely out of scope is the unrelated kind (rewrites, multi-quarter migrations). Flag that as separate scope, never as an excuse for a shortcut.

Label coverage as **complete**, **happy-path**, or **shortcut**: complete covers all edge cases, happy-path the main flow, shortcut anything less. Do not fabricate ratings.

**Three layers of novelty:** before endorsing anything the plan builds from scratch, check its layer.

- Layer 1 is tried and true: do not reinvent it, reuse it.
- Layer 2 is new and popular: scrutinize it.
- Layer 3 is first principles: prize it above all.

This is what feeds P4, reuse over rebuild.

## Step 4: Merge the reports

1. **Dedupe:** the same underlying issue raised by more than one lens is ONE finding. Credit every lens that raised it, and note that cross-lens agreement is a high-confidence signal.
2. **Rank:** order all findings by severity, worst first, across every lens. Security findings keep their own severity.
3. **Resolve conflicts:** when two lenses point opposite directions on one decision, apply the principles with the lens-keyed tiebreakers. A principle that settles it makes a decided item (name the principle). A call reasonable people would still dispute, with no principle to settle it, becomes a user decision.
4. **Verdict:** the overall verdict is the worst per-lens verdict, excluding `NOT-APPLICABLE` (that lens found no surface). Any `BLOCK` (security included) makes the plan `BLOCK`. Else any open user challenge or unsettled taste call makes it `NEEDS-USER-DECISION`. Else any `SHIP-WITH-CHANGES` holds. Else `SHIP`.

## Step 5: The merged report

Output ONE report in the conversation. Shape:

```
## Plan Review — Merged Report

Plan: <path or one-line summary>
Lenses: CEO, Design, DevEx, Eng[, Security]   Overall verdict: <verdict>

### Verdict per lens
- CEO: <verdict>. <one line>
- Design: <verdict>. <one line>
- DevEx: <verdict>. <one line>
- Eng: <verdict>. <one line>
- Security: <verdict>. <one line>   (only if the pass ran; else "not run: no security surface")
  (a lens whose scope guard fired reports NOT-APPLICABLE: <reason> and is excluded from the overall verdict)

### Findings (severity-ranked, deduped)
| # | Severity | Finding | Lens(es) | Fix |
|---|----------|---------|----------|-----|

### Decided (auto-resolved)
- <decision> -> <choice>. Principle: P<n> <name>. <one line why>.

### Needs your decision
- <taste call>. Recommendation: <choice> (<principle, or "taste: no principle settles it">). Trade-off: <one line>.
- <user challenge>. You said: <direction>. Lenses recommend: <change>. Why: <reason>. Might be missing: <blind spot>. If wrong, the cost: <downside>.

### Open questions (merged, deduped)
- <question>. Blocks: <the decision it gates>.

### Not covered
- <any lens that failed to return, repo areas left unread, claims unverified>
```

Skip the "Needs your decision" section when there are none.

One more section when the lenses produced non-finding output: `### From the lenses` carries eng's "NOT in scope" and "What already exists" lists, design's follow-up recommendations, and devex's post-build DX verification follow-up. Skip it when empty.

## Step 6: Apply changes on request

Offer this once, only for a `SHIP-WITH-CHANGES` verdict: the user can reply `apply` and you edit the named changes into the plan.

Edit the plan file only, one change per named item, with the Edit tool. These edits are reversible.

Never touch another repo file, and never edit on a `BLOCK` or an unresolved user decision without the user's word.

Show the diff, and on approval point to build.

## Rules

- **The verdict is recorded.** On a pass (`SHIP`, or `SHIP-WITH-CHANGES` once the changes land), mark the reviewed components' rows with `· plan-reviewed` in `docs/plan/INDEX.md` and advance the feature row in `TODO.md` to its build step; a `BLOCK` or an unresolved decision leaves both untouched.
- **One lens per reviewer.** Never merge two lenses into one dispatch. Independence is the point.
- **Reviewers are read-only.** Only the merge owner edits, only the plan file, only on request.
- **No verdict without evidence.** Every finding cites a plan line or a repo `file:line`.
- **The user's direction is the default.** Auto-resolve what the principles settle. Never auto-resolve a user challenge or a genuine taste call.
- **Say what you did not check.** A lens that failed to return or a repo area left unread is reported, not silently dropped; the merge owner never self-performs a missing lens and presents it as coverage.
