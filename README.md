# ~/.claude Agent Harness

My git-tracked agent harness for Claude Code, kept at `~/.claude`.

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
| `CANON.md` | Harness rulings and maintenance rulebook |
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

Every skill in `skills/` and every agent in `agents/` is an owned, tracked file, edited here directly. The sources below record each component's primary origin; full merge provenance lives in each file's frontmatter `origin`.

| Source | Count | Components |
|--------|-------|------------|
| [mattpocock/skills](https://github.com/mattpocock/skills) | 16 skills + 1 agent | codebase-design, domain-modeling, grill-me, grill-with-docs, grilling, handoff, improve-codebase-architecture, prototype, research, teach, to-questionnaire, wayfinder, wizard, tdd, diagnosing-bugs, writing-for-agents; agent `spec-reviewer` |
| [taste-skill](https://github.com/Leonxlnx/taste-skill) | 2 | design-taste-frontend, redesign-existing-projects |
| [ECC](https://github.com/affaan-m/ECC) | 10 skills + 2 agents | agent-architecture-audit, agent-introspection-debugging, database-migrations, e2e-testing, search-first, frontend-a11y, make-interfaces-feel-better, motion-ui, loop-design-check, inherit-legacy-style; agents `database-reviewer`, `silent-failure-hunter` |
| [gstack](https://github.com/garrytan/gstack) | 10 skills + 2 agents | ship, qa, diagram, land-and-deploy, document-release, document-generate, design-build, design-consultation, design-variants, plan-review; agents `plan-reviewer`, `security-auditor` |
| [superpowers](https://github.com/obra/superpowers) | 2 | receiving-code-review, verification-before-completion |
| [claude-plugins-official](https://github.com/anthropics/claude-plugins-official) | 1 skill + 4 agents | code-review; agents `code-reviewer`, `pr-test-analyzer`, `type-design-analyzer`, `code-simplifier` |
| [deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) | 1 | trim-session-leakage |
| [reverse-skill](https://github.com/zhaoxuya520/reverse-skill) | 2 | api-security, llm-security |
| Custom | 10 | bake-design, compact-pair, design-audit, open-questions, session-sync, setup-workflow, teach-back, plan-from-design, build-brief, build-feature |

Not updated from upstream: upstream changes are adoption candidates, gated per the extraction philosophy in [CANON.md](CANON.md).

## Hooks

`settings.json` wires three PreToolUse `Bash` hooks; the two guard scripts are tracked in `hooks/` and their header comments are the source of truth.

| Hook | Purpose |
|------|---------|
| `rtk hook claude` | Token-optimized CLI proxy; requires RTK on `PATH` |
| `~/.claude/hooks/block-git-gh-mutations.sh` | Blocks `git`/`gh` mutations, keeping them user-run |
| `~/.claude/hooks/block-secret-paths.sh` | Blocks commands touching secret paths |

## Quick Reference

### Restore MCP servers

User-scope MCP registrations live in `~/.claude.json`, which is per-machine and untracked. One manual command after restore:

```bash
claude mcp add --scope user --transport http context7 https://mcp.context7.com/mcp
```

Register the plain URL as shown. Verify with `claude mcp list` (expect `Connected`).

## Security & credentials

**Adding a new credential:**

1. Never commit it: it lives in a gitignored file or as a local-only `settings.json` hunk that never gets staged.
2. If the agent must not read its file, block both paths: add a `Read(...)` rule to `permissions.deny`, and add a pattern to `SECRET_PATTERNS` in `hooks/block-secret-paths.sh`.
3. If it is a dangerous command (egress, install, remote access), add it to `permissions.ask`.
4. Restart Claude Code so hook edits load.

The full `allow` / `ask` / `deny` posture and the Anthropic-traffic disable flags live in `settings.json`; read it directly for the current set.
