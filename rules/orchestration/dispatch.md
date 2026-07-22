# Dispatch Protocol

How the main conversation delegates work to subagents: what to dispatch, how results come back, and what to change when attempts fail.

Model-agnostic by design: it assumes nothing about which or how many models the environment runs; verify what is actually available before naming anything. Mechanics are Claude Code specific; on other agents apply the same principles with that platform's delegation primitives.

## 1. Working set in, residue out

The main conversation plans, decides, and integrates. The dividing line for delegation is not file count; it is what the contents are for.

**Read directly — the working set.** Anything whose exact contents feed the work: files about to be edited, their direct callers and dependencies, the failing test, the spec or config being reasoned about. The agent that writes code must itself have read the code it changes; editing from a subagent's summary produces confident wrong patches. On a medium repo with a large context window, reading the whole working set liberally is correct. No file-count cap.

**Dispatch — survey, research, verification, bulk.** Work where only the conclusion needs to come back:

- Repo-wide mapping (find usages, inventory patterns, "where is X handled"): skimming many files for a needle leaves residue that is read once and never needed again
- Web or docs research (raw pages are noise; only findings matter)
- Batch edits applying one known recipe across many files
- Generating a long artifact whose full text the main conversation does not need to reason over
- Independent chunks that can run in parallel
- Review and acceptance (see section 5): no context-window size makes this one optional

The test: "will I reason from these exact contents later, or do I only need the answer?" Contents → read it yourself. Answer → dispatch. And do not dispatch a 30-second read; dispatch overhead must be smaller than the work.

What degrades a session is not a large relevant working set; it is residue. Attention dilutes as noise accumulates regardless of advertised window size, so keep the main context to working set plus conclusions.

**Negative example:** main context runs `grep -r`, reads 14 files to locate one pattern, pastes them, then decides. The 13 misses are now permanent residue.

**Positive example:** dispatch "map every caller of X, return file:line plus a one-line role for each"; main context receives 20 lines, then directly reads the 2 files it will actually edit.

## 2. Escalation levers

A dispatch varies along three levers. Use the cheapest one that addresses the actual failure:

1. **Fresh context.** Always available, even with a single model. A clean context with a sharper brief beats a polluted context; many "model too weak" failures are context failures.
2. **Reasoning effort.** Only where the environment exposes it (Claude Code: `/effort` or `effortLevel` for the session; `effort:` frontmatter in `.claude/agents/*.md`; Workflow `agent(prompt, {effort})`). Keep it low for mechanical sweeps, high for debugging and final review; mechanical work at max effort wastes tokens and adds no accuracy. Whether effort actually reaches the model depends on the provider; verify before relying on it.
3. **A different model.** Only in environments that genuinely run more than one (check `/model`, the Agent tool's `model` parameter, and agent `model:` frontmatter). If the configured aliases resolve to the same underlying model, this lever does not exist; do not pretend it does.

Caveat: an interactive Agent/Task dispatch has no per-call effort parameter; effort inherits the session level unless an agent definition pins `effort:` or the dispatch runs through a Workflow script. When a dispatch departs from session defaults, state the levers chosen in the dispatch text; a choice unstated is a choice unmade.

## 3. Dispatch triad and report contract

Every dispatch prompt contains three parts (fill-in templates: `rules/orchestration/dispatch-templates.md`):

1. **Goal and motivation:** what to produce and why the parent needs it, so the subagent resolves small ambiguities in the right direction.
2. **Acceptance criteria:** checkable statements. "Works" is not checkable; "`pytest tests/test_auth.py` exits 0" is.
3. **Report format:** what comes back, and in what form.

Report contract, binding on every subagent:

- Return conclusions, decisions, findings, and `file:line` evidence in full: everything the parent needs to act on and to judge the work, including the reasoning behind non-obvious calls. The report is the parent's only window into the work, so its length follows the substance; no size limit ever forces dropping substance.
- Exclude only residue: raw file contents, full command transcripts, re-derivable bulk. That is what dilutes the parent's context, not the substance.
- When substance runs long (past what reads cleanly inline, ~30+ lines: a long deliverable, many findings), write it to disk in full (scratchpad for temporaries, repo path for deliverables) and return a faithful structured summary plus the path: complete-but-segmented, never terse-but-lossy. Concision helps simple dispatches but is subordinate to fidelity.
- Always state what was NOT covered (files skipped, cases untested). Silent truncation reads as full coverage and causes false confidence.

## 4. Attempts, escalation, and stopping

- **Diagnose before retrying.** An input or assumption error (wrong path, stale premise, missing context) is not a capability ceiling: fix the input and rerun the same setup. Only a sound-approach failure justifies changing a lever.
- **Attempt budget: two per approach.** A rerun that changes nothing is a repeat, not an attempt; every retry must change input, lever, or approach.
- **After two failed attempts:** re-dispatch into a fresh context carrying the full failure trace (what was tried, exact errors, why each attempt failed) plus one stronger lever where available. Escalation without the trace repeats the same mistakes at higher cost.
- **Stop condition:** two approaches have failed, or no lever remains; this rule wins whenever it and the escalate rule both apply. Reassess with `rules/common/judgment-rubrics.md` ("Wrong direction or wrong execution"), then switch strategy or ask the user.
- **De-escalate:** once a hard subtask is solved, write the recipe (exact steps, diff pattern, or checklist) and hand batch application to a minimal-effort dispatch. Do not keep high effort on work a recipe now covers.

## 5. No self-verification

The context that produced work never accepts it. Acceptance goes to a fresh-context agent:

- **Files written:** a fresh agent reads the file back and checks each acceptance criterion, reporting pass or fail per criterion.
- **Code:** run the tests, linters, or the actual command; paste the decisive output (the passing or failing lines, not the full transcript) into the report. If no runnable check exists, write one first (see the TDD rule in CLAUDE.md).
- **High-risk judgment:** irreversible ops, architecture, security, and public interfaces get a second opinion from a fresh agent (on a different model where one exists, otherwise briefed from a different angle), or 2–3 independent candidates with a judge agent picking one in writing.

The main conversation integrates results and stays responsible for the final call. "No self-verification" means the evidence comes from outside the producing context, not that the commander stops thinking.

## 6. Cross-references

- Judgment thresholds (when to escalate, when done, when to ask): `rules/common/judgment-rubrics.md`
- Fill-in templates per task type: `rules/orchestration/dispatch-templates.md`
- Who may edit these files and how: `rules/common/harness-maintenance.md`