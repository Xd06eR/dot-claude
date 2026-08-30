---
name: design-audit
description: "Audit design docs: consistency (do the docs contradict each other), completeness (did every decision reach a doc), and soundness (is the decision correct). Use before or after a bake, before compacting, or on request. Returns severity-ranked findings and a verdict."
argument-hint: <consistency | completeness | soundness> [docs | full]
origin: custom
---

Three different questions about doc health. Each one passes cleanly in exactly the situation another is meant to catch, so passing one check is never evidence of another:

| Check | Compares | Question |
|---|---|---|
| **Consistency** | doc ↔ doc | do the docs contradict each other? |
| **Completeness** | claim source ↔ doc | did every decision reach a doc at all? |
| **Soundness** | decision ↔ its inputs | is the decision correct? |

Run only what the invoker names. If the invocation names no check, ask; the checks read different claim sources, and running the wrong one reports a false clean.

**Read-only.** Report findings; fixes are a separate, user-gated step. Every finding carries `file:line`, severity, a concrete failure scenario, and the fix. A finding with no failure scenario is an opinion: drop it before reporting. Close the report with a count by severity, what verified clean (so later passes do not reopen it), each fix mapped to the findings it closes, the single highest-leverage fix, a verdict, and what was NOT covered.

**Cost gates, binding.** Every run pairs the main context with one fresh subagent: both run the named checks independently, reconciled before reporting. Transcript mode (`full`) and any multi-subagent fan-out REQUIRE EXPLICIT USER CONFIRMATION. When a gated mode fits the audit, propose it with the justification (why the default is insufficient) and the spend (how many agents, reading what), then wait for the call.

Audit the committed tree by default; uncommitted edits are in scope only when they are the audit's subject.

## Modes

A mode sets the claim source (the text the claims are enumerated from) for whichever checks run, defaulting to `docs` when none is named. Two readers run the same checks: the main context works from the session it lived plus the docs, and one fresh subagent reads its assigned source cold. The main context cannot grade its own history impartially, so the subagent is the independent second read; the two finding sets are reconciled per the dispatch rules below.

- **docs:** both readers audit the docs (the entry, the checklist, the canonical set).
- **full:** the subagent sweeps the extracted transcript against the docs. REQUIRES USER CONFIRMATION.

The transcript is read once, by the subagent, and feeds every check that can use it: Completeness (its claim source), Consistency's said-vs-written, and Soundness (ruling reasoning and question-ordering are visible there, invisible in the docs). The read is smaller than session size implies, because the extractor strips tool calls and results; the script prints the real estimate before anything is dispatched.

Dispatch rules, binding on every run: never brief the subagent on the main context's findings (anchoring destroys the second source's independence); the subagent reports and never writes; reconcile before reporting. A finding stands until refuted with evidence; silence is not a refutation. One-sided findings are the expected yield, never noise. The subagent sees what the main context lost; the main context sees doc state the transcript never mentions. A wide, high-stakes audit where a missed finding is irreversible routes to the `audit-dispatch` skill's fan-out instead; routine runs never qualify.

### Transcript extraction (full mode only)

