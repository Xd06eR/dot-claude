# Harness Maintenance

How to update the harness (`~/.claude`) without silently degrading it.

## The map

- **Editing this harness:** read [CANON.md](../../CANON.md) in full first; it is the harness rulebook.
- **Writing or editing a skill, command, or agent:** call the Skill tool with "writing-for-agents" first; for building or benchmarking a skill, "skill-creator:skill-creator".
- **Editing the workflow:** read [README.md](../../README.md) in full first; it maps the workflow spine and the four workflow paths.
- **Seeing what Claude Code sends:** run `node ~/.claude/scripts/proxy.mjs` — it captures the whole request (system prompt, tool schemas, injected context, a subagent's prompt) with sizes and token counts; run `--help` for the full option set.

## Edit protocol

1. **Prune only with coverage:** before pruning any doc, audit that every load-bearing item lives elsewhere (or move it first), and that no inbound reference dangles.
2. **Per-edit gate:** durable files change via the Edit tool only, one at a time, exact new text and reasoning stated before each call.
3. **Never read or commit `settings.json` wholesale:** it can carry a live provider token.

## House style for durable files

- **References:** a dependency reference may only point at content that loads at least as often as the referrer; a locator (name + path + when to read) is allowed at any level; targets are section names only, and every reference links directly to the section.
- **Paths:** relative markdown links when read at the file (rules-tree links resolve via the injection header, a skill's companions via the invocation's base directory); absolute `~/.claude/...` when they travel to an unpredictable cwd (agent bodies, dispatch prompts, shell commands, write destinations).
- **Component names stay bare:** `grill-me`, never `/grill-me`; slash only when quoting the command the user types (`/compact`).
- **Canonical agent terms:** main agent, and subagents for its dispatched workers; no synonyms.
- **Canonical invocation terms:** model-invoked and user-invoked; no synonyms.
- **Headings and bullet labels:** sentence case for headings (first word plus proper nouns and coined phrases only; H1 document titles exempt), no trailing punctuation; bullet labels state the rule's content; element-convention labels may name the element instead; an established industry term is the strongest label form; never a synthetic coined term.
- **No model names or tier assumptions:** the injection tells the agent what its harness offers. Write no environment conditionals. Functional `model:` frontmatter in `agents/*.md` is exempt.
- **Caps emphasis:** ALL-CAPS words in rule text are deliberate pressure pins; never lowercase them in an edit or style pass.
