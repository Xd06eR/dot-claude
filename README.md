# ~/.claude Agent Configuration

Private backup of global agent configuration: system instructions, agent definitions, skill modules, rule sets, and hooks.

## Tracked Configuration

| Path | Description |
|---|---|
| `.claude/rules/` | Harness-only rule modules (project-scope: load only when working in this repo) |
| `agents/` | Agent definitions (9) |
| `hooks/` | Lifecycle hooks (git/gh mutation + secret-path guards) |
| `rules/` | Instruction rule modules |
| `skills/` | Skill modules, 54 (see Skill Sources) |
| `.gitattributes` | Line ending normalization (LF) |
| `.gitignore` | Allowlist configuration |
| `CANON.md` | Consolidated harness rulings |
| `CLAUDE.md` | Global system instructions |
| `README.md` | This document |
| `RTK.md` | Proxy configuration |
| `settings.json` | Agent settings and environment |

Plugin activation state (`enabledPlugins`) is serialized in `settings.json`. No separate plugin artifacts are tracked (`plugins/` is a rebuildable multi-GB cache).

## The Workflow

CLAUDE.md's Engineering principles section carries the foundation principles into every session; this section is the human's map.

### The spine

The pipeline in order: `setup-workflow` once per project · `session-sync` at session start and end · then per feature: grill-me / grill-with-docs → bake-design → plan-from-design → (plan-review, flexible) → build-brief → build-feature → (code-review, flexible) → qa → ship → land-and-deploy → document-release. Each step's trigger and mechanics live in its skill's description and body.

**Layers are optional; the phase folders come with the workflow:** `OPEN-QUESTIONS.md`, `CONTEXT.md`, `TODO.md` (default on), `PROGRESS-LOG.md`, `docs/adr/` are adopted per project as needed; `docs/design/`, `docs/plan/`, `docs/build/` are the phase artifacts themselves, filled as work reaches them.

### The four paths

Two axes, four paths. The docs axis picks the opening: `grill-me` keeps rulings in the conversation (quick work, nothing to maintain), `grill-with-docs` captures them as they are made (a project worth maintaining). The spine axis picks how much of the spine runs: a settled design that fits one context builds directly via `build-feature` with no feature named (it steps back to `plan-from-design` past one context); anything bigger, or work that needs the full cycle to stay maintainable, runs the spine end to end. Planning always consumes a baked design, so a no-docs route bakes from the conversation first.

| Opening | Build directly | Plan first |
|---|---|---|
| `grill-me` | toy / quick work | quick work, planned |
| `grill-with-docs` | a small feature in a maintained project | the full cycle |

## Skill Sources

Every skill in `skills/` and every agent in `agents/` is an owned, tracked file, edited here directly. The sources below record provenance. A `(+ source)` note marks content merged in from another source.

