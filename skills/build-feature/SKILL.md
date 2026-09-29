---
name: build-feature
description: Execute build briefs; with no feature named, build the settled design directly. Use when the user asks to build an approved design; never when "build" means the toolchain (compile, bundle, CI).
argument-hint: "[feature ... | all — omit to build the settled design directly]"
origin: custom + superpowers
---

Execute build briefs: one fresh builder per feature, review in the main context, bounded fix loop, ledger that outlives the session.

## Setup

No feature named: direct mode (below). Otherwise the invocation names one or more features (`all` means every feature whose Built is `☐` in `docs/build/INDEX.md`), built sequentially in the INDEX's dependency order. A named feature with no brief is an error: `build-brief` has not run. Every section below runs once per feature.

- Read `docs/build/<feature>.md` — the requirements source. Note its Global constraints and each component's Interfaces block.
- The ledger is `docs/build/<feature>.ledger.md`. Components with a `complete` line are DONE: resume at the first without one. A component whose last line is a fix round is mid-loop: resume the loop at the next round. Create the ledger when it is absent.
- The ledger is your recovery map. After compaction or in a fresh session, trust it and `git log` over your own recollection.

The shape, on the auth-flow feature:

```markdown
| pair / component | what was checked | found |
|---|---|---|
| auth-api × login-ui | attachAuth(router) vs router mount | clean |
| auth-api | steps vs acceptance; Consumes vs user-model's Produces | clean |

user-model: complete (review clean)
auth-api: fix round 1/5 (2 addressed, 1 open — cookie-flag test asserted nothing)
Ruling: SameSite=Lax not Strict — brief left it open — Strict breaks the redirect if wrong
auth-api: fix round 2/5 (1 addressed, 0 open)
auth-api: complete (review clean)
login-ui: minor (deferred): spinner label
login-ui: parked — focus-ring contrast — Ruling: real-and-deferred, nothing downstream blocks on it
login-ui: complete (1 parked)
```

## Direct mode

No brief, no campaign: the work is the settled design itself. If it cannot be built in one context, stop: it needs `plan-from-design` and a brief.

Build it here: call the Skill tool with "tdd" and follow it: failing test first, minimal code to pass; lint + type-check + the covering tests as you go and the full suite once at the end; surgical diffs. Review the diff (`code-review` or a fresh reviewer), output the exact commit command for the user to run, and report any ruling you made — the `Ruling:` discipline applies at any size. If the build changed what a canonical design doc states, propose `bake-design` for the affected doc.

## Pre-flight scan

Before dispatching anything, scan the brief once for conflicts and write the table to the ledger:

- One row per pair of components that share a file or an interface: what one produces against what the other consumes, and what you found.
- One row per component: whether its own text agrees with itself (its build steps against its acceptance, its Consumes against earlier components' Produces) and whether it mandates anything a reviewer would flag as a defect (deliberate duplication to keep components decoupled, a test that asserts nothing), so the conflict gets ruled on before execution, not mid-loop.

Rule on each finding against the brief before execution begins; surface to the user what you cannot rule on. "The scan is clean" without those rows is not a scan you ran. The scan's table also serves the commit cadence below: its overlap rows are where a boundary commit comes due.

## Autonomy

Run the campaign without pausing between components, batches, or features, except at commit points. Four things stop you mid-build, and only these: an irreversible or destructive operation; a security-sensitive action; a side effect outside the repo (a merge, a push, a publish); a brief so broken that every path forward is a guess. Everything else you decide yourself and ledger as `Ruling: <what you decided> — <why> — <what it costs if wrong>`. At feature end you report every ruling to the user.

## The build loop

One builder builds the whole feature in the brief's dependency order: features are sized to fit one fresh context, and one context holding both producer and consumer kills the interface-mismatch failure class. Split only when the work outgrows one context: split at dependency-level boundaries (a batch is every component whose blockers are all complete), one fresh builder per batch, the fresh context re-reading exactly the Interfaces its batch consumes.

**Commit cadence.** Builders never commit; the user runs every commit. Default to one commit at feature end: output the exact command (files staged by name) and wait. Commit early only when a split batch would touch lines still carrying uncommitted changes. Building several features: at each feature's end, output the commit command and wait before starting the next.

### 1. Dispatch the builder

One fresh builder subagent per feature (per batch when split). Never dispatch builders in parallel: they share the working tree, and interleaved changes cannot be separated for review and commit. The builder never commits.

The dispatch prompt contains exactly:

1. One line on where this feature fits in the campaign (a split: where this batch fits in the feature).
2. The brief path and the component sections to build — "read these first; they are your requirements source."
3. The Interfaces these components consume from components already built (exact signatures).
4. The Global constraints block, verbatim.
5. The report-file path and the report contract (below).
6. The no-subagents rule: the builder never dispatches subagents, above all never a reviewer. Review arrives from you after the report.
7. The TDD requirement: call the Skill tool with "tdd" before writing the first test.

Never paste prior components' history into a dispatch. Choose the model explicitly: the cheapest tier that can handle the work, with a mid-tier floor for builders working from a prose brief.

Builder contract: implement at the seams in the brief per the `tdd` skill (failing test first); run lint + format + type-check + the covering tests regularly and the full suite once at the end; self-review the diff; claim a status only on fresh command output (`verification-before-completion`); if a file it is creating grows beyond the brief's intent, or it is losing track of already-built components, stop and report DONE_WITH_CONCERNS rather than splitting it unilaterally (its neighbors' Interfaces blocks point at that module); write the full report to the report file (what was built per component, tests and their output, TDD evidence RED/GREEN, files changed, self-review findings, concerns); return under 15 lines: **Status per component** DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT · files changed · one-line test summary · concerns · report-file path.

