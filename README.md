# ~/.claude Agent Configuration

Private backup of global agent configuration: system instructions, agent definitions, skill modules, rule sets, and hooks.

## Tracked Configuration

| Path | Description |
|---|---|
| `CLAUDE.md` | Global system instructions |
| `RTK.md` | Proxy configuration |
| `settings.json` | Agent settings and environment |
| `agents/` | Agent definitions |
| `commands/` | Custom slash commands: `harness-audit`, `plan-from-design` (Design→Plan), `build-brief` (Plan→Build), `review-pr` + `lens-review` (Review) |
| `hooks/` | Lifecycle hooks (git guardrails, etc.) |
| `rules/` | Instruction rule modules |
| `skills/` | Skill modules (see Skill Sources) |
| `.gitattributes` | Line ending normalization (LF) |
| `.gitignore` | Allowlist configuration |
| `README.md` | This document |

Plugin activation state (`enabledPlugins`) and marketplace sources (`extraKnownMarketplaces`) are serialized in `settings.json`. No separate plugin artifacts are tracked (`plugins/` is a rebuildable multi-GB cache).

## Skill Sources

Every skill in `skills/` and every agent in `agents/` is an owned, tracked file, edited here directly. The sources below record provenance; skills and agents are not updated from upstream.

| Source | Count | Skills |
|--------|-------|--------|
| [mattpocock/skills](https://github.com/mattpocock/skills) | 9 | diagnose, grill-me, grill-with-docs, handoff, improve-codebase-architecture, prototype, tdd, teach, writing-great-skills |
| [taste-skill](https://github.com/Leonxlnx/taste-skill) | 2 | design-taste-frontend, redesign-existing-projects |
| [ECC](https://github.com/affaan-m/ECC) | 12 skills + 3 agents | agent-architecture-audit, agent-introspection-debugging, context-budget, eval-harness, database-migrations, e2e-testing, search-first, frontend-a11y, make-interfaces-feel-better, motion-ui, loop-design-check, inherit-legacy-style; agents `database-reviewer`, `react-build-resolver`, `silent-failure-hunter` |
| Custom | 1 | teach-back (user-edited derivative) |
| [gstack](https://github.com/garrytan/gstack) | 13 skills + 2 agents | ship, spec, qa, diagram, make-pdf, deploy-watch, land-and-deploy, document-release, document-generate, design-html, design-consultation, design-variants, plan-review (+ its `lenses/`); agents `plan-reviewer`, `security-auditor` |

## Excluded Data

All other paths are excluded by the allowlist pattern. Excluded data falls into five categories:

1. **Runtime artifacts** — logs, caches, session transcripts, file history, environment snapshots, telemetry, etc.
2. **Plugin artifacts** — machine-specific caches and lockfiles under `plugins/`. These are rebuilt on each host.
3. **Authentication credentials** — `.credentials.json` (OAuth tokens), etc.; requires interactive re-authentication after restore.
4. **Gstack clone guard** — `skills/gstack/` is git-ignored so a gstack clone, if one ever appears there, is never tracked. The gstack-origin skills in `skills/` are owned files; do not clone gstack to update them.
5. **Backup files** — `**/*.bak` is git-ignored so in-place backups made during harness edits (per `.claude/rules/harness-maintenance.md`) are never tracked.

## Hooks

`settings.json` configures three PreToolUse `Bash` hooks:

| Hook | Purpose |
|------|---------|
| `rtk hook claude` | Token-optimized CLI proxy. Requires RTK on `PATH`. See `RTK.md`. |
| `~/.claude/hooks/block-dangerous-git.sh` | Blocks `git push`, `git commit`, `git reset --hard`, `git clean -f`/`-fd`, `git branch -D`, `git checkout .`, `git restore .`, `push --force`. Greps the raw hook JSON (no `jq`, no `sed` extraction) so it runs on Windows Git Bash; patterns are word-anchored and whitespace-required, so near-miss substrings like `gitcommittee` or `git-commit` are not blocked; only the literal command is (prose containing the phrase still blocks — safe-side). |
| `~/.claude/hooks/block-secret-paths.sh` | Blocks any Bash command matching `\.env` or `\.ssh` (closes the bash bypass of the Read-deny; see Security below). Same raw-grep shape; `.env` is anchored so `process.env` doesn't false-positive. Extend `SECRET_PATTERNS` for new secret paths. |

The active git-guardrails hook lives at `hooks/block-dangerous-git.sh` — tracked directly, so re-clone restores it. (The install-source skill was removed; the hook is the source of truth.)

## Quick Reference

### Initialize the repo

Fresh machine (`~/.claude` does not exist):

```bash
git clone https://github.com/Xd06eR/dot-claude.git ~/.claude
```

Existing `.claude` (has runtime data, caches, etc.):

```bash
cd ~/.claude
git init
git remote add origin https://github.com/Xd06eR/dot-claude.git
git pull origin main
```

Only configuration files are tracked. Logs, caches, and session data remain untouched. Sync an existing machine with `git -C ~/.claude pull`.

### RTK

The `PreToolUse` Bash hook requires RTK on `PATH`. See `RTK.md` for install instructions.

### Restore plugins

Plugin artifacts are excluded. `settings.json` contains both `extraKnownMarketplaces` and `enabledPlugins`: Claude Code reads these on startup and installs the enabled plugins automatically. No manual install step required.

If auto-install fails, the commands below mirror the enabled set in `settings.json` (`claude-plugins-official` is built in):

```bash
claude plugin marketplace add pbakaus/impeccable
claude plugin install claude-md-management@claude-plugins-official
claude plugin install context7@claude-plugins-official
claude plugin install pyright-lsp@claude-plugins-official
claude plugin install security-guidance@claude-plugins-official
claude plugin install skill-creator@claude-plugins-official
claude plugin install typescript-lsp@claude-plugins-official
```

The list skips the disabled entries: their `false` flags are tracked in `settings.json` and restore as-is.

## Security & credentials

**Provider connection details (API key, base URL, model name) are local-only.** CC-Switch writes them into `settings.json` per machine; those hunks are never staged (genuine config changes are hunk-staged around them), so the tracked file carries no provider fields and a fresh clone starts clean. Keep the repo private; rotate on exposure.

**Adding a new credential:**

1. Never commit it: it lives in a gitignored file or as a local-only `settings.json` hunk that never gets staged.
2. If the agent must not read its file, block both paths: add a `Read(...)` rule to `permissions.deny`, and add a pattern to `SECRET_PATTERNS` in `hooks/block-secret-paths.sh` (that hook closes the bash bypass of the Read-deny).
3. If it is a dangerous command (egress, install, remote access), add it to `permissions.ask`.
4. Restart Claude Code so hook edits load.

The full `allow` / `ask` / `deny` posture and the Anthropic-traffic disable flags live in `settings.json`; read it directly for the current set.
