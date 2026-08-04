# Harness Maintenance

How to update the harness (`~/.claude`) without breaking it.

## Change tiers

**Self-serve (do it, report after):** objectively dead references (name/path no longer resolves), fixed name-only.

**Ask first:** any semantic change to a harness file or component; `paths:` glob changes; deleting any file, including stale-looking backups; a wholesale rewrite of a working file.

## Edit protocol (when a change is authorized)

1. **Backup:** copy the file next to itself before editing — `foo.md.bak`, never `foo.bak.md` (a `.md` backup in an auto-loaded dir loads as a live module). Skip for small edits.
2. **Verify loading when scoping changes** with headless probes: a context check (`claude -p 'Is a rule titled "<TITLE>" in your context? yes/no' --tools ""` — unscoped answers yes) and a load check (rerun with tools enabled, reading a matching file first — scoped answers no before the read, yes after).
3. **Prune only with coverage:** before pruning any doc, audit that every load-bearing item lives elsewhere (or move it first); `.bak`-park the pruned file. Batch-remove `.bak` files only when the rework that produced them is complete (ask-first).

Print the diff of changed files in your reply when the batch closes.

## House style for durable files

- Reference direction: a dependency reference ("per X §5") may only point at content that loads at least as often as the referrer; a locator (name + path + when to read) is free at any level if the path resolves from any cwd.
- Standardize on **main agent** for the orchestrating agent in all harness files; its dispatched workers are subagents; use no other name for it.
- No model names or tier assumptions; the injection tells the agent what its harness offers — write no environment conditionals. Functional `model:` frontmatter in `agents/*.md` is exempt.

## Lesson write-back

- Harness lessons follow CLAUDE.md's lesson write-back, then land in the owning harness file when stable (3+ sessions, ask-first — or same-session for a standing convention or rejected tool call); the memory is `.bak`-parked on landing.
- Keep the project `MEMORY.md` index current; condense near 30 lines; merge same-theme memories.

## Audit execution

- **Findings format:** every finding from any audit or review of the inventory follows `- **[SEVERITY]** [file:line]: [issue] — [fix]` (severity scale per `rules/common/code-review.md`).
- **Verify built-ins via the live list:** filesystem recon cannot verify built-in skills; check the session's available-skills list before claiming stale or missing.
- **Format:** edited durable files pass CLAUDE.md's Doc structure rules before the batch closes.
- **Batch verification:** scan removed diff lines for silently lost content (backticks, acronyms, named items) and confirm every word-count delta is intentional; code blocks and table cells byte-diff per the Merge checklist.

## Size budget

Any single rules file beyond ~8 KB, or the unscoped (always-loaded) set beyond ~40 KB total, triggers a trim-or-scope proposal with measured sizes. The total measures unscoped files only (`wc -c rules/common/*.md`). Every unscoped KB is paid every session forever.

## CLAUDE.md and instruction docs

- CLAUDE.md is the trunk — the home of preferences and instructions for the user's work; harness-work rules live here, not there. Rules files are side-tracks that extend CLAUDE.md, never restate it; CLAUDE.md may restate a rules detail when it must stand self-contained (it ships alone to other agents). CLAUDE.md targets under 200 lines.
- The CLAUDE.md catalog is routing-only: phase-fired + auto-invoked names, no restated descriptions, no situational enumeration. Inventory lives in README § Skill Sources; discovery comes from the session injection. Slash prefix = command, bare name = skill. Load-bearing parentheticals are allowed when they carry execution structure (sub-dispatch breakdowns, required paths) or tool connectors that have no frontmatter of their own.

## Rules

- **Loading scope:** unscoped only when true for every prompt, with the reason stated in its proposal; everything else takes `paths:`.
- **Trim line (when cutting content):** cut only human-facing content the agent cannot act on (keybindings, env setup, permission advice, harness self-description). Keep agent-attention checklists (scan lists, severity tables, routing inventories) even when they restate known concepts — internalization ≠ reliable execution.

## Skills, commands, and agents

- **Persona and headings:** agents get a terse persona (1–3 sentences: role, specialty, responsibility) before the dispatch block, and no H1 — the frontmatter name already provides it. Commands and skills get no persona; an H1 only when a genuine title beyond the bare name.
- **Frontmatter:** name, description-with-trigger, tools, origin (origin last); add `part-of` for multi-agent families. Quote the description with `""` only when it contains a colon.
- **Description = the routing surface:** posture + trigger + what it returns. A `## When to invoke` body section is an anti-pattern — relocate its content into the description, never drop it.
- **Pre-existing components:** change only when an effectiveness case justifies it. Description re-tailoring is justified (it is routing); cosmetic trims are not.
- **Multi-exemplar:** read sibling components before writing; base format and structure on the best practice across them, never on one target.
- **Adoption mechanics:** strip `disable-model-invocation: true` on adopted skills meant to stay auto-invokable; strip self-run git mutations from adopted components (CLAUDE.md's never-commit rule binds component bodies); tag `origin:` as `custom` (hand-built here), the source name (ported-from: plugins by plugin name, repos by repo name), or `A + B` (two-source merge).
- **Commands:** never hardcode folder names; audit/check commands inline their full spec — never repoint, since the referenced file may be the audit target, and spec overlap with CLAUDE.md is deliberate, not drift; per-session artifact templates live in the command body, with durable text holding only trigger + pointer.

## Extraction and curation

- **Extraction pipeline:** read the source and justify what to take → extract verbatim → remove the source's bad parts → enhance what survives → adapt to this harness's conventions and workflows → verify against the sources that nothing useful was lost → final acceptance audit (main context + a fresh subagent in parallel, reconciled; per `rules/common/dispatch-protocol.md` §5) → output the commit command for the user. Extraction is not a rewrite; relocate useful content, never drop it silently.
- **Keep/drop:** judge components by purpose and workflow fit, never by invocation count — frequency is supporting evidence only. Overlapping components merge, never accumulate. Every verdict is user-gated; a later explicit decision supersedes an earlier one.
- **Component form:** a component is lean instruction producing rich output — no knowledge-database skills. A skill needing external setup beyond invoke-and-use gets removed and its references updated.
