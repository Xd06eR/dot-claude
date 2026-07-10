# ~/.claude Agent Configuration

Private backup of global agent configuration: system instructions, agent definitions, skill modules, rule sets, and hooks.

## Tracked Configuration

| Path | Description |
|---|---|
| `CLAUDE.md` | Global system instructions |
| `TOOLKIT.md` | Skill, agent, and tool catalog |
| `RTK.md` | Proxy configuration |
| `settings.json` | Agent settings and environment |
| `*.bak` | Backup artifacts |
| `agents/` | Agent definitions |
| `commands/` | Custom slash commands (e.g., `harness-audit`) |
| `hooks/` | Lifecycle hooks (git guardrails, etc.) |
| `rules/` | Instruction rule modules |
| `skills/` | Skill modules — mattpocock, taste-skill, ECC, find-skills, custom, and 13 gstack-origin skills rewritten as owned (see Skill Sources) |
| `.gitattributes` | Line ending normalization (LF) |
| `.gitignore` | Allowlist configuration |
| `README.md` | This document |

Plugin activation state (`enabledPlugins`) and marketplace sources (`extraKnownMarketplaces`) are serialized in `settings.json`. No separate plugin artifacts are tracked.

## Skill Sources

| Source | Count | Installed via |
|--------|-------|---------------|
| [mattpocock/skills](https://github.com/mattpocock/skills) | 14 | `npx skills@latest add mattpocock/skills` |
| [taste-skill](https://github.com/Leonxlnx/taste-skill) | 2 | `npx skills add https://github.com/Leonxlnx/taste-skill` |
| [ECC (Everything Claude Code)](https://github.com/affaan-m/ECC) | 17 | Manual install (14 `origin: ECC` + 3 `origin: community`) |
| [vercel-labs/skills](https://github.com/vercel-labs/skills) | 1 | `npx skills add vercel-labs/skills` (only skill: `find-skills`; discover more at [skills.sh](https://www.skills.sh/)) |
| Custom (`teach-back`) | 1 | User-edited from another skill |
| Gstack-origin, now owned | 13 skills + 2 agents | Rewritten gstack-free from [gstack](https://github.com/garrytan/gstack) originals; tracked like any other skill. Skills: ship, spec, qa, diagram, make-pdf, deploy-watch, land-and-deploy, document-release, document-generate, design-html, design-consultation, design-variants, plan-review (+ its `lenses/`). Agents: plan-reviewer, security-auditor. |

## Excluded Data

All other paths are excluded by the allowlist pattern. Excluded data falls into four categories:

1. **Runtime artifacts** — logs, caches, session transcripts, file history, environment snapshots, telemetry, etc.
2. **Plugin artifacts** — machine-specific caches and lockfiles under `plugins/`. These are rebuilt on each host.
3. **Authentication credentials** — `.credentials.json` (OAuth tokens), etc.; requires interactive re-authentication after restore.
4. **Gstack clone guard** — `skills/gstack/` stays in `.gitignore` as a guard: the gstack clone was removed after the keeper skills were rewritten as owned, and the ignore line prevents a future clone from being tracked by accident. The rewritten skills themselves are tracked normally.

## Hooks

`settings.json` configures two hooks:

| Hook | Matcher | Purpose |
|------|---------|---------|
| `rtk hook claude` | `Bash` (PreToolUse) | Token-optimized CLI proxy. Requires RTK on `PATH`. See `RTK.md`. |
| `~/.claude/hooks/block-dangerous-git.sh` | `Bash` (PreToolUse) | Blocks `git push`, `git reset --hard`, `git clean -f`, `git branch -D`, `git checkout .`, `git restore .`. Patched to use `sed` instead of `jq` (not installed on this system). |

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

Skills from mattpocock, taste-skill, and ECC are tracked in this repo and restored by `git pull`.

To update mattpocock skills:

```bash
npx skills@latest add mattpocock/skills
```

Select the skills to update in the interactive picker. Overwrites existing skill files in `~/.claude/skills/`.

### Gstack (historical)

Gstack is no longer installed. The 18 skills worth keeping were rewritten gstack-free and are tracked in this repo (see Skill Sources); 6 of those were further converted into the plan-review architecture (`skills/plan-review/` + `agents/plan-reviewer.md` + `agents/security-auditor.md`). Do not re-clone gstack to update them — they are owned and edited here directly. `skills/gstack/` remains git-ignored as a guard.

### Restore plugins

Plugin artifacts are excluded. `settings.json` contains both `extraKnownMarketplaces` and `enabledPlugins` — Claude Code reads these on startup and installs all listed plugins automatically. No manual install step required.

If auto-install fails, register marketplaces and install plugins manually.

**Register marketplaces:**

```bash
claude plugin marketplace add anthropics/claude-plugins-official
claude plugin marketplace add anthropics/skills
claude plugin marketplace add JuliusBrussee/caveman
claude plugin marketplace add pbakaus/impeccable
claude plugin marketplace add forrestchang/andrej-karpathy-skills
claude plugin marketplace add openai/codex-plugin-cc
claude plugin marketplace add DietrichGebert/ponytail
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
claude plugin install context7@claude-plugins-official
claude plugin install document-skills@anthropic-agent-skills
claude plugin install feature-dev@claude-plugins-official
claude plugin install frontend-design@claude-plugins-official
claude plugin install playwright@claude-plugins-official
claude plugin install ponytail@ponytail
claude plugin install pr-review-toolkit@claude-plugins-official
claude plugin install pyright-lsp@claude-plugins-official
claude plugin install security-guidance@claude-plugins-official
claude plugin install skill-creator@claude-plugins-official
claude plugin install superpowers@claude-plugins-official
claude plugin install typescript-lsp@claude-plugins-official
```

**Install disabled plugins (optional):**

```bash
claude plugin install codex@openai-codex
# commit-commands: disabled — its skills run `git commit`/`git push` directly,
# against the never-run-git rule in CLAUDE.md.
claude plugin install commit-commands@claude-plugins-official
claude plugin install github@claude-plugins-official
# hookify: disabled — hooks call bare `python3`, which does not exist on Windows
# Git Bash (only `python` / `py`). Errors on every PreToolUse / PostToolUse /
# UserPromptSubmit / Stop. No `.claude/hookify.*.local.md` rule files configured,
# so the plugin does nothing useful here. Re-enable + add a `python3` symlink if
# custom hookify rules are ever wanted.
claude plugin install hookify@claude-plugins-official
claude plugin install impeccable@impeccable
# ralph-loop: disabled — zero loops ever run, but its SessionStart hook injected
# context every session (pure overhead). Re-enable only for a deliberate
# autonomous-loop workflow, and ask first per CLAUDE.md.
claude plugin install ralph-loop@claude-plugins-official
claude plugin install supabase@claude-plugins-official
claude plugin install vercel@claude-plugins-official
```

### Fix the status line path

`settings.json` contains a host-specific `statusLine.command` that runs both plugin statusline scripts in a single PowerShell `-Command` invocation — caveman (`[CAVEMAN]` badge, orange) then ponytail (`[PONYTAIL]` badge, teal), separated by a space. The single `-Command` form keeps the `;` separator inside PowerShell so it is independent of the shell Claude Code spawns. After reinstalling either plugin, locate the new statusline script in its plugin cache and update `settings.json`:

```bash
# Example paths after reinstalling plugins
# ~/.claude/plugins/cache/caveman/caveman/<version>/src/hooks/caveman-statusline.ps1
# ~/.claude/plugins/cache/ponytail/ponytail/<version>/hooks/ponytail-statusline.ps1
```

## Security

`settings.json` and `settings.json.bak` may contain sensitive tokens (e.g., `ANTHROPIC_AUTH_TOKEN`). Keep this repository **private**. Rotate the token immediately if the repository is ever exposed.