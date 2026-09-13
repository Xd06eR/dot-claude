# Harness Maintenance

How to update the harness (`~/.claude`) without breaking it.

## Change tiers

**Self-serve (do it, report after):** objectively dead references (name/path no longer resolves), fixed by updating the reference only.

**Ask first:** any semantic change to a harness file or component; `paths:` glob changes; deleting any file, including stale-looking backups; a wholesale rewrite of a working file.

## Edit protocol (when a change is authorized)

1. **Backup:** copy the file next to itself before editing — `foo.md.bak`, never `foo.bak.md` (a `.md` backup in an auto-loaded dir loads as a live module). Skip only for typo/one-line edits; when in doubt, back up.
2. **Verify loading when scoping changes** with headless probes: a context check (`claude -p 'Is a rule titled "<TITLE>" in your context? yes/no' --tools ""`, unscoped answers yes) and a load check (rerun with tools enabled, reading a matching file first: scoped answers no before the read, yes after). A failed probe stops the batch; report before proceeding.
3. **Prune only with coverage:** before pruning any doc, audit that every load-bearing item lives elsewhere (or move it first); `.bak`-park the pruned file. Batch-remove `.bak` files only when the rework that produced them is complete (ask-first).

Print the diff of changed files in your reply when the batch closes.

## House style for durable files

