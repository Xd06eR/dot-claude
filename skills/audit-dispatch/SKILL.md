---
name: audit-dispatch
description: Fan-out shape for an audit too wide to verify in one pass and high-stakes enough that a missed finding is irreversible. Returns lens findings, disproof-verified and reconciled into one severity-ranked list.
origin: custom
---

This shape governs audit or review work already under way; it never fires on its own. When the work at hand is both **wide** (one pass cannot verify it line-by-line) and **high-stakes** (a missed finding means an irreversible break, a security hole, a broken public contract, or a wrong architecture call), propose this shape with the justification and wait for the user's call — the fan-out costs roughly 4x a single agent in tokens, which is why the gate exists. The shape applies only where findings are objectively refutable; taste audits do not qualify. If the target or lens set is ambiguous, ask first: auditing the wrong one reports a clean pass on content it never checked.

- **Independent lens finders:** one subagent per lens, matched to the audit's purpose — 2-4 lenses (a wider target is two audits, not more lenses). Independence must be structural: each lens carries its own checklist or source; separate contexts given the same brief converge instead of corroborating. No shared context, no cross-briefing. A pass on one lens is never evidence for another.
- **Disproof verifier:** one subagent tries to refute every finding against its source — it judges whether each finding survives its source, not how the finder got there. What cannot be re-grounded is dropped. False negatives acceptable; false positives are the enemy.
- **Main-agent reconciliation:** dedup, severity-rank, coverage map. A finding stands until refuted with evidence; silence is not a refutation. An empty findings list is legitimate.
- **Completeness against a discussion:** when a session transcript is the claim source, run it as a source pair. The main agent audits the artifacts, a transcript finder audits what was said; enumerate the claims and derive the gap list by script, never by re-reading.
- **Mechanize first:** scriptable checks (links, counts, drift greps) run before any finder dispatches.
- **Soundness probes:** for value-fixing content (numbers, formulas, thresholds), verify by recomputation and boundary evaluation, never by trusting the stated value.
- **Read-only:** the audit never edits its target; fixes are a separate, user-gated step.

Dispatch mechanics for the subagents above (the dispatch triad, the report contract, escalation levers, and stopping rules) live in `~/.claude/rules/common/dispatch-protocol.md`.