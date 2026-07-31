# Harness Maintenance

How to update `~/.claude` itself (CLAUDE.md, rules/, settings, hooks, skills) without breaking it. Applies to any model tier.

## Ownership map (one home per topic)

| Topic | Lives in |
|---|---|
| Universal working rules, portable to any agent | `CLAUDE.md` |
| Delegation mechanics + report contract | `rules/orchestration/dispatch.md` |
| Decision thresholds (escalate, done, ask, quality floor) | `rules/common/judgment-rubrics.md` |
| Fill-in dispatch prompts | `rules/orchestration/dispatch-templates.md` |
| This protocol | `rules/common/harness-maintenance.md` |
| Session-learned facts + corrections | memory dir (`projects/.../memory/`) |

New content goes into the one file that owns its topic; others point to it, never restate. The overlap between `CLAUDE.md` and `rules/` is asymmetric, and the two directions are handled oppositely:

- **CLAUDE.md restating `rules/`:** keep it. CLAUDE.md is copied alone to other agents (Codex, Copilot, OpenCode, etc.) that never see `rules/`, so it must stand self-contained. Never trim CLAUDE.md to dedupe it against `rules/`; that proposal has been made and rejected.
- **`rules/` restating CLAUDE.md:** trim it to a pointer. A `rules/` file loads only inside Claude Code, where CLAUDE.md is always present, so restating CLAUDE.md there is pure redundancy; point to CLAUDE.md's section instead of repeating it (as `code-review.md` already does). Deleting a `rules/` file whose whole content CLAUDE.md already carries is correct, not a portability loss.
- **CLAUDE.md catalog is routing-only:** phase-fired + auto-invoked names, no restated descriptions, no situational enumeration. Inventory lives in README § Skill Sources; discovery comes from the session injection. Slash prefix = command, bare name = skill.

## Change tiers

**Self-serve (do it, report after):**

- Add or update a memory entry + its `MEMORY.md` index line
- Fix an objectively dead reference (name/path no longer resolves) when the fix is name-only and changes no behavior or routing; backup first, show the diff. A stale routing or policy rule is a semantic change: ask first

**Ask the user first:**

- Any semantic change to `CLAUDE.md`, `rules/**`, `settings.json`, or `hooks/`
- Adding, removing, or re-scoping `paths:` frontmatter globs
- Enabling/disabling plugins, skills, or MCP connectors
- Deleting any file, including stale-looking backups

**Never:**

- Wholesale rewrite of a working file; edit surgically
- `git commit` / `git push` (output commands for the user)
- Touching credentials or tokens in settings files

## Edit protocol (when a change is authorized)

1. **Backup:** copy the file next to itself before editing — append `.bak` after the full name (e.g. `foo.md.bak`), never `.bak.md` (a `.md` backup inside auto-loaded dirs is treated as a live module). Skip for small edits; keep for medium/large/restructure. Bulk changes: copy the tree to `rules.backup-<date>/`. Backup files are gitignored, never committed.
2. **Frontmatter:** every new `rules/**` file declares its loading scope. Scoped (`paths:`) when it applies to a file type; unscoped only if it must apply to every session, with a reason. Unscoped files carry no loading-cost frontmatter: their cost is governed by the size budget below. Scope by concern, not only by language: testing rules use test-file globs (`**/*.test.*`, `**/test_*.py`), source rules use source extensions, convention-bearing rules use path-restricted globs (custom hooks: `**/hooks/**/*.ts`, `**/use-*.ts`). Apply the admission test before adding unscoped content: true for every prompt, or only some? Always-loaded space is for what is always true; everything else takes a trigger.
3. **Verify loading when scoping changes** with headless probes:
   - Context check (no tools): `claude -p 'Is a rule titled "<TITLE>" in your context? yes/no' --tools ""` — forces a pure loaded-context answer, no file reads that skew the result. Unscoped rules answer yes.
   - Load check (needs Read): a second probe WITH Read allowed that reads a matching file first, then asks. Scoped rules answer no before the read, yes after.
4. **Show the diff:** `git diff <file>` to the user before the change counts as done. A fresh-context agent read-back (does the file say what was intended?) is the acceptance check, per `rules/orchestration/dispatch.md` section 5.
5. **Prune only with coverage:** before pruning any doc, audit that every load-bearing item lives elsewhere (or move it first); `.bak`-park the pruned file. Batch-remove `.bak` files only when the rework that produced them is complete.
6. **Trim line (when cutting `rules/` content):** cut only human-facing content the agent cannot act on — keybindings, one-time env setup, permission-mode advice, prose explaining the harness to itself. Keep agent-attention checklists (scan lists, severity tables, routing inventories) even when they restate known concepts: internalization ≠ reliable execution, and the checklist forces the scan.
7. **Necessity pass:** before finishing an edit batch, one pass for content that is unnecessary, not good, or repeated.

## House style for durable files