```bash
# Writes .scratch/session-transcript.md — scratch, never committed.
sid="${CLAUDE_CODE_SESSION_ID:-}"
[ -n "$sid" ] || { echo "no CLAUDE_CODE_SESSION_ID exported"; exit 1; }
f=$(ls -t ~/.claude/projects/*/"$sid".jsonl 2>/dev/null | head -1)
[ -n "$f" ] || { echo "session $sid has no log on disk"; exit 1; }
PY=$(command -v python3 || command -v python) || { echo "no python interpreter found"; exit 1; }
mkdir -p .scratch
"$PY" - "$f" <<'EOF'
import json, os, sys
p = sys.argv[1]
recs = []
for line in open(p, encoding='utf-8'):
    try: recs.append(json.loads(line))
    except: pass
# Slice at the last compact boundary: earlier segments were audited by a previous run.
cut = max([i for i, d in enumerate(recs) if d.get('isCompactSummary')], default=-1) + 1
out = []
for d in recs[cut:]:
    m = d.get('message') or {}
    if m.get('role') not in ('user', 'assistant'): continue
    c = m.get('content')
    parts = [c] if isinstance(c, str) else [b.get('text', '') for b in c if isinstance(b, dict) and b.get('type') == 'text']
    t = '\n'.join(x for x in parts if x.strip())
    if t.strip(): out.append('### ' + m['role'].upper() + '\n' + t)
txt = '# Session transcript — %s, records %d..%d\n\n' % (os.path.basename(p), cut, len(recs)) + '\n\n'.join(out)
open('.scratch/session-transcript.md', 'w', encoding='utf-8').write(txt)
print('picked:', os.path.basename(p), '| resolved by: CLAUDE_CODE_SESSION_ID')
# Conservative token estimate: English averages ~4 chars/token, CJK ~1-1.5.
# Mixed-language sessions underestimate at //4, so divide by 2 instead.
print('turns:', len(out), '| chars:', len(txt), '| est tokens (conservative):', len(txt) // 2)
EOF
```

**Read the `picked:` line before dispatching anything.** A wrong pick yields a confident, fully-formed audit of the wrong conversation, and every later step looks normal. Tool payloads are stripped deliberately: rulings, corrections, and rejections live in user and assistant text turns, in whatever language they were written. If the estimate exceeds the subagent's context, have it read from the start and report what was left unread.

## Consistency

Source: the docs themselves — `design-docs/`, `OPEN-QUESTIONS.md`, and `docs/adr/`. Read the set the run covers, then run the greps and the link check by script and judge each hit by eye. The script attests absence (no drifted term anywhere, no dead link); only the read catches a contradiction no pattern names.

1. **Determined-only.** Grep `design-docs/*.md` for `OPEN`, `TBD`, `maybe`, `?`, `⚠️`, and the status glyphs (`🟡`, `🟢`, `⛔`). Judge each hit in context: a literal `?` in prose or code spans, and text quoting the rule itself, are not violations. Report genuinely open design content with the fix "move to `OPEN-QUESTIONS.md`".
2. **Terminology.** Grep for drifted or banned terms against `CONTEXT.md`.
3. **Contracts.** Every event name, path, field name, and schema column identical across all docs that touch it. Name-level, not semantic: two docs can still assign the same field different owners, so pair this check with a judgment read when the docs describe who writes what.
4. **Stale proposals.** Grep for terms dropped or superseded per `docs/adr/` and `OPEN-QUESTIONS.md`: any hit is either gone or marked superseded at its source.
5. **Cross-refs.** Markdown links between docs resolve; `#NN` references match live entries; entries are deleted at bake, and their decision record lives in `docs/adr/`.
6. **ADR ↔ index.** Every ADR in `docs/adr/` has a row in `docs/adr/README.md`; every row's status matches its ADR's `Status` field. A bake that produced no ADR for an independently-reversible ruling is a gap.
7. **Supersession.** Where canonical was rewritten by a later decision, the predecessor ADR must read `superseded by NNNN`. A superseded decision whose ADR still reads `accepted` is a silently wrong index.
8. **Recounts.** Anything whose stated size changed under audit (endpoint totals, table counts, event lists) gets recounted by hand: every other check here compares names, never sums.
9. **Said vs written (transcript runs only).** For every decision stated in the transcript, does the doc now say the same? Report both directions: a doc contradicting what the user ruled, and a doc asserting what the session never decided. Quote the ruling verbatim, turn included. The ruling text often sits in the assistant turn the user confirmed.

