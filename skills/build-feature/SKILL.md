---
name: build-feature
description: Execute a feature's build brief (docs/build/<feature>.md); with no feature named, build the settled design directly. Returns the integration result, the feature acceptance run, and an exhaustive rulings report.
disable-model-invocation: true
argument-hint: "[feature — omit to build the settled design directly]"
origin: custom + superpowers
---

Execute one feature's build brief: one fresh builder per dependency batch, review in the main context, bounded fix loop, ledger that survives compaction. One feature per invocation.

## Setup

No feature named: direct mode (below). A named feature with no brief is an error: `/build-brief` has not run.

- Read `docs/build/<feature>.md` — the requirements source. Note its Global Constraints and each component's Interfaces block.
- The ledger is `docs/build/<feature>.ledger.md`. If its first line names this brief, components with a `complete` line are DONE: resume at the first without one. A component whose last line is a fix round is mid-loop: resume the loop at the next round. Otherwise create the ledger with its identity as line one: `# Build ledger — feature: <feature> (brief: docs/build/<feature>.md)`.
- The ledger is your recovery map. After compaction, trust it and `git log` over your own recollection.

## Direct mode

No brief, no campaign: the work is the settled design — the doc section named in the TODO hand-off row, the register entry, or the conversation. If it cannot be built in one context, stop: it needs `/plan-from-design` and a brief.

Build it here: failing test first (`tdd`), minimal code to pass; lint + type-check + the covering tests as you go and the full suite once at the end; surgical diffs. Review the diff (`code-review` or a fresh reviewer), commit, and report any ruling you made — the Rulings discipline applies at any size.

## Pre-flight scan

Before dispatching anything, scan the brief once for conflicts and write the table to the ledger:

- One row per pair of components that share a file or an interface: what one produces against what the other consumes, and what you found.
- One row per component: whether its own text agrees with itself (its build steps against its acceptance, its Consumes against earlier components' Produces) and whether it mandates anything a reviewer would flag as a defect (deliberate duplication to keep components decoupled, a test that asserts nothing), so the conflict gets ruled on before execution, not mid-loop.

Rule on each finding against the brief before execution begins; surface to the user what you cannot rule on. "The scan is clean" without those rows is not a scan you ran.

## Autonomy

Run the feature without pausing between components. Four things stop you, and only these: an irreversible or destructive operation; a security-sensitive action; a side effect outside the repo (a merge, a push, a publish); a brief so broken that every path forward is a guess. Everything else you decide yourself and ledger as `Ruling: <what you decided> — <why> — <what it costs if wrong>`. At feature end you report every ruling to the user.

## The build loop

Work one batch at a time: a batch is every component whose blockers are all complete. One builder builds a batch whole, in dependency order; the fresh context per batch re-reads exactly the Interfaces the batch consumes. Split a batch only when it cannot fit one context window.

### 1. Dispatch the builder

One fresh builder subagent per batch. Never dispatch builders in parallel: they share the working tree and the branch, so interleaved commits would contaminate each other's review diffs (a sibling's commits would silently enter every `BASE..HEAD` range). Record BASE (`git rev-parse HEAD`) before dispatching.

The dispatch prompt contains exactly:

1. One line on where this batch fits in the feature.
2. The brief path and the batch's component sections — "read these first; they are your requirements source."
3. The Interfaces these components consume from components already built (exact signatures).
4. The Global Constraints block, verbatim.
5. The report-file path and the report contract (below).
6. The no-subagents rule: the builder never dispatches subagents, above all never a reviewer. Review arrives from you after the report.

Never paste prior components' history into a dispatch. Choose the model explicitly: the cheapest tier that can handle the work, with a mid-tier floor for builders working from prose.

Builder contract: implement at the seams agreed in the specs per the `tdd` skill (failing test first); run lint + format + type-check + the covering tests regularly and the full suite once at the end; self-review the diff; if a file it is creating grows beyond the brief's intent, stop and report DONE_WITH_CONCERNS rather than splitting it unilaterally (the Interfaces block its neighbors build against points at that module); write the full report to the report file (what was built per component, tests and their output, TDD evidence RED/GREEN, files changed, self-review findings, concerns); return under 15 lines: **Status per component** DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT · commits (short SHA + subject) · one-line test summary · concerns · report-file path.

### 2. Handle the report

- **DONE:** produce the batch diff and review it (below).
- **DONE_WITH_CONCERNS:** read the concerns. Correctness or scope concerns get addressed before review; observations go to the ledger and review proceeds.
- **NEEDS_CONTEXT:** provide the missing context and resume or re-dispatch.
- **BLOCKED:** diagnose the blocker: context problem (provide it and re-dispatch), capability (re-dispatch one tier up), component too large (split it with the user), brief wrong (rule on the correction, ledger it, re-dispatch with the ruling carried in the dispatch). Never force the same agent to retry with nothing changed.

A batch report may mix states: give each BLOCKED or NEEDS_CONTEXT component its remedy; the DONE components proceed to review.

### 3. Review the batch

Write the diff to one file: `git log --oneline BASE..HEAD`, `git diff --stat BASE..HEAD`, and `git diff -U10 BASE..HEAD`, redirected. BASE is the commit recorded before dispatch: never `HEAD~1`, which silently truncates multi-commit batches.

Run the contract below in the main context, component by component. Dispatch a fresh reviewer instead when the batch is large, touches a security surface, or its Produces blocks feed many later components: hand it the component sections, the report file, the diff file, and the Global Constraints verbatim; note the dispatch in the ledger. Per component, two verdicts: spec compliance (nothing missing, nothing extra, nothing misunderstood) and quality. Do not pre-judge findings ("don't flag X", "at most Minor"): adjudicate in the loop instead. Do not add open-ended directives without a concrete, component-specific reason.

