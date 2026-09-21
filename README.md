# ~/.claude Agent Configuration

Private backup of global agent configuration: system instructions, agent definitions, skill modules, rule sets, and hooks.

## Tracked Configuration

| Path | Description |
|---|---|
| `CLAUDE.md` | Global system instructions |
| `RTK.md` | Proxy configuration |
| `settings.json` | Agent settings and environment |
| `agents/` | Agent definitions (9) |
| `hooks/` | Lifecycle hooks (git/gh mutation + secret-path guards) |
| `rules/` | Instruction rule modules |
| `.claude/rules/` | Harness-only rule modules (project-scope: load only when working in this repo) |
| `skills/` | Skill modules, 53 (see Skill Sources) |
| `.gitattributes` | Line ending normalization (LF) |
| `.gitignore` | Allowlist configuration |
| `README.md` | This document |

Plugin activation state (`enabledPlugins`) and marketplace sources (`extraKnownMarketplaces`) are serialized in `settings.json`. No separate plugin artifacts are tracked (`plugins/` is a rebuildable multi-GB cache).

## Skill Sources

Every skill in `skills/` and every agent in `agents/` is an owned, tracked file, edited here directly. The sources below record provenance; skills and agents are not updated from upstream. Compound tags mark components merged from two or more sources.

| Source | Count | Components |
|--------|-------|------------|
| [mattpocock/skills](https://github.com/mattpocock/skills) | 14 skills + 1 agent | codebase-design, domain-modeling, grill-me, grill-with-docs, grilling, handoff, improve-codebase-architecture, prototype, research, resolving-merge-conflicts, teach, to-questionnaire, wizard, writing-for-agents; agent `spec-reviewer` |
| [taste-skill](https://github.com/Leonxlnx/taste-skill) | 2 | design-taste-frontend, redesign-existing-projects |
| [ECC](https://github.com/affaan-m/ECC) | 10 skills + 1 agent | agent-architecture-audit, agent-introspection-debugging, database-migrations, e2e-testing, search-first, frontend-a11y, make-interfaces-feel-better, motion-ui, loop-design-check, inherit-legacy-style; agent `database-reviewer` |
| [gstack](https://github.com/garrytan/gstack) | 11 skills + 2 agents | ship, qa, diagram, deploy-watch, land-and-deploy, document-release, document-generate, design-build, design-consultation, design-variants, plan-review (+ its `lenses/`); agents `plan-reviewer`, `security-auditor` (upstream-orphaned: gstack no longer ships agents, kept deliberately) |
| superpowers (plugin, extracted) | 2 | receiving-code-review, verification-before-completion |
| [deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) | 1 | trim-session-leakage |
| Custom | 7 | bake-design, compact-pair, design-audit, open-questions, session-sync, setup-workflow, teach-back |
| Compound | 6 skills + 5 agents | skills: plan-from-design (custom + mattpocock + superpowers), build-brief (custom + mattpocock), build-feature (custom + superpowers), tdd (mattpocock + superpowers), diagnosing-bugs (mattpocock + superpowers), code-review (pr-review-toolkit + mattpocock + code-review plugin); agents: code-reviewer (pr-review-toolkit + mattpocock), silent-failure-hunter (ECC + pr-review-toolkit), pr-test-analyzer, type-design-analyzer (both pr-review-toolkit), code-simplifier (pr-review-toolkit + code-simplifier plugin) |

Not updated from upstream: upstream changes are adoption candidates, gated per the extraction philosophy in `.claude/rules/harness-maintenance.md`.

## Excluded Data

All other paths are excluded by the allowlist pattern. Excluded data falls into five categories:

1. **Runtime artifacts** — logs, caches, session transcripts, file history, environment snapshots, telemetry, etc.
2. **Plugin artifacts** — machine-specific caches and lockfiles under `plugins/`. These are rebuilt on each host.
3. **Authentication credentials** — `.credentials.json` (OAuth tokens), etc.; requires interactive re-authentication after restore.
4. **Backup files** — `**/*.bak` is git-ignored so in-place backups made during harness edits (per `.claude/rules/harness-maintenance.md`) are never tracked.
5. **Scratch working docs** — `.scratch/` holds one-time session working files; ignored by the allowlist's catch-all and never committed, and anything durable in them is canonized into the tracked files.

## Hooks

`settings.json` wires three PreToolUse `Bash` hooks. Both scripts are tracked (re-clone restores them); their header comments are the source of truth for the exact patterns.

| Hook | Purpose |
|------|---------|
| `rtk hook claude` | Token-optimized CLI proxy. Requires RTK on `PATH`; see `RTK.md`. |
| `~/.claude/hooks/block-git-gh-mutations.sh` | Enforces CLAUDE.md's Git section mechanically: blocks `git` commit/push and destructive ops plus `gh` writes, so all mutations stay user-run. |
| `~/.claude/hooks/block-secret-paths.sh` | Closes the Bash bypass of the Read-deny: blocks commands touching `.env`, `~/.ssh`, `~/.aws`, `~/.config/gh` (see Security below). |

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

The `PreToolUse` Bash hook requires RTK on `PATH`; usage and the command set live in `RTK.md`.

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
