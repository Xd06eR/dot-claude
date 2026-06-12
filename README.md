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
| `hooks/` | Lifecycle hooks |
| `rules/` | Instruction rule modules |
| `skills/` | Skill modules (all subdirectories except `gstack/`) |
| `.gitattributes` | Line ending normalization (LF) |
| `.gitignore` | Allowlist configuration |
| `README.md` | This document |

Plugin activation state (`enabledPlugins`) and marketplace sources (`extraKnownMarketplaces`) are serialized in `settings.json`. No separate plugin artifacts are tracked.

## Excluded Data

All other paths are excluded by the allowlist pattern. Excluded data falls into three categories:

1. **Runtime artifacts** — logs, caches, session transcripts, file history, environment snapshots, telemetry, etc.
2. **Plugin artifacts** — machine-specific caches and lockfiles under `plugins/`. These are rebuilt on each host.
3. **Authentication credentials** — `.credentials.json` (OAuth tokens), etc.; requires interactive re-authentication after restore.

## Restoration

### 1. Clone into `~/.claude`

**Fresh machine** (`~/.claude` does not exist):

```bash
git clone https://github.com/Xd06eR/dot-claude.git ~/.claude
```

**Existing `.claude`** (has runtime data, caches, etc.):

```bash
cd ~/.claude
git init
git remote add origin https://github.com/Xd06eR/dot-claude.git
git pull origin main
```

Because the repo only tracks configuration files, `git pull` will only touch those files. All logs, caches, and session data remain untouched.

`settings.json` configures a `PreToolUse` hook that requires RTK (`rtk`) to be installed and available on `PATH`. See `RTK.md` for install instructions.

### 2. Restore the gstack skill catalog

`skills/gstack/` is excluded. Clone and run the setup script:

```bash
cd ~/.claude/skills
git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git
cd gstack
```

Run the setup script for your platform:

```bash
# macOS / Linux
./setup

# Windows (Git Bash / WSL)
bash setup
```

Requires **bun** (`>=1.0`). The setup script copies (Windows) or symlinks (macOS/Linux) gstack skill modules into `~/.claude/skills/`.

To update the catalog later:

```bash
cd ~/.claude/skills/gstack
git pull
```

Then rerun `./setup` or `bash setup` to pick up any new skills and refresh copies.

If using gstack as a submodule (already configured), update with:

```bash
cd ~/.claude/skills/gstack && git pull
cd ~/.claude
git add skills/gstack
git commit -m "chore: update gstack submodule"
```

### 3. Restore plugins

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

### 4. Fix the status line path

`settings.json` contains a host-specific path in `statusLine.command`. After reinstalling the caveman plugin, locate the new `caveman-statusline` script in the plugin cache and update `settings.json` to point to it:

```bash
# Example path after reinstalling caveman plugin
# ~/.claude/plugins/cache/caveman/caveman/<version>/src/hooks/caveman-statusline.ps1
```

## Security

`settings.json` and `settings.json.bak` may contain sensitive tokens (e.g., `ANTHROPIC_AUTH_TOKEN`). Keep this repository **private**. Rotate the token immediately if the repository is ever exposed.
