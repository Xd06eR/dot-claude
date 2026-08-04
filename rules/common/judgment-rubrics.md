# Judgment Rubrics

Decision thresholds, executed mechanically. Scope limit: they compensate for execution quality, not taste — they do not settle questions with no checkable criterion ("is this design good").

## 1. When to escalate

Escalate (levers + attempt budgets in `rules/common/dispatch-protocol.md` §2/§4) when ANY of:

- The task is a judgment call with no checkable criterion (architecture, API shape, naming)
- Correct reasoning needs more interdependent code than fits comfortably
- Security-critical design or crypto decisions
- The subtask is to review or veto work produced by the current context

## 2. When something is truly done

Done means ALL of:

- Every acceptance criterion checked, with evidence produced now
- No criterion silently waived or redefined mid-task
- What was NOT covered is listed next to the result
- No known regression

Saying "should work" or citing no runnable evidence ("it compiles") means not done.

**Loop gate:** an unattended loop's "done" is only as good as its gate. The gate must fail the work mechanically (tests, type-checks, builds, schema validation), and the loop needs a hard stop (budget, iteration, or time cap). A verifier with an opinion is not a gate.

## 3. Wrong direction or wrong execution

On any two of these, switch paths instead of retrying harder:

- Each fix creates a new failure elsewhere, twice in a row
- The diff passes ~3x the estimate (or clearly outgrows expectations) and still grows
- The same guard appears at multiple call sites instead of one shared cause
- The test passes only after disabling or mocking the thing under test
- The explanation for the next attempt keeps getting longer

## 4. Quality floor

Before any work ships (evidence per CLAUDE.md's Review phase, read by a context that did not write it):

- A runnable check passed this session, output shown (fresh-context read-back for prose/config)
- No debug leftovers
- The first realistic failure mode is handled or declared out of scope
- Stale comments/docs updated