- No date-specific content in CLAUDE.md or `rules/**` (no "verified <date>", no version pins); dates belong only in disposable session reports.
- No model names or tier assumptions. The environment may run any provider behind the harness; phrase capabilities conditionally ("where the environment exposes it"). Functional `model:` frontmatter in `agents/*.md` is exempt.
- Session reports (diagnoses, audits) are one-time reads: never git-track them, never reference them from durable files.
- Durable files are self-contained: never reference sources the reader cannot be expected to have (untracked, session-scoped, or ephemeral material). The reference dangles when the source dies. State the fact itself; provenance lives outside durable files.
- Writing style: follow CLAUDE.md (US English, em-dash discipline); additionally, colon inside bold labels.
- Convention-standard terms: name harness concepts with standard engineering vocabulary (baseline, spec, acceptance criteria, dependency order) so any agent parses without extra context; flag invented terms.
- Fact-check before canonizing: verify claims against the live system before writing them into a durable file; harvested batches get an adversarial verification pass.
- Format-audit calibration: a single atomic sentence is exempt from blank-line splitting however long it runs; bold-lead-in principle bullets are a false-positive class, never split them. The format spec itself lives in CLAUDE.md's Doc structure section and is inlined in the audit command; do not restate it here.

## Lesson write-back

- After any pitfall (wrong assumption, correction, rejected proposal): write it to memory in the same session — one fact per file, matching the existing memory frontmatter (`name`, `description`, `metadata.type`; body with **Why:** + **How to apply:**).
- Rejected proposals matter most; they stop re-proposing.
- Memories are living docs: update the body when the state changes; never leave a stale correction standing.
- Update the `MEMORY.md` index.
- Lessons start as memories, not as edits to CLAUDE.md or rules/; promote into the owning rules file only when stable (next section).

## Promotion and condensation

- A lesson held across 3+ sessions + reading as a stable rule: propose promoting into the owning rules file (ask-first). A standing convention or rejected tool call: promote same session.
- 3+ memories on one theme: merge into one, delete the rest, fix index links.
- `MEMORY.md` beyond ~30 lines: condense lowest-value first.

## Component authoring (skills, commands, agents)

- **Persona:** agents get a terse persona (1–3 sentences: role, specialty, responsibility) placed before the dispatch block. Commands and skills get no persona: their body is one message in an already-framed conversation, while an agent body is the whole system prompt.
- **Headings:** no H1 in agents — the frontmatter name already provides it, and a repeated H1 is always-loaded zero-information. Skills and commands may use an H1 when it is a genuine title carrying elaboration beyond the bare name.
- **Frontmatter:** name, description-with-trigger, tools, origin (origin last); add `part-of` for multi-agent families. Quote the description with `""` only when it contains a colon.
- **Description = the routing surface:** posture + trigger + what it returns; the router reads name and description only. A `## When to invoke` body section is an anti-pattern — relocate its content into the description, never drop it.
- **Findings contract:** `- **[SEVERITY]** [file:line]: [issue] — [fix]` on the house scale (CRITICAL/HIGH/MEDIUM/LOW); per-agent native-scale mappings live in `/review-pr`.
- **Pre-existing components:** change only when an effectiveness case justifies it. Description re-tailoring is justified (it is routing); cosmetic trims are not.
- **Multi-exemplar:** base formats on best practice across exemplars, never on one target.
- **Generic args:** never hardcode folder names in commands.
- **Adoption mechanics:** strip `disable-model-invocation: true` on adopted skills meant to stay auto-invokable; strip self-run git mutations — the never-commit policy binds components too; tag `origin:` as `custom` (hand-built here), the source name (ported-from: plugins by plugin name, repos by repo name), or `A + B` (two-source merge).
- **Audit-command self-containment:** audit and check commands inline their full spec, never repoint to another file — the referenced file may itself be the audit target, and the command may run against arbitrary directories.
- **Progressive-disclosure artifacts:** per-session artifacts get durable text holding only trigger + template; the template lives in a command body, which loads on invocation at zero always-loaded cost.

## Extraction and curation

- **Extraction pipeline:** read-and-justify → extract verbatim → remove-bad → enhance-on-surviving → tailor to the standard format → batch audit vs sources → main-context audit → double final-audit (main + subagent in parallel) → commit. Extraction is not a rewrite; relocate useful content, never drop it silently. Apply the same extract-and-merge whenever duplicated or overlapping content exists across the inventory.
- **Keep/drop verdicts** are reasoned by purpose and workflow fit, never by invocation count — usage frequency is supporting evidence only. Every keep/drop/adoption verdict is user-gated. A later explicit user decision supersedes an earlier precedent.
- **Overlap = merge, never accumulate.** No knowledge-database components: thin prompts, thick artifacts, thin skills. A skill needing external setup beyond invoke-and-use gets removed and its references updated.
- **Entry-point commands are proposed, never self-invoked** (the harness-audit class); workflow components auto-invoke.

## Audit execution

- **Flag-and-fix:** defects found mid-fix beyond the original audit get flagged and fixed too.
- **Reason independently:** audit every file against the calibration points; do not only fix what was flagged.
- **Verify built-ins via the live list:** filesystem recon cannot verify built-in skills; check the session's available-skills list before claiming stale or missing.

## Size budget

Any single rules file beyond ~8 KB, or the unscoped (always-loaded) set beyond ~40 KB total, triggers a trim-or-scope proposal with measured sizes. Measure only unscoped files (`wc -c rules/common/*.md rules/orchestration/*.md`); `paths:`-scoped files do not count. Every unscoped KB is paid every session forever.