- Reference direction: a dependency reference ("per X §5") may only point at content that loads at least as often as the referrer; a locator (name + path + when to read) is allowed at any level if the path resolves from any cwd.
- Reference targets: section names, or concept phrases that appear in the target's body text ("the never-commit rule"); never a bullet label alone (labels get renamed; sections and body-text concepts survive).
- Path form: relative markdown links inside the rules tree (the injection header carries the referrer's absolute path, so resolution never depends on the session cwd, and links render as clickable navigation on GitHub and in IDE markdown preview); absolute `~/.claude/...` in skill, command, and agent bodies (invocation may surface only a symbolic path; a subagent dispatched inside a project repo resolves cwd-relative paths against the project root, where harness files do not exist), in shell commands and write destinations, and when naming the harness root.
- Standardize on **main agent** for the orchestrating agent in all harness files; its dispatched workers are subagents; use no other name for it.
- Headings: sentence case (first word plus proper nouns and coined phrases only, e.g. "Act vs Ask"); no trailing punctuation.
- Bullet labels state the rule's content, never a coined concept: the label is recall and scannability, not a name to decode.
- No model names or tier assumptions; the injection tells the agent what its harness offers. Write no environment conditionals. Functional `model:` frontmatter in `agents/*.md` is exempt.

## Lesson capture

- Harness lessons follow CLAUDE.md's proposal gate; the accepted rule lands in the owning harness file (ask-first, or same-session for a standing convention or a rejected tool call).

## Audit execution

- **Findings format:** every finding from any audit or review of the inventory follows `- **[SEVERITY]** [file:line]: [issue] — [fix]` (severity scale: read [review-standards.md](../../rules/common/review-standards.md) when scoring findings).
- **Verify built-ins via the live list:** filesystem search cannot verify built-in skills; check the session's available-skills list before claiming stale or missing.
- **Format:** edited durable files pass CLAUDE.md's Doc content and structure rules before the batch closes.
- **Batch verification:** scan removed diff lines for silently lost content (backticks, acronyms, named items) and confirm every word-count delta is intentional; byte-diff per [dispatch-protocol.md](../../rules/common/dispatch-protocol.md) §3.

## Size budget

Any single unscoped rules file beyond ~8 KB, or the unscoped (always-loaded) set beyond ~40 KB total, triggers a trim-or-scope proposal with measured sizes. The total measures unscoped files only: rules files with no `paths:` frontmatter, wherever they live. Scoped and project-scope files are budgeted against their loading frequency, not this cap. Every unscoped KB is paid every session forever. Agents: beyond ~200 lines or descriptions past ~50 words flag for review, not reflexive action — a self-contained brief such as security-auditor may exceed the line budget when its self-containment is load-bearing.

## CLAUDE.md and instruction docs

- CLAUDE.md is the trunk — the home of preferences and instructions for the user's work; harness-work rules live here, not there. Rules files are extensions of CLAUDE.md, never restate it; CLAUDE.md may restate a rules detail when it must stand self-contained (it ships alone to other agents). CLAUDE.md targets under 200 lines.
- The CLAUDE.md catalog is routing-only: the fixed openings and the user-invoked set, no restated descriptions, no situational enumeration. Inventory lives in README § Skill Sources; discovery comes from the session injection. Slash prefix = user-typed invocation; bare name = model-invoked skill. Load-bearing parentheticals are allowed when they carry execution structure (sub-dispatch breakdowns, required paths) or tool connectors that have no frontmatter of their own.

## Rules

- **Loading scope:** unscoped only when true for every prompt, with the reason stated in its proposal; everything else takes `paths:`.
- **Trim criterion (when cutting content):** cut only human-facing content the agent cannot act on (keybindings, env setup, permission advice, harness self-description). Keep agent-attention checklists (scan lists, severity tables, routing inventories) even when they restate known concepts: internalization ≠ reliable execution.

## Skills, commands, and agents

- **Persona and headings:** agents get a terse persona (1–3 sentences: role, specialty, responsibility) after the frontmatter, at the top of the body, and no H1: the frontmatter name already provides it. Agent descriptions run up to ~50 words: stance + trigger + returns takes three clauses. Commands and skills get no persona; an H1 only when a genuine title beyond the bare name.
- **Frontmatter:** name, description-with-trigger, then `disable-model-invocation` and `argument-hint` when present, tools, origin (origin last); add `part-of` for multi-agent families. Quote the description with `""` only when it contains a colon. Argument-hint marks required slots with `<>`, optional with `[]`; quote it only when YAML requires (a leading `[` or an inner colon).
- **Description = the routing surface:** stance + trigger + what it returns; never a workflow summary. Keep it to one to three sentences carrying stance, trigger, and the mis-invocation guard, with returns as a phrase at most; path specs and behavioral detail live in the body. The mis-invocation guard covers lexical or state ambiguity only; naming other skills or phases is routing, which lives in the workflow layer. When trimming, cut marketing and pure restatements only; words the user would type when hitting the problem (symptoms, failure modes, their own scope terms) carry the match — never trade them for category names. A `## When to invoke` body section is an anti-pattern: relocate its content into the description, never drop it. User-invoked components (`disable-model-invocation: true`) drop the trigger and the mis-invocation guard (both exist for model-side invocation decisions) and keep a one-to-two-sentence statement of what it does; when to run it belongs to the workflow layer, not the description.
- **Invocation mode:** user-invoked when the action writes un-gated state, the trigger moment is not observable in the conversation, or the skill serves an occasion so habitual and self-evident in the user's daily flow that the moment itself reminds them (passing work off, compacting, baking a settled design); everything else defaults to model-invoked: stage- and context-bound work skills fire on the natural ask or the work state, even ones used too rarely for the user to recall by name.
- **Pre-existing components:** change only when an effectiveness case justifies it. Description re-tailoring is justified (it is routing); cosmetic trims are not.
- **Multi-exemplar:** read sibling components before writing; base format and structure on the best practice across them, never on one target.
- **Adoption mechanics:** strip `disable-model-invocation: true` on adopted skills meant to stay auto-invokable; strip self-run git mutations from adopted components (CLAUDE.md's never-commit rule binds component bodies); tag `origin:` as `custom` (hand-built here), the source name (ported-from: plugins by plugin name, repos by repo name), or `A + B` (two-source merge).
- **Skills and commands:** never hardcode folder names; audit/check components inline their full spec: never repoint, since the referenced file may be the audit target, and spec overlap with CLAUDE.md is deliberate, not drift; per-session artifact templates live in the component body, with durable text holding only trigger + pointer.

## Extraction and curation

- **Extraction pipeline:** read the source and justify what to take → extract verbatim → remove the source's bad parts → enhance what survives → adapt to this harness's conventions and workflows → verify against the sources that nothing useful was lost → final acceptance audit (main context + a fresh subagent in parallel, reconciled; per `rules/common/dispatch-protocol.md` §5) → output the commit command for the user. Extraction is not a rewrite; relocate useful content, never drop it silently.
- **Keep/drop:** judge components by purpose and workflow fit, never by invocation count: frequency is supporting evidence only. Overlapping components merge, never accumulate. Every verdict is user-gated; a later explicit decision supersedes an earlier one.
- **Component form:** a component is lean instruction producing rich output — no knowledge-database skills. Default to a single SKILL.md. A companion file (references, templates) earns its place only when the content genuinely doesn't fit, and a script only when the work can't be carried by instructions alone. A skill needing external setup beyond invoke-and-use gets removed and its references updated. An attention checklist (what to look at) directs attention the model would otherwise skip; a lookup table mapping a known error to a known fix replaces judgment the model already has and is rejected.
