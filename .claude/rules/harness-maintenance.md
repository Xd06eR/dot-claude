# Harness Maintenance

How to update the harness (`~/.claude`) without silently degrading it.

## The map

- **Any harness-maintenance work:** read [CANON.md](../../CANON.md) in full first: it carries the rule text for components, rules files, settings, and methods, with their whys.
- **Editing skills, commands, or agents:** call the Skill tool with "writing-for-agents" before writing.
- **Editing a workflow surface (CLAUDE.md's Engineering principles section, README § The Workflow, a workflow skill, or a rules file carrying workflow routing):** read README.md in full and the related workflow skills first.

## Edit protocol

1. **Verify loading when scoping changes:** two headless probes, a context check and a load check, per the Loading probes recipe in [CANON.md](../../CANON.md); a failed probe stops the batch — report before proceeding.
2. **Prune only with coverage:** before pruning any doc, audit that every load-bearing item lives elsewhere (or move it first), and that no inbound reference dangles.
3. **Per-edit gate:** durable files change via the Edit tool only, one at a time, exact new text and reasoning stated before each call.
4. **Never read or commit `settings.json` wholesale:** it can carry a live provider token.
5. **Apply the review lenses:** every proposed edit, extraction, adoption, or review passes the lenses in CLAUDE.md (Doc content and structure, How to work with me) and the extraction judgments (layer check, tone is pressure) before proposal.

## House style for durable files

- **References:** a dependency reference ("per X's Git section") may only point at content that loads at least as often as the referrer; a locator (name + path + when to read) is allowed at any level if the path resolves from any cwd; targets are section names or concept phrases in the target's body text, never a bullet label alone. Paths are relative markdown links inside the rules tree (the injection header carries the referrer's absolute path); absolute `~/.claude/...` in skill, command, and agent bodies (a subagent dispatched inside a project repo resolves cwd-relative paths against the project root), in shell commands and write destinations, and when naming the harness root.
- **Component names stay bare:** `grill-me`, never `/grill-me`; slash only when quoting the command the user types (`/compact`).
- **Canonical agent terms:** main agent, and subagents for its dispatched workers; no synonyms.
- **Headings and bullet labels:** sentence case for headings (first word plus proper nouns and coined phrases only; H1 document titles exempt), no trailing punctuation; bullet labels state the rule's content; element-convention labels may name the element instead; an established industry term is the strongest label form; never a synthetic coined term.
- **No model names or tier assumptions:** the injection tells the agent what its harness offers. Write no environment conditionals. Functional `model:` frontmatter in `agents/*.md` is exempt.
- **Caps emphasis:** a deliberate pressure pin, never normalized away.