Severity: CRITICAL = direct contradiction between authoritative sources (two canonical docs, or a doc vs the user's ruling) · HIGH = stale or superseded content that will mislead a build · MEDIUM = terminology drift / field or status mismatch · LOW = style / broken intra-doc link.

## Completeness

**The method is enumeration, never attestation.** Enumerate the claims as a numbered list (one row per claim: every decision, ruling, correction, constraint, and rejected proposal, plus the reasoning behind each adopted choice). For each, cite the `file:line` where it now lives. Derive the gap list mechanically — cross-check every claim id against the target text with a script, never by re-reading. Report each gap with its target doc and the text to add; fixes are applied by the user or the invoking workflow (e.g. `bake-design`), then the audit re-runs from the top. Empty is done; report the list as evidence.

Read the source from the start: the early turns are where the main context's recall is weakest.

Write-as-you-go is question-triggered — it captures answers and misses everything that arrives without a question in front of it. Sweep those classes first:

1. **Volunteered rulings** — the user states a constraint unprompted; no question preceded it, so nothing triggered the write.
2. **Agent-discovered findings** — traps and dead ends you hit while working; nobody asked, so nothing was answered.
3. **Rejected proposals** — there is no "answer" to mark down, so the rejection leaves no trace and gets re-proposed later.
4. **Corrections** — read as conversational repair rather than decisions.
5. **Why the winner won** — the ruled outcome always lands; the number or constraint that killed the alternative stays in conversation and dies with it.

## Soundness

Soundness is the judgment layer: the other two checks ask where content went, this one asks whether the design is correct and worth building on. Read adversarially — try to break the design and every ruling in it, and let what survives stand as the justification. It runs on unbaked rulings, never baked ones. Post-bake the answer is already in canonical, and a doubt about it opens a new entry.

Scope: every ruling under audit. Probes 1-5 need a fixed value to check against (a number, formula, range, count, threshold, fixed vocabulary, or storage location); a direction-setting ruling that fixes none skips them. Probes 6-8 and the two sweeps apply to every ruling, prose included.

Enumerate the claims first, then run every applicable probe against every claim; do not stop at the first hit:

1. **Variable resolution.** Every symbol in a formula resolves to a defined value whose source is stated. Reverse direction too: the rule that invokes a computation must require exactly the inputs that computation reads, never a superset or an alternative.
2. **Scale coherence.** For every expression combining quantities, write out each term's range. Terms combined without normalization whose ranges differ by an order of magnitude are a defect: the small term is decorative, and the design's stated intent for it is false.
3. **Boundary run.** Evaluate at the floor, a typical value, and the ceiling of every input. Flag monotonicity inversions (more of the intended input produces a worse outcome), dominance (one term decides regardless of the others), and ordering inversions (the option meant to be better performs worse).
4. **Arithmetic.** Recompute by hand. Every stated count matches the rows it counts; every sum is verified, not trusted.
5. **Guard reachability.** Any check specified as debug-only, development-only, or off-by-default is a silent failure in production. Name what goes unnoticed when it does not run.
6. **Rejection rationale.** The stated reason for rejecting an option must not be a property of the option that was adopted; a rejection that would also disqualify the winner becomes precedent next session.
7. **Sibling sites.** For every symbol a ruling renames, every count it changes, and every rule it retires, grep the docs under audit for the old form and report every surviving hit.
8. **Underspecification.** Read each ruling as an implementer who was not in the session: if it admits two incompatible builds, it is a defect. Name both readings.

Then two sweeps across the whole claim set:

- **Dependency inversion, both directions.** Forward — a ruling whose inputs come from a question still open. Report it, name the question, and recommend the PROVISIONAL marker (marking stays with `open-questions` and `bake-design`). Reverse — a ruling marked PROVISIONAL whose named dependency has since been ruled. Report that too; a stale marker blocks a bake that should proceed.
- **Unbudgeted cost.** A new agent call, context injection, per-turn write, or storage path introduced with no stated cost.

Severity: CRITICAL = the design cannot work as written · HIGH = defect with a concrete failure scenario · MEDIUM = gap or cost that bites at build time · LOW = reasoning stated wrongly where the conclusion still stands.

**What soundness cannot check.** Preference has no probe: between two designs that both survive, the pick is the user's, and whether a weaker executor can hold the design needs a live run, not a review. Mark those as such rather than reporting them as findings.
