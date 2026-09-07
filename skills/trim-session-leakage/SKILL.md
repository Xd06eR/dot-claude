---
name: trim-session-leakage
description: Audit durable text for prose whose vantage is the authoring session rather than the reader at HEAD — dead session citations, change narration, review choreography, reviewer-addressed justification, control-flow narration, hedge residue. Use when reviewing or canonizing docs, comments, or reports. Returns restate-at-HEAD fixes, not bare deletions.
origin: deepseek-harness
---

Session leakage is prose whose vantage is the authoring session rather than the repository at HEAD: it cites artifacts only that session could see, narrates the change instead of the state, or argues with a reviewer who has left.

**The one test:** could a reader at HEAD, with no access to the session transcript, PR thread, or uncommitted draft, resolve every reference and verify every claim? If no, the passage leaks. If yes, it is not leakage, however historical it sounds — but resolvability only clears the citation: on current-state surfaces (docs, READMEs, comments) a resolvable change story is still narration, and classes 2 and 3 restate it.

## Taxonomy

1. **Dead session citations** — "(decision 7)", "audit C2", "design §4.7", phase labels. If the decision has a durable owner, cite it by name and path; otherwise delete the citation and restate its factual clause to stand alone.
2. **Change narration** — "used to", "no longer", "the old X", "now" contrasting with a past state. State the present behavior; a fixed regression becomes a present-tense counterfactual ("without X, Y happens"), never history.
3. **Stack and PR vantage** — "this PR adds", "the previous commit", "a later PR in this stack". State the shipped mechanism; deferred work moves to a TODO marker or an issue reference.
4. **Review choreography** — "rejected in review", "the reviewer confirmed", draft ordinals. Keep the surviving decision as plain fact; delete who said it when.
5. **Reviewer-addressed justification** — "this is correct because...", "the cast is safe — it simply...". State the invariant that makes it true, or delete if the code shows it.
6. **Control-flow narration** — "first we X, then we Y", test walkthroughs, proofs of obvious branches. Delete; keep only a non-obvious contract or invariant.
7. **Hedge residue** — "probably fine for now", "should be enough", deferrals with no marker. Promote to a TODO/FIXME or restate as the actual bound.
8. **Authoring-language slips** — untranslated working-language fragments (foreign terms, session separators) in prose whose language is otherwise English. Translate or delete.

## Not leakage — do not delete

- **Issue references** — "#1470", "TODO(name):" resolve at HEAD.
- **Suppression justifications** — lint-disable reasons, coverage-ignore reasons, empty-catch explanations are required prose; fix a false reason, never delete it.
- **Counterfactual-present regression pins** — "without X, Y happens", "a naive X would...".
- **Measured bounds** — "(measured: 512 nests ≈ 0.15s)" calibrating a constant; the provenance word is load-bearing.
- **Runtime lifecycle old/new** — "the old connection drains before the new one accepts" is runtime state, not change history.
- **Merged-PR citations in changelogs and postmortems** — sanctioned evidence there; the ban is on a current-state doc adopting one PR's vantage.
- **Genre slots** — a change-story or alternatives-considered section may narrate history ("the first cut shipped X", "rejected: ..."), and project voice may use "we"; the indexical stamps ("this cut", "v5 of this note") stay banned everywhere.

## The fix

Never delete alone when a passage carries factual clauses: restate each surviving fact so it stands at HEAD, then delete the transcript around it. A passage carrying none (a bare audit code, control-flow narration) is deleted outright. Verify by re-running the battery: what remains should be only sanctioned keeps and quoted evidence.

## Overcorrection traps

Restating goes wrong in four recorded ways:

- **Modality flip** — "exceptions pending migration" trimmed to "sanctioned exceptions" turns an obligation into a blessing. Keep the modality.
- **Hypothetical promoted to shipped** — deleting the future-marker alone turns "a future X would..." into a claim that X exists. Mark the hypothetical explicitly instead.
- **Sentence deleted instead of clause** — when propositions share a line (half narration, half load-bearing fact), delete clauses, not sentences.
- **Provenance dropped, number kept** — "measured" pins a constant as an observation, not a definition; without the word, nobody re-measures before retuning.

## Probe battery

Mechanize the first pass, then judge every hit semantically; the battery over-matches by design, and no battery catches everything, so also read the densest prose in scope without a pattern in hand:

```
rg -n '\(decision \d|\(audit [A-Z]\d|design §|plan §|\bT\d\b|\bW\d\b|\bP-I\b'   # session codes, case-sensitive: -i turns phase labels into noise
rg -n -i 'used to |no longer|previously|the old |this PR|this branch|this commit|this stack|later PR|previous commit|was renamed|was moved|\bv1\b|this cut|\btoday\b|roadmap|for now|probably |should be enough|it simply|is safe —|rejected in review|review round|reviewer confirmed|as of v\d|§\d'
```

Two invocation rules: exclusions go last so a later include cannot re-admit them; a zero-hit pattern proves nothing until you have seen it match a known-positive string.

Known false positives: instrumental "used to" ("the key used to sign requests" names use, not time); `v1` as a protocol or path segment; "this PR" inside process docs about the PR workflow; `§N` citing an external standard or a committed doc that owns its numbering.

## Scope

Applies to durable text: docs, comments, reports, commit messages. Conversation is exempt. CLAUDE.md's "Write for the class, not the occasion" owns the principle; this skill is the audit instrument. Quoted evidence and recorded output (error transcripts, fixtures) keep their original voice: fix the prose around them, never the quotes. When the leaking text is generated, fix the source or generator, not the output.
