# Harness Maintenance

How to update the harness (`~/.claude`) without silently degrading it.

## Edit protocol

1. **Verify loading when scoping changes:** two headless probes, a context check (`claude -p 'Is a rule titled "<TITLE>" in your context? yes/no' --tools ""`, unscoped answers yes) and a load check (rerun with tools enabled, reading a matching file first: scoped answers no before, yes after the read; project-scope answers yes in its own project and no elsewhere). A failed probe stops the batch; report before proceeding. Plain extension or filename patterns in a probe-verified family are exempt; probe only novel syntax shapes (character classes, braces, negation, path patterns).
2. **Prune only with coverage:** before pruning any doc, audit that every load-bearing item lives elsewhere (or move it first), and that no inbound reference dangles.
3. **Per-edit gate:** durable files change via the Edit tool only, one at a time, exact text and reasoning stated before each call.
4. **settings.json:** never read or commit it wholesale (it can carry a live provider token).
5. **Review lenses:** every proposed edit, extraction, adoption, or review passes the lenses in CLAUDE.md (Doc content and structure, How to work with me) and the extraction judgments (layer check, tone is pressure) before proposal.

## House style for durable files

- **References:** a dependency reference ("per X's Git section") may only point at content that loads at least as often as the referrer; a locator (name + path + when to read) is allowed at any level if the path resolves from any cwd; targets are section names or concept phrases in the target's body text, never a bullet label alone. Paths are relative markdown links inside the rules tree (the injection header carries the referrer's absolute path); absolute `~/.claude/...` in skill, command, and agent bodies (a subagent dispatched inside a project repo resolves cwd-relative paths against the project root), in shell commands and write destinations, and when naming the harness root.
- **Component names stay bare:** `grill-me`, never `/grill-me`; slash only when quoting the command the user types (`/compact`).
- **Canonical agent terms:** main agent, and subagents for its dispatched workers; no synonyms.
- **Headings and bullet labels:** sentence case for headings (first word plus proper nouns and coined phrases only; H1 document titles exempt), no trailing punctuation; bullet labels state the rule's content, never a coined concept.
- **No model names or tier assumptions:** the injection tells the agent what its harness offers. Write no environment conditionals. Functional `model:` frontmatter in `agents/*.md` is exempt.

## CLAUDE.md and instruction docs

- CLAUDE.md is the trunk — the home of preferences and instructions for the user's work; harness-work rules live here, not there. Rules files are extensions of CLAUDE.md; neither restates the other. Coding rules are self-contained: they never reference CLAUDE.md (it co-loads on every injection; rules→rules extends pointers stay, since globs differ).
- The CLAUDE.md catalog is routing-only: no restated descriptions, no situational enumeration; inventory lives in README § Skill Sources.
- The four-paths route model lives in README § The four paths; before editing anything workflow-related (CLAUDE.md's Workflow section or fixed openings, README, a workflow skill's description or body), read it and the related workflow skills.

## Rules