The reviewer works under this contract:

- **No subagents, same as the builder.** It never spawns helpers or second opinions; a reviewer it spawns duplicates a seat this process already provides.
- **Reads the diff file once.** The diff's context lines ARE the changed files: no re-running git commands, no reading changed files separately unless a hunk it must judge is cut off mid-function (and it says so), no crawling the codebase. It inspects code outside the diff only for a concrete named risk (a changed lock ordering, an API contract, shared mutable state), one focused check per named risk, named in its report. Its review is read-only on the checkout.
- **Tests:** it does not re-run tests the builder already ran on the same code. It runs a test only when reading the code raises a specific doubt no existing run answers (a focused test, never a package-wide suite), and recommends heavy validation in its report instead of running it. Warnings or noise in the builder's reported test output are findings: output should be pristine.
- **Evidence it cannot find is not evidence that doesn't exist.** Truncated or garbled reports get re-read at the stated path; genuinely missing evidence is reported as a gap, never assumed away.
- **Treats the report as unverified claims.** A stated rationale in the report ("left it per YAGNI", "kept it simple deliberately") never downgrades a finding's severity.
- **Calibration.** Important means this component cannot be trusted until fixed: incorrect or fragile behavior, a missed requirement, verbatim duplication of a logic block, swallowed errors, tests that assert nothing. "Coverage could be broader" and polish suggestions are Minor. A finding the brief mandates is reported Important and labeled brief-mandated. It acknowledges what was done well, briefly.
- **Quality verdict** covers: separation of concerns, error handling that propagates, DRY without premature abstraction, edge cases, tests verifying behavior not mocks, new oversized files contributed by THIS change (pre-existing size is not a finding).

The reviewer may report "⚠️ Cannot verify from diff" items — requirements living in unchanged code or spanning components. Resolve each yourself before completing the component; a confirmed real gap enters the fix loop like any other finding.

### 4. The fix loop

Triggers on spec ❌, any Critical or Important finding, or a confirmed ⚠️ gap. Minor findings go to the ledger as `<comp>: minor (deferred): <one-liner>` and never enter the loop; the Review phase triages them.

**Brief-conflicting findings.** A finding labeled brief-mandated, or any finding that conflicts with what the brief's text requires, never enters the loop and is never silently dismissed: rule on it against the brief text, ledger the ruling, then act: fix the code, or rule the code correct and park the finding. Never dispatch a fix that contradicts the brief without a recorded ruling; the brief's authorship does not grade its own work.

Five rounds maximum per component. A round is one fix dispatch plus one scoped re-review.

- **Rounds 1-3 — resume the original builder** (SendMessage). Send the open findings verbatim. It fixes, re-runs the covering tests, and appends the fix report (what changed, covering tests, command, output) to its report file. Confirm the fix report contains the covering tests, the command, and the output before dispatching the re-review; without all three the re-review cannot verify and the round burns.
- **Rounds 4-5 — fresh builder one model tier up**, with the brief path, the report path, the open findings, and this framing: "A prior builder attempted this component; you own it now. Read the report file for what was tried."
- **The re-review is scoped.** Run it in the main context under the same contract (a batch that took a dispatched reviewer keeps one), over the fix diff only (`FIX_BASE..HEAD`, where FIX_BASE is the head the previous review saw). Verdict each finding ADDRESSED or NOT ADDRESSED (attempted is not addressed; the specific defect must no longer exist) and flag new breakage in the fix diff only. New Critical/Important breakage joins the open findings; out-of-scope observations go to the ledger as deferred minors.

After each round, ledger: `<comp>: fix round <R>/5 (<X> addressed, <Y> open — <one-liners>; commits <a>..<b>)`.

**The breaker.** Round 5 still leaves findings open → stop dispatching and adjudicate each open finding yourself:

- **The reviewer is wrong, or the point is contestable:** park it: `<comp>: parked — <finding> — Ruling: <why the code stands>`.
- **Real, but nothing downstream builds on it:** park it the same way, ruled real-and-deferred.
- **Real and load-bearing:** rule on the smallest change that unblocks dependent work, ledger it, and carry it into the next component's dispatch. Stop for the user only when the defect leaves every path forward a guess.

Adjudicate only at the cap. Adjudicating earlier to end a loop is pre-judging under another name.

### 5. Complete the component

Review clean, or every open finding parked at the cap → ledger `<comp>: complete (commits <base>..<head>, review clean)` or `<comp>: complete (commits <base>..<head>, <K> parked)`.

## Feature completion

1. **Integrate** in the main session: resolve seams between components, then run the feature's full acceptance from the brief.
2. **Log** decisions, deviations, and tradeoffs to `docs/build/implementation-notes.md`, copying in each component's deferred minors and parked findings — the Review phase reads that file, not the ledger.
3. **Update** `docs/build/INDEX.md` (feature ✅).
4. **Rulings I made:** collect every ledger line containing `Ruling:` into your final message, in the order made, each with its cost-if-wrong. The list is exhaustive: it is the only place decisions taken on the user's behalf reach them.
5. **Stop.** The Review phase (`code-review`) starts only after every feature in the INDEX is ✅.

## Rationalizations

| Excuse | Reality |
|---|---|
| "Close enough on spec compliance" | Spec gaps mean not done. Fix, or hit the cap and adjudicate: those are the only exits. |
| "I'll fix it myself, dispatching is overhead" | Main-session fixes pollute your context and skip review. Resume the builder. |
| "One more round will converge" | Past the cap, rounds don't converge: the failure is structural. Adjudicate. |
| "The fix was small, skip the re-review" | Unreviewed fixes are how regressions land. Every round ends with a scoped re-review. |
| "Ledger bookkeeping is overhead" | The ledger is what survives compaction. Without one you will re-dispatch completed components. |
