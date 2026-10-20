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
| `skills/` | Skill modules, 54 (see Skill Sources) |
| `.gitattributes` | Line ending normalization (LF) |
| `.gitignore` | Allowlist configuration |
| `README.md` | This document |

Plugin activation state (`enabledPlugins`) and marketplace sources (`extraKnownMarketplaces`) are serialized in `settings.json`. No separate plugin artifacts are tracked (`plugins/` is a rebuildable multi-GB cache).

## The Workflow

CLAUDE.md's Workflow section carries the phase principles every session; this section is the human's map: the spine (the pipeline's gates in order) and the four paths (how much of the spine runs). Skill Sources below enumerates the inventory by origin.

### The spine

The pipeline in order: `setup-workflow` once per project · `session-sync` at session start and end · then per feature: grill-me / grill-with-docs → bake-design → plan-from-design → (plan-review, flexible) → build-brief → build-feature → (code-review, flexible) → qa → ship → land-and-deploy → document-release. Each step's trigger and mechanics live in its skill's description and body.

Free principle: the phases work without the artifacts. `OPEN-QUESTIONS.md`, `CONTEXT.md`, `TODO.md`, `PROGRESS-LOG.md`, `docs/design/`, `docs/adr/`, `docs/plan/`, `docs/build/` are adopted per project as needed; nothing forces them.

### The four paths

Two axes, four routes. The docs axis picks the opening: `grill-me` keeps rulings in the conversation (quick work, nothing to maintain), `grill-with-docs` captures them as they are made (a project worth maintaining). The route axis picks how much of the spine runs: a settled design that fits one context builds directly via `build-feature` with no feature named (it steps back to `plan-from-design` past one context); anything bigger, or any work meant to stay maintainable, runs the spine end to end. Planning always consumes a baked design, so a no-docs route bakes from the conversation first.

| Opening | Build directly | Plan first |
|---|---|---|
| `grill-me` (no docs) | toy / quick work | quick work, planned (a bake from the conversation precedes it) |
| `grill-with-docs` (docs) | a small feature in a maintained project | the full cycle — the most maintainable route |

## Skill Sources

Every skill in `skills/` and every agent in `agents/` is an owned, tracked file, edited here directly. The sources below record provenance; skills and agents are not updated from upstream. Compound tags mark components merged from two or more sources.

| Source | Count | Components |
|--------|-------|------------|
| [mattpocock/skills](https://github.com/mattpocock/skills) | 13 skills + 1 agent | codebase-design, domain-modeling, grill-me, grill-with-docs, grilling, handoff, improve-codebase-architecture, prototype, research, teach, to-questionnaire, wayfinder, wizard; agent `spec-reviewer` |
| [taste-skill](https://github.com/Leonxlnx/taste-skill) | 1 | redesign-existing-projects |
| [ECC](https://github.com/affaan-m/ECC) | 10 skills + 1 agent | agent-architecture-audit, agent-introspection-debugging, database-migrations, e2e-testing, search-first, frontend-a11y, make-interfaces-feel-better, motion-ui, loop-design-check, inherit-legacy-style; agent `database-reviewer` |
| [gstack](https://github.com/garrytan/gstack) | 7 skills + 2 agents | ship, qa, diagram, land-and-deploy, document-release, document-generate, design-variants; agents `plan-reviewer`, `security-auditor` (no upstream: gstack ships skills only, so these are maintained locally) |
| superpowers (plugin, extracted) | 2 | receiving-code-review, verification-before-completion |
| [deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) | 1 | trim-session-leakage |
| [reverse-skill](https://github.com/zhaoxuya520/reverse-skill) | 2 | api-security, llm-security |
| Custom | 7 | bake-design, compact-pair, design-audit, open-questions, session-sync, setup-workflow, teach-back |
| Compound | 11 skills + 5 agents | skills: plan-from-design (custom + mattpocock + superpowers), build-brief (custom + mattpocock), build-feature (custom + mattpocock + superpowers), tdd (mattpocock + superpowers), diagnosing-bugs (mattpocock + superpowers), code-review (pr-review-toolkit + mattpocock + code-review plugin), writing-for-agents (mattpocock + superpowers), design-build (gstack + impeccable), design-consultation (gstack + impeccable), design-taste-frontend (taste-skill + impeccable), plan-review (gstack + impeccable, + its `lenses/`); agents: code-reviewer (pr-review-toolkit + mattpocock), silent-failure-hunter (ECC + pr-review-toolkit), pr-test-analyzer, type-design-analyzer (both pr-review-toolkit), code-simplifier (pr-review-toolkit + code-simplifier plugin) |

Not updated from upstream: upstream changes are adoption candidates, gated per the extraction philosophy in `.claude/rules/harness-maintenance.md`.

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