| Source | Count | Components |
|--------|-------|------------|
| [mattpocock/skills](https://github.com/mattpocock/skills) | 16 skills + 1 agent | codebase-design, domain-modeling, grill-me, grill-with-docs, grilling, handoff, improve-codebase-architecture, prototype, research, teach, to-questionnaire, wayfinder, wizard, tdd (+ superpowers), diagnosing-bugs (+ superpowers + gstack + ECC), writing-for-agents (+ superpowers + deepseek-harness + claude-plugins-official); agent `spec-reviewer` |
| [taste-skill](https://github.com/Leonxlnx/taste-skill) | 2 | design-taste-frontend (+ impeccable), redesign-existing-projects (+ impeccable) |
| [ECC](https://github.com/affaan-m/ECC) | 10 skills + 2 agents | agent-architecture-audit, agent-introspection-debugging, database-migrations, e2e-testing, search-first, frontend-a11y (+ impeccable), make-interfaces-feel-better (+ impeccable + deepseek-harness), motion-ui (+ impeccable), loop-design-check (+ gstack), inherit-legacy-style; agents `database-reviewer`, `silent-failure-hunter` (+ pr-review-toolkit) |
| [gstack](https://github.com/garrytan/gstack) | 10 skills + 2 agents | ship, qa, diagram, land-and-deploy, document-release, document-generate, design-build (+ impeccable), design-consultation (+ impeccable), design-variants (+ impeccable), plan-review (+ impeccable, + its `lenses/`); agents `plan-reviewer`, `security-auditor` (no upstream: gstack ships skills only, so these are maintained locally) |
| [superpowers](https://github.com/obra/superpowers) | 2 | receiving-code-review, verification-before-completion |
| [claude-plugins-official](https://github.com/anthropics/claude-plugins-official) | 1 skill + 4 agents | code-review (pr-review-toolkit + mattpocock + code-review plugin + gstack); agents `code-reviewer` (pr-review-toolkit + mattpocock), `pr-test-analyzer` (pr-review-toolkit), `type-design-analyzer` (pr-review-toolkit), `code-simplifier` (pr-review-toolkit + code-simplifier plugin + deepseek-harness) |
| [deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) | 1 | trim-session-leakage |
| [reverse-skill](https://github.com/zhaoxuya520/reverse-skill) | 2 | api-security, llm-security |
| Custom | 10 | bake-design, compact-pair, design-audit, open-questions, session-sync, setup-workflow, teach-back, plan-from-design (+ mattpocock + superpowers), build-brief (+ mattpocock), build-feature (+ mattpocock + superpowers) |

Not updated from upstream: upstream changes are adoption candidates, gated per the extraction philosophy in CANON.md.

## Excluded Data

All other paths are excluded by the allowlist pattern. Excluded data falls into four categories:

1. **Runtime artifacts** — logs, caches, session transcripts, file history, environment snapshots, telemetry, etc.
2. **Plugin artifacts** — machine-specific caches and lockfiles under `plugins/`. These are rebuilt on each host.
3. **Authentication credentials** — `.credentials.json` (OAuth tokens), etc.; requires interactive re-authentication after restore.
4. **Scratch working docs** — `.scratch/` holds one-time session working files; ignored by the allowlist's catch-all and never committed, and anything durable in them is canonized into the tracked files.

## Hooks

`settings.json` wires three PreToolUse `Bash` hooks. Both scripts are tracked (re-clone restores them); their header comments are the source of truth for the exact patterns.

| Hook | Purpose |
|------|---------|
| `rtk hook claude` | Token-optimized CLI proxy. Requires RTK on `PATH`; see `RTK.md`. |
| `~/.claude/hooks/block-git-gh-mutations.sh` | Enforces CLAUDE.md's Git section mechanically: blocks `git` commit/push and destructive ops plus `gh` writes, so all mutations stay user-run. |
| `~/.claude/hooks/block-secret-paths.sh` | Closes the Bash bypass of the Read-deny: blocks commands touching `.env`, `~/.ssh`, `~/.aws`, `~/.config/gh`, `.credentials` (see Security below). |

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

Plugin artifacts are excluded. `settings.json` contains `enabledPlugins`: Claude Code reads it on startup and installs the enabled plugins automatically. No manual install step required.

If auto-install fails, the commands below mirror the enabled set in `settings.json` (`claude-plugins-official` is built in):

```bash
claude plugin install claude-md-management@claude-plugins-official
claude plugin install pyright-lsp@claude-plugins-official
claude plugin install security-guidance@claude-plugins-official
claude plugin install skill-creator@claude-plugins-official
claude plugin install typescript-lsp@claude-plugins-official
```

The list skips the disabled entries: their `false` flags are tracked in `settings.json` and restore as-is.

### Restore MCP servers

User-scope MCP registrations live in `~/.claude.json`, which is per-machine and untracked. One manual command after restore:

```bash
claude mcp add --scope user --transport http context7 https://mcp.context7.com/mcp
```

Register the plain URL as shown: the official context7 plugin's `?client=claude-code-plugin` URL is auth-gated (the plugin is disabled for this reason). Verify with `claude mcp list` (expect `Connected`).

## Security & credentials

**Provider connection details (API key, base URL, model name) are local-only.** CC-Switch writes them into `settings.json` per machine; those hunks are never staged (genuine config changes are hunk-staged around them), so the tracked file carries no provider fields and a fresh clone starts clean. Keep the repo private; rotate on exposure.

**Adding a new credential:**

1. Never commit it: it lives in a gitignored file or as a local-only `settings.json` hunk that never gets staged.
2. If the agent must not read its file, block both paths: add a `Read(...)` rule to `permissions.deny`, and add a pattern to `SECRET_PATTERNS` in `hooks/block-secret-paths.sh`.
3. If it is a dangerous command (egress, install, remote access), add it to `permissions.ask`.
4. Restart Claude Code so hook edits load.

The full `allow` / `ask` / `deny` posture and the Anthropic-traffic disable flags live in `settings.json`; read it directly for the current set.