- **Loading scope:** unscoped (loads every session of every project; only when true for every prompt); project-scope (lives in a project's `.claude/rules/` and loads only there); `paths:`-scoped (loads on matching files). Everything not universal takes one of the latter two.
- **Scoped-frontmatter synchronization:** files sharing a glob block change it together or not at all; a taxonomy change sweeps every file carrying the block.
- **File naming:** a folder's namespace-primary rule file is named `index.md` (the folder carries the namespace); specialist files with narrower globs keep their aspect names (`security.md`, `testing.md`).
- **Lesson landing:** harness lessons follow the proposal gate in CLAUDE.md's Lesson capture section; the accepted rule lands in the owning harness file.

## Skills, commands, and agents

- **Persona and headings:** agents get a terse persona (1–3 sentences covering role, specialty, responsibility) at the top of the body, and no H1. Commands and skills get no persona; an H1 only when a genuine title beyond the bare name.
- **Frontmatter:** `name`, `description`, then `disable-model-invocation` and `argument-hint` when present, `tools`, `origin`; add `part-of` when the component belongs to another (e.g., `plan-reviewer` to `plan-review`). `origin` is `custom` (hand-built here), the source name (ported-from: plugins by plugin name, repos by repo name), or `A + B` (multi-source merge). Quote `description` with `""` only when it contains a colon. `argument-hint` marks required slots with `<>`, optional with `[]`; a complete-sentence question hint stays unbracketed; quote it only when YAML requires (a leading `[` or an inner colon). Model-invoked is the default; user-invoked (`disable-model-invocation: true`) is the user's call per component.
- **Description = the routing surface:** one to three sentences carrying stance, trigger, and the mis-invocation guard, with returns as a phrase at most; never a workflow summary; path specs and behavioral detail live in the body. The mis-invocation guard covers lexical or state ambiguity only; naming other skills or phases is workflow-layer routing. A ceding clause naming a sibling skill ("for X, use Y") is allowed only when the two triggers overlap on the same user phrasing even after both are made task-precise; it never summarizes the sibling. User-invoked components (`disable-model-invocation: true`) drop the trigger and the mis-invocation guard and keep a one-to-two-sentence statement of what it does.
- **Editing descriptions:** when trimming, cut marketing and pure restatements only; words the user would type when hitting the problem (symptoms, failure modes, their own scope terms) carry the match; never trade them for category names. A `## When to invoke` body section is an anti-pattern; relocate its load-bearing content into the description.
- **Skill references in bodies:** when the referenced skill's procedure executes inline in the current flow, the reference is an invocation, written `call the Skill tool with "X"` (a one-line gloss may follow the call, never replace it). At a genuine boundary (hand-off, user-choice option, ownership statement, ceding clause, vocabulary or file pointer) a plain mention suffices: the target's description re-routes at the next invocation decision. When the invocation's executor is a subagent, it goes into the dispatch prompt as the subagent's own action.
- **Pre-existing components:** change only when an effectiveness case justifies it. Description re-tailoring is justified (it is routing); cosmetic trims are not.
- **Multi-exemplar:** read sibling components before writing; base format and structure on the best practice across them, never on one target.
- **Skills and commands:** a body never names its component's own folder (companion files resolve via the invocation's base directory), so renames break nothing; audit/check components inline their full spec (never repoint, since the referenced file may be the audit target, and spec overlap with CLAUDE.md is deliberate, not drift); per-session artifact templates live in the component body, with durable text holding only trigger + pointer.

## Extraction and curation

- **Extraction pipeline:** read the source and justify what to take → extract verbatim → remove the source's bad parts → enhance what survives → adapt to this harness's conventions and workflows (convert self-run git/gh mutations to user-run commands per CLAUDE.md's Git section) → verify against the sources that nothing useful was lost → final acceptance audit (per [dispatch-protocol.md](../../rules/common/dispatch-protocol.md)'s Batch final-audit) → output the commit command for the user. Extraction is not a rewrite; relocate useful content, never drop it silently.
- **Layer check before "covered":** vocabulary coverage (a checklist names the behavior) is not stance coverage (a bar weighs the behavior); a "covered elsewhere" verdict that only matched vocabulary leaves the stance with no seat.
- **Tone is pressure for a rule:** when a source carries an aggressive stance, extract the rule the tone enforces, in rule form; the tone itself drops.
- **Verify built-ins via the live listings:** filesystem search cannot verify built-in components (skills, commands, agents); check the session's live listings before claiming stale or missing.
- **Keep/drop:** judge components by purpose and workflow fit. Overlapping components merge, never accumulate. Every add, drop, or rename syncs README § Skill Sources in the same commit.
- **Component form:** a component is lean instruction producing rich output. No knowledge-database skills. Default to a single SKILL.md. A companion file (references, templates) earns its place only when the content genuinely doesn't fit, and a script only when the work can't be carried by instructions alone. An attention checklist (what to look at) directs attention the model would otherwise skip; a lookup table mapping a known error to a known fix replaces judgment the model already has and is rejected.
