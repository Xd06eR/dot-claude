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
2. **Frontmatter:** every new `rules/**` file states its loading cost. Scoped (`paths:`) when it applies to a file type; unscoped only if it must apply to every session, with a reason.
3. **Verify loading when scoping changes** with headless probes:
   - Context check (no tools): `claude -p 'Is a rule titled "<TITLE>" in your context? yes/no' --tools ""` — forces a pure loaded-context answer, no file reads that skew the result. Unscoped rules answer yes.
   - Load check (needs Read): a second probe WITH Read allowed that reads a matching file first, then asks. Scoped rules answer no before the read, yes after.
4. **Show the diff:** `git diff <file>` to the user before the change counts as done. A fresh-context agent read-back (does the file say what was intended?) is the acceptance check, per `rules/orchestration/dispatch.md` section 5.

## House style for durable files

- No date-specific content in CLAUDE.md or `rules/**` (no "verified <date>", no version pins); dates belong only in disposable session reports.
- No model names or tier assumptions. The environment may run any provider behind the harness; phrase capabilities conditionally ("where the environment exposes it"). Functional `model:` frontmatter in `agents/*.md` is exempt.
- Session reports (diagnoses, audits) are one-time reads: never git-track them, never reference them from durable files.
- Writing style: follow CLAUDE.md (US English, em-dash discipline); additionally, colon inside bold labels.
- Convention-standard terms: name harness concepts with standard engineering vocabulary (baseline, spec, acceptance criteria, dependency order) so any agent parses without extra context; flag invented terms.

## Lesson write-back

After any pitfall (wrong assumption, correction, rejected proposal): write it to memory in the same session — one fact per file, matching the existing memory frontmatter (`name`, `description`, `metadata.type`; body with **Why:** + **How to apply:**). Rejected proposals matter most; they stop re-proposing. Update the `MEMORY.md` index. Lessons start as memories, not as edits to CLAUDE.md or rules/; promote into the owning rules file only when stable (next section).

## Promotion and condensation

- A lesson held across 3+ sessions + reading as a stable rule: propose promoting into the owning rules file (ask-first). A standing convention or rejected tool call: promote same session.
- 3+ memories on one theme: merge into one, delete the rest, fix index links.
- `MEMORY.md` beyond ~30 lines: condense lowest-value first.

## Size budget

Any single rules file beyond ~8 KB, or the unscoped (always-loaded) set beyond ~40 KB total, triggers a trim-or-scope proposal with measured sizes. Measure only unscoped files (`wc -c rules/common/*.md rules/orchestration/*.md`); `paths:`-scoped files do not count. Every unscoped KB is paid every session forever.
