# Dispatch Templates

Copy the template for the task type, fill every `[bracket]`, and send as the subagent prompt. Do not delete the ACCEPTANCE or REPORT blocks; a dispatch without checkable acceptance criteria is not allowed (see `rules/orchestration/dispatch.md`). If the environment exposes effort or model choices, state them in the dispatch per the escalation levers there; otherwise omit and inherit session defaults.

## Search (locate, map, inventory)

```
GOAL: Find [what] in [repo/dir].
MOTIVATION: Parent will use this to [decision it feeds].
SCOPE: include [globs/dirs], exclude [vendored/generated paths].
ACCEPTANCE:
- Every match listed as file:line, none omitted
- Patterns/queries actually tried are named
- Zero hits is reported as zero hits plus what was tried, never as absence of report
REPORT (max 150 words + list):
- file:line + one-line role, per match
- NOT COVERED: [dirs skipped, patterns not tried]
```

## Implement (new code against a spec)

```
GOAL: Implement [feature/step] in [files].
MOTIVATION: [why, and what depends on it].
ESTIMATE: [~files touched, ~lines of diff]; report back if actuals exceed ~3x this.
CONSTRAINTS: touch only [files]; no new dependencies; match surrounding style;
write the failing test first, then make it pass (TDD).
ACCEPTANCE:
- [named test command] exits 0, output included
- lint + format + type-check clean for touched files, output included
- Diff confined to the listed files
REPORT (max 200 words):
- Files changed with file:line anchors; design decisions made and why
- Tail of test/linter output as evidence
- NOT COVERED: [cases untested, edges deferred]
```

## Refactor (behavior-preserving change)

```
GOAL: Refactor [what] into [shape] without changing behavior.
MOTIVATION: [pain it removes].
ESTIMATE: [~files touched, ~lines of diff]; report back if actuals exceed ~3x this.
CONSTRAINTS: no public interface changes; scope limited to [files/dirs].
ACCEPTANCE:
- Full relevant test suite green BEFORE the change (evidence) and AFTER (evidence)
- No exported/public signature altered
- Old names/paths fully removed or aliased, none half-migrated
REPORT (max 200 words):
- Old -> new mapping per moved/renamed unit
- Before/after test evidence
- NOT COVERED: [call sites or configs not migrated, if any]
```

## Research (web, docs, external facts)

```
GOAL: Answer [question] well enough to [decision it feeds].
MOTIVATION: [what will be built on the answer].
ACCEPTANCE:
- Every load-bearing claim carries a source URL and retrieval date
- Conflicting sources surfaced, not averaged away
- Anything unconfirmable is marked UNVERIFIED, never guessed
REPORT (max 200 words + sources):
- Conclusion first, then key facts, then source list
- Detail beyond the cap goes to [disk path]; return the path
- NOT COVERED: [angles not searched]
```

## Review (verify or veto existing work)

```
REVIEWER: never the context that wrote the work; a fresh context, with the
strongest lever available for final gates (see dispatch.md section 2).
GOAL: Review [diff/files/plan] for [correctness / security / spec compliance].
MOTIVATION: gate before [merge/ship/next phase].
METHOD: try to refute each claim of correctness; read the actual lines, not summaries.
ACCEPTANCE:
- Every finding: file:line + severity + a concrete failure scenario (input -> wrong outcome)
- Style nits excluded unless they change behavior or meaning
- Explicit verdict: ship, or block with the blocking findings named
REPORT (max 250 words):
- Findings ranked by severity, then the verdict
- NOT COVERED: [files/aspects not reviewed]
```