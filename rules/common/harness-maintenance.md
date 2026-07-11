# Harness Maintenance

How to update `~/.claude` itself (CLAUDE.md, rules/, settings, hooks, skills) without breaking it. Applies to every model tier.

## Ownership map (one home per topic)

| Topic | Lives in |
|---|---|
| Universal working rules, portable to any agent | `CLAUDE.md` |
| Delegation mechanics: what to dispatch, escalation levers, report contract | `rules/orchestration/dispatch.md` |
| Decision thresholds: escalate, done, ask, switch-path, quality floor | `rules/common/judgment-rubrics.md` |
| Fill-in dispatch prompts | `rules/orchestration/dispatch-templates.md` |
| This protocol | `rules/common/harness-maintenance.md` |
| Session-learned facts and corrections | memory dir (`projects/.../memory/`) |

New content goes into the one file that owns its topic; other files may point to it, never restate it. Exception, do not "fix" it: `CLAUDE.md` intentionally overlaps with `rules/` (Git, Security, Code Style, Workflow) because the user copies CLAUDE.md alone to other agents (Codex, Copilot) that never see `rules/`. Deduplicating CLAUDE.md against rules/ has been proposed and rejected; do not propose it again.

## Change tiers

**Self-serve (do it, report after):**
- Add or update a memory entry and its `MEMORY.md` index line
- Fix an objectively dead reference (a name or path that no longer resolves: file moved, tool renamed) when the fix is name-only and changes no behavior or routing; backup first, show the diff. A stale routing or policy rule (e.g. the escalation rules in `rules/orchestration/dispatch.md`) is a semantic change: ask first

**Ask the user first:**
- Any semantic change to `CLAUDE.md`, `rules/**`, `settings.json`, or `hooks/`
- Adding, removing, or re-scoping `paths:` frontmatter globs
- Enabling/disabling plugins, skills, or MCP connectors
- Deleting any file, including stale-looking backups

**Never:**
- Wholesale rewrite of a working file; edit surgically
- `git commit` / `git push` (output commands for the user; see CLAUDE.md Git rules)
- Touching credentials or tokens in settings files

## Edit protocol (when a change is authorized)

1. **Backup:** copy the file next to itself before editing.
   - Append `.bak` after the full filename and extension (e.g. `foo.md.bak`), never `.bak.md`; a `.md` backup inside auto-loaded extension directories (`agents/`, `commands/`, `hooks/`, `rules/`, `skills/`, etc.) would be treated as a live module.
   - Bulk changes: copy the whole tree to `rules.backup-<date>/` at the repo root.
   - Skip for small edits (typo, grammar, few lines added, content refined) — git already stores every committed state.
   - Keep for medium or large changes, restructures, or full rewrites.
   - Backup files are gitignored; they can stay in your working tree but must never be committed.
2. **Frontmatter decision:** every new `rules/**` file states its loading cost. Scoped (`paths:` globs) when it applies to a file type; unscoped only if it must apply to every session, and then say why in the PR/summary.
3. **Verify loading behavior when scoping changed** with a headless probe, for example:
   - `claude -p 'No tools. Is a rule titled "<TITLE>" in your context? yes/no'`
   - A second probe that reads a matching file first. Expected results: unscoped rules yes; scoped rules no before the read, yes after.
4. **Show the diff:** `git diff <file>` goes to the user before the change counts as done. A fresh-context agent read-back (does the file say what was intended?) is the acceptance check, per `rules/orchestration/dispatch.md` section 5.

## House style for durable files

Standing user conventions; violating them again costs trust:

- No date-specific content in CLAUDE.md or `rules/**` (no "verified <date>", no version pins). Dates belong only in disposable session reports.
- No model names or tier assumptions. The environment may run any provider behind the harness, with every alias resolving to the same underlying model; phrase capabilities conditionally ("where the environment exposes it"). Functional `model:` frontmatter in `agents/*.md` is exempt.
- Session reports (diagnoses, letters, audits) are one-time reads: never git-track them, never reference them from durable files.
- Writing style: colon inside bold labels (`**Term:** definition`), em-dash minimized (headings may keep it), US English.

## Lesson write-back

After any pitfall (wrong assumption, user correction, harness misbehavior, rejected proposal): write it to memory in the same session, one fact per file, matching the frontmatter shape of the existing files in the memory dir (`name`, `description`, `metadata.type`; body with **Why:** and **How to apply:**). Rejected proposals matter most; they stop future sessions from re-proposing them. Update the `MEMORY.md` index line. Lessons start as memories, not as edits to CLAUDE.md or rules/. But the memory dir is per-project and untracked: a buffer, not the archive. Anything that must survive machine moves or apply beyond one project gets promoted into the owning rules file per the next section.

## Promotion and condensation

- A lesson that has held across 3+ sessions and reads as a stable rule: propose promoting it into the owning rules file (ask-first tier). A convention the user states as standing (or a rejected tool call) is promoted the same session, not after 3.
- 3+ memories on one theme: merge into one file, delete the rest, fix index links.
- `MEMORY.md` beyond ~30 lines: condense lowest-value entries first.
- Size budget: any single rules file beyond ~8 KB, or the unscoped (always-loaded) set beyond ~40 KB total, triggers a trim-or-scope proposal to the user with measured sizes. Measure only unscoped files (`wc -c rules/common/*.md rules/orchestration/*.md`); `paths:`-scoped files do not count. Every unscoped KB is paid in every session forever.