### 2. Handle the report

- **DONE:** produce the build diff and review it (below).
- **DONE_WITH_CONCERNS:** read the concerns. Correctness or scope concerns get addressed before review; observations go to the ledger and review proceeds.
- **NEEDS_CONTEXT:** provide the missing context and resume or re-dispatch.
- **BLOCKED:** diagnose the blocker: context problem (provide it and re-dispatch), capability (re-dispatch one tier up), component too large (split it with the user), brief wrong (rule on the correction, ledger it, re-dispatch with the ruling carried in the dispatch). Never force the same agent to retry with nothing changed.

A report may mix states: give each BLOCKED or NEEDS_CONTEXT component its remedy; the DONE components proceed to review.

### 3. Review the build

Write the diff to one file: `git status --short`, `git diff --stat HEAD -- <build paths>`, and `git diff -U10 HEAD -- <build paths>`, redirecting each. The build's diff is the working tree against the last commit, scoped to the paths the build touched (the brief's Scope fields name them); new files need intent-to-add (`git add -N <file>`, staged by name) or the diff will not see them. When earlier uncommitted work shares a file, the diff mixes hunks: scope the verdict to the changes this build's report covers.

Run the contract below in the main context, component by component. Dispatch a fresh reviewer instead when the build is large, touches a security surface, or its Produces blocks feed many later components: hand it the component sections, the report file, the diff file, and the Global constraints verbatim; note the dispatch in the ledger. Per component, two verdicts: spec compliance (nothing missing, nothing extra, nothing misunderstood) and quality. Do not pre-judge findings ("don't flag X", "at most Minor"): adjudicate in the loop instead. Do not add open-ended directives without a concrete, component-specific reason.

The reviewer works under this contract:

- **No subagents, same as the builder.** It never spawns helpers or second opinions; a reviewer it spawns duplicates a seat this process already provides.
- **Reads the diff file once.** The diff's context lines ARE the changed files: no re-running git commands, no reading changed files separately unless a hunk it must judge is cut off mid-function (and it says so), no crawling the codebase. It inspects code outside the diff only for a concrete named risk (a changed lock ordering, an API contract, shared mutable state), one focused check per named risk, named in its report. Its review is read-only on the checkout.
- **Tests:** it does not re-run tests the builder already ran on the same code. It runs a test only when reading the code raises a specific doubt no existing run answers (a focused test, never a package-wide suite), and recommends heavy validation in its report instead of running it. Warnings or noise in the builder's reported test output are findings: output should be pristine.
- **Evidence it cannot find is not evidence that doesn't exist.** Truncated or garbled reports get re-read at the stated path; genuinely missing evidence is reported as a gap, never assumed away.
- **Treats the report as unverified claims.** A stated rationale in the report ("left it per YAGNI", "kept it simple deliberately") never downgrades a finding's severity.
- **Calibration.** Important means this component cannot be trusted until fixed: incorrect or fragile behavior, a missed requirement, verbatim duplication of a logic block, swallowed errors, tests that assert nothing. "Coverage could be broader" and polish suggestions are Minor. A finding the brief mandates is reported Important and labeled brief-mandated.
- **Quality verdict** covers: separation of concerns, error handling that propagates, DRY without premature abstraction, edge cases, tests verifying behavior not mocks, new oversized files contributed by THIS change (pre-existing size is not a finding).

