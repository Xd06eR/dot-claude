# Dispatch Protocol

How the main agent delegates work to subagents: what to dispatch, how results come back, and what to change when attempts fail.

## 1. Working set in, residue out

The main agent plans, decides, and integrates; subagents carry work whose full contents the main agent does not need. The test: "will I reason from these exact contents later, or do I only need the answer?" Contents → read it yourself, however many files; answer → dispatch. What degrades a session is residue, not a large relevant working set.

Parallel fan-out gates on independence (no shared state, no sequential dependency between chunks) and declares its budget up front, with a hard stop.

The agent that writes code must itself have read the code it changes; editing from a subagent's summary produces confident wrong patches. Do not dispatch a one-call read; dispatch overhead must be smaller than the work.

**Long merge and bulk work:** route it to fresh subagents with detailed prompts — a saturated main context degrades merge quality. High-sensitivity verification runs first in main context, with fresh-context confirmation per section 5.

## 2. Escalation levers

When a subtask fails, three levers, cheapest first:

1. **Fresh retry context.** Always available: retry in a new context carrying the full failure trace, never in the context that failed.
2. **Reasoning effort.** Low for mechanical sweeps, high for debugging and final review.
3. **A different model tier.** Lower tiers for mechanical work, higher tiers for hard reasoning and judgment.

## 3. Dispatch triad and report contract

Every dispatch prompt contains three parts:

1. **Goal and motivation:** what to produce and why the main agent needs it, so the subagent resolves small ambiguities in the right direction.
2. **Acceptance criteria:** checkable statements. "Works" is not checkable; "`pytest tests/test_auth.py` exits 0" is.
3. **Report format:** what comes back, and in what form.

Per task type, the acceptance criteria must cover:

- **Merge:** a precheck pass counts the concepts in both sources; every concept survives or each drop carries a reason; byte-diff every code block and table cell.
- **Research:** primary sources preferred; load-bearing claims carry a source URL and retrieval date; the unconfirmable marked UNVERIFIED, never guessed.
- **Review:** every finding has file:line + severity + a quoted evidence line + a concrete failure scenario (no scenario, no finding); an explicit ship-or-block verdict.

Report contract, binding on every subagent:

- Return conclusions, decisions, findings, and `file:line` evidence in full: everything the main agent needs to act on and to judge the work, including the reasoning behind non-obvious calls. No size limit ever forces dropping substance.
- Exclude only residue: raw file contents, full command transcripts, re-derivable bulk.
- When substance runs long (30+ lines), write it to disk in full and return a faithful structured summary plus the path.
- No silent file work: the main agent prepares the files a dispatch needs and owns the durable-file lifecycle; a subagent that creates, modifies, or deletes files (build dispatches included) lists every touched path with its operation in the report, and removes its temp files before returning.
- Always state what was NOT covered.

## 4. Attempts, escalation, and stopping

- **Diagnose before retrying.** An input error (wrong path, stale premise, missing context) is not a capability ceiling: fix it and rerun. Every retry must change something — the input, a section 2 lever, or the method itself; two failed methods on one subtask means switch strategy or ask the user (signals in `rules/common/judgment-rubrics.md` rubrics 1 and 3).
- **De-escalate:** once a hard subtask is solved, write the recipe (exact steps, diff pattern, or checklist) and hand batch application to a minimal-effort dispatch.

## 5. No self-verification

The principle lives in CLAUDE.md's Review phase (acceptance evidence comes from a fresh agent). Acceptance mechanics:

- **Code:** run the tests, linters, or the actual command; paste the decisive output (the passing or failing lines, not the full transcript) into the report. If no runnable check exists, write one first (see the TDD rule in CLAUDE.md).
- **Batch final-audit:** for bulk edit batches, run the acceptance audit in main context and propose a parallel fresh-subagent pass; reconcile both sets of findings before reporting.
- **Research/review:** spot-check the load-bearing items — re-fetch one cited URL, re-read one cited line; a report whose evidence does not check out is rejected in full.
- **Scope compliance:** an out-of-brief edit is a defect even when the content is good — unrequested content per CLAUDE.md's Build principles, format per its Doc content and structure, corrupted code blocks or tables (byte-diff every block).

