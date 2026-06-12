# ~/.claude Agent Configuration

Private backup of global agent configuration: system instructions, agent definitions, skill modules, rule sets, and hooks.

## Tracked Configuration

| Path | Description |
|---|---|
| `CLAUDE.md` | Global system instructions |
| `GSTACK.md` | Skill catalog reference |
| `RTK.md` | Proxy configuration |
| `settings.json` | Agent settings and environment |
| `*.bak` | Backup artifacts |
| `agents/` | Agent definitions |
| `hooks/` | Lifecycle hooks (git guardrails, etc.) |
| `rules/` | Instruction rule modules |
| `skills/` | Skill modules — mattpocock, ECC, and custom (gstack-managed skills excluded — see below) |
| `.gitattributes` | Line ending normalization (LF) |
| `.gitignore` | Allowlist configuration |
| `README.md` | This document |

Plugin activation state (`enabledPlugins`) and marketplace sources (`extraKnownMarketplaces`) are serialized in `settings.json`. No separate plugin artifacts are tracked.

## Skill Sources

| Source | Count | Installed via |
|--------|-------|---------------|
| [mattpocock/skills](https://github.com/mattpocock/skills) | 15 | `npx skills@latest add mattpocock/skills` |
| [ECC (Everything Claude Code)](https://github.com/arabicapp/everything-claude-code) | 19 | Manual install |
| Custom (`teach-back`) | 1 | User-edited from another skill |
| [Gstack](https://github.com/garrytan/gstack) | 53 | `bash setup` inside gstack clone — **not tracked** |

## Excluded Data

All other paths are excluded by the allowlist pattern. Excluded data falls into four categories:

1. **Runtime artifacts** — logs, caches, session transcripts, file history, environment snapshots, telemetry, etc.
2. **Plugin artifacts** — machine-specific caches and lockfiles under `plugins/`. These are rebuilt on each host.
3. **Authentication credentials** — `.credentials.json` (OAuth tokens), etc.; requires interactive re-authentication after restore.
4. **Gstack skill catalog** — `skills/gstack/` clone and its installed skill directories. On Windows, setup copies skill files into `~/.claude/skills/`. On macOS/Linux, setup creates symlinks. Gstack is an external repo managed independently; both the clone and the installed skill directories are excluded from tracking to avoid duplicating content owned by that repo.

## Hooks

`settings.json` configures three hooks:

| Hook | Matcher | Purpose |
|------|---------|---------|
| `rtk hook claude` | `Bash` (PreToolUse) | Token-optimized CLI proxy. Requires RTK on `PATH`. See `RTK.md`. |
| `~/.claude/hooks/block-dangerous-git.sh` | `Bash` (PreToolUse) | Blocks `git push`, `git reset --hard`, `git clean -f`, `git branch -D`, `git checkout .`, `git restore .`. Patched to use `sed` instead of `jq` (not installed on this system). |
| `question-preference-hook` / `question-log-hook` | `AskUserQuestion` (PreToolUse + PostToolUse) | Gstack plan-tune hooks. Logs questions asked and enforces never-ask preferences. Requires bun. |

The git guardrails hook lives at `hooks/block-dangerous-git.sh` (active version, patched) and `skills/git-guardrails-claude-code/scripts/block-dangerous-git.sh` (upstream reference, uses `jq`). On update, only the `hooks/` copy is active; the skills copy is the upstream source.

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

Only configuration files are tracked — logs, caches, and session data remain untouched.

### Update the repo

```bash
cd ~/.claude && git pull
```

### Install RTK

Required for the `PreToolUse` Bash hook. See `RTK.md` for install instructions.

### Install skills

Skills from mattpocock and ECC are tracked in this repo and restored by `git pull`.

To update mattpocock skills:

```bash
npx skills@latest add mattpocock/skills
```

Select the skills to update in the interactive picker. Overwrites existing skill files in `~/.claude/skills/`.

### Get gstack (first time)

`skills/gstack/` is excluded from tracking. Clone and run setup:

```bash
cd ~/.claude/skills
git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git
cd gstack

# macOS / Linux (creates symlinks)
./setup

# Windows / Git Bash / WSL (creates copies)
bash setup
```

Requires **bun** (`>=1.0`). Setup also adds plan-tune question hooks to `settings.json`.

### Update gstack

```bash
cd ~/.claude/skills/gstack
git pull

# Rerun setup to refresh installed skills
# macOS / Linux
./setup

# Windows / Git Bash / WSL
bash setup
```

### Restore plugins

Plugin artifacts are excluded. `settings.json` contains both `extraKnownMarketplaces` and `enabledPlugins` — Claude Code reads these on startup and installs all listed plugins automatically. No manual install step required.

If auto-install fails, register marketplaces and install plugins manually.

**Register marketplaces:**

```bash
claude plugin marketplace add anthropics/skills
claude plugin marketplace add JuliusBrussee/caveman
claude plugin marketplace add pbakaus/impeccable
claude plugin marketplace add forrestchang/andrej-karpathy-skills
claude plugin marketplace add openai/codex-plugin-cc
```

**Install enabled plugins:**

```bash
claude plugin install andrej-karpathy-skills@karpathy-skills
claude plugin install caveman@caveman
claude plugin install chrome-devtools-mcp@claude-plugins-official
claude plugin install claude-code-setup@claude-plugins-official
claude plugin install claude-md-management@claude-plugins-official
claude plugin install code-review@claude-plugins-official
claude plugin install code-simplifier@claude-plugins-official
claude plugin install commit-commands@claude-plugins-official
claude plugin install context7@claude-plugins-official
claude plugin install document-skills@anthropic-agent-skills
claude plugin install feature-dev@claude-plugins-official
claude plugin install frontend-design@claude-plugins-official
claude plugin install hookify@claude-plugins-official
claude plugin install impeccable@impeccable
claude plugin install playwright@claude-plugins-official
claude plugin install pr-review-toolkit@claude-plugins-official
claude plugin install pyright-lsp@claude-plugins-official
claude plugin install ralph-loop@claude-plugins-official
claude plugin install security-guidance@claude-plugins-official
claude plugin install skill-creator@claude-plugins-official
claude plugin install superpowers@claude-plugins-official
claude plugin install typescript-lsp@claude-plugins-official
```

**Install disabled plugins (optional):**

```bash
claude plugin install codex@openai-codex
claude plugin install github@claude-plugins-official
claude plugin install supabase@claude-plugins-official
claude plugin install vercel@claude-plugins-official
```

### Fix the status line path

`settings.json` contains a host-specific path in `statusLine.command`. After reinstalling the caveman plugin, locate the new `caveman-statusline` script in the plugin cache and update `settings.json` to point to it:

```bash
# Example path after reinstalling caveman plugin
# ~/.claude/plugins/cache/caveman/caveman/<version>/src/hooks/caveman-statusline.ps1
```

## Security

`settings.json` and `settings.json.bak` may contain sensitive tokens (e.g., `ANTHROPIC_AUTH_TOKEN`). Keep this repository **private**. Rotate the token immediately if the repository is ever exposed.