The reviewer may report "⚠️ Cannot verify from diff" items — requirements living in unchanged code or spanning components. Resolve each yourself before completing the component; a confirmed real gap enters the fix loop like any other finding.

### 4. The fix loop

Triggers on spec ❌, any Critical or Important finding, or a confirmed ⚠️ gap. Minor findings go to the ledger as `<comp>: minor (deferred): <one-liner>` and never enter the loop; the Review phase triages them.

**Brief-conflicting findings.** A finding labeled brief-mandated, or any finding that conflicts with what the brief's text requires, never enters the loop and is never silently dismissed: rule on it against the brief text, ledger the ruling, then act: fix the code, or rule the code correct and park the finding. Never dispatch a fix that contradicts the brief without a recorded ruling; the brief's authorship does not grade its own work.

Five rounds maximum per component. A round is one fix dispatch plus one scoped re-review.

- **Rounds 1-3 — resume the original builder** (SendMessage). Send the open findings verbatim. It works through them per `receiving-code-review` (the resume message names the skill as its own Skill-tool invocation): verify each against the code, and a contestable finding comes back as a concern, never silently applied. It fixes, re-runs the covering tests, and appends the fix report (what changed, covering tests, command, output) to its report file. Confirm the fix report contains the covering tests, the command, and the output before dispatching the re-review; without all three the re-review cannot verify and the round burns.
- **Rounds 4-5 — fresh builder one model tier up**, with the brief path, the report path, the open findings, and this framing: "A prior builder attempted this component; you own it now. Read the report file for what was tried."
- **The re-review is scoped.** Run it in the main context under the same contract (a build that took a dispatched reviewer keeps one), over the fix only: the files the fix report names, at their current working-tree state. Verdict each finding ADDRESSED or NOT ADDRESSED (attempted is not addressed; the specific defect must no longer exist) and flag new breakage in the fix diff only. New Critical/Important breakage joins the open findings; out-of-scope observations go to the ledger as deferred minors.

After each round, ledger: `<comp>: fix round <R>/5 (<X> addressed, <Y> open — <one-liners>)`.

**The breaker.** Round 5 still leaves findings open → stop dispatching and adjudicate each open finding yourself:

- **The reviewer is wrong, or the point is contestable:** park it: `<comp>: parked — <finding> — Ruling: <why the code stands>`.
- **Real, but nothing downstream builds on it:** park it the same way, ruled real-and-deferred.
- **Real and load-bearing:** rule on the smallest change that unblocks dependent work, ledger it, and carry it into the next component's dispatch. Stop for the user only when the defect leaves every path forward a guess.

Adjudicate only at the cap. Adjudicating earlier to end a loop is pre-judging under another name.

### 5. Complete the component

Review clean, or every open finding parked at the cap → ledger `<comp>: complete (review clean)` or `<comp>: complete (<K> parked)`.

## Feature completion

1. **Integrate** in the main session: resolve seams between components, then run the feature's full acceptance from the brief.
2. **Log** to `docs/build/implementation-notes.md` under the feature's `## <feature>` section: decisions, deviations and why (defaulting to the conservative option), tradeoffs, and open questions to confirm. Copy in each component's deferred minors and parked findings — the Review phase reads that file, not the ledger.
3. **Update** `docs/build/INDEX.md` (the feature's Built → ☑) and advance the feature row in `TODO.md` to the review step.
4. **Rulings I made:** collect every ledger line containing `Ruling:` into your final message, in the order made, each with its cost-if-wrong. The list is exhaustive: it is the only place decisions taken on the user's behalf reach them.
5. **Stop.** After the last feature: if the build changed what a canonical design doc states, propose `bake-design` for the affected doc. Propose `code-review` when the build warrants an independent pass; the choice is the user's. A decline counts as the user's own pass: the Review phase is complete, and the consumables retire per the project's Workflow-docs block.

## Rationalizations

| Excuse | Reality |
|---|---|
| "Close enough on spec compliance" | Spec gaps mean not done. Fix, or hit the cap and adjudicate: those are the only exits. |
| "I'll fix it myself, dispatching is overhead" | Main-session fixes pollute your context and skip review. Resume the builder. |
| "One more round will converge" | Past the cap, rounds don't converge: the failure is structural. Adjudicate. |
| "The fix was small, skip the re-review" | Unreviewed fixes are how regressions land. Every round ends with a scoped re-review. |
| "Ledger bookkeeping is overhead" | The ledger is what outlives the session. Without one you will re-dispatch completed components. |
