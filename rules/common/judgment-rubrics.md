# Judgment Rubrics

Decision thresholds any model tier can execute mechanically. Each rubric lists signals, then one example where it fires and one where it must not. Scope limit: these rubrics compensate for execution quality, not for taste. If the question is "is this design good" or "what should we build" with no checkable criterion, no rubric settles it; escalate the model, get a second opinion, or tell the user plainly that it cannot be settled mechanically.

## 1. When to escalate

Escalating means changing a lever: a fresh context carrying the full failure trace, higher reasoning effort, or a stronger or larger-context model where the environment actually has one (see `rules/orchestration/dispatch.md` section 2). Escalate when ANY of:

- Two attempts at the current setup failed on the same subtask. If both failed the same way, first fix the input or assumption both attempts shared (see the example below); if the approach is sound and still fails, escalate
- The task is a judgment call with no checkable criterion (architecture, API shape, naming a product concept): get a second opinion instead of retrying
- Correct reasoning requires holding more interdependent code than fits comfortably: use a larger-context setup if one exists, otherwise decompose the reading
- Security-critical design or crypto decisions
- The subtask is to review or veto work produced by the current context

**Fires:** two patches for a race condition each failed CI differently. Re-dispatch into a fresh context at higher effort with both failure traces attached.

**Does not fire:** a rename script failed because the given path was wrong. That is an input error, not a capability ceiling; fix the path and rerun the same setup.

## 2. When something is truly done

Done means ALL of:

- Every acceptance criterion checked, with evidence produced now (test output, read-back, actual run), not remembered from earlier
- No criterion silently waived or redefined mid-task; changes to criteria are stated
- What was NOT covered is listed next to the result
- No known regression: the pre-existing checks that were green before are green after

**Fires (legitimately done):** endpoint shipped with pytest output pasted, a real request shown returning 200 with expected JSON, and a note "no load test performed".

**Does not fire (not done):** refactor declared complete because it compiles. Type-check was never the acceptance criterion; behavior tests were not run. Saying "should work" anywhere in the completion claim means not done.

## 3. When to stop and ask the user

Ask first when ANY of:

- Irreversible or destructive action not explicitly pre-authorized (data deletion, force-push, schema drop, publishing, sending external messages)
- The requirement has two or more readings that produce materially different builds, and no stated default exists
- New dependency, public interface change, or schema change
- A cost jump the user did not sign up for: more than ~10 parallel agents, any paid external API, or any cloud run they did not request
- The task premise turns out false mid-way (the bug is not where the ticket says; the feature already exists)

Do not ask when the action is reversible and inside the stated scope (do it, report after), when the answer is retrievable (look it up), or when a conventional default exists (pick it and state the choice). File-specific change tiers override this rubric: if a protocol such as `rules/common/harness-maintenance.md` marks an action ask-first, reversibility does not waive it.

**Fires:** migration requires dropping a populated column. Stop; present the plan and a rollback path; wait.

**Does not fire:** whether to use snake_case in Python. Convention answers it; asking wastes a round-trip.

## 4. Wrong direction or wrong execution

Signals the direction is wrong (switch paths; retrying harder makes it worse):

- Each fix creates a new failure elsewhere, twice or more in a row
- The diff has grown past roughly 3x the initial estimate and is still growing
- You are adding the same guard or patch at multiple call sites instead of one shared cause
- The test only passes after disabling or mocking the thing under test
- Your explanation of why the next attempt will work keeps getting longer

On any two of these: stop; write down the current hypothesis and what has been ruled out; pick a different approach or escalate per rubric 1. A retry is legitimate only when the failure cause is identified and the retry changes that specific cause.

**Fires:** a third null-guard added in a third caller. Stop; move one guard into the shared function all callers route through.

**Does not fire:** a test failed once on a network timeout with no code path implicated. One rerun to check for flake is a legitimate retry, not a direction change.

## 5. Quality floor

Minimum bar before any work ships, from any model tier:

- [ ] A runnable check exists and passed in this session, output shown; for prose or config with nothing to run, a fresh-context read-back against the acceptance criteria counts as the check
- [ ] The diff was read line by line by a context that did not write it (fresh agent or the user)
- [ ] No debug leftovers: prints, commented-out blocks, stray files, unused imports
- [ ] Error paths: the first realistic failure mode is handled, or is explicitly declared out of scope in the report
- [ ] Comments and docs that described the old behavior were updated

**Fires (floor met):** bug fix ships with a regression test shown failing on the old code and passing on the new, a reviewer agent has read the diff, and one unhandled edge case is documented.

**Does not fire (floor not met):** a large diff approved because it "looks reasonable" after skimming file names. Nobody read the lines; no check ran. Do not ship.