# ~/.claude Agent Harness

My git-tracked agent harness for Claude Code.

## Tracked configuration

| Path | Description |
|---|---|
| `.claude/rules/` | Harness rule modules (project-scope: loads only in this repo) |
| `agents/` | Agent definitions |
| `hooks/` | Hooks (git/gh mutation + secret-path guards) |
| `rules/` | Engineering rules |
| `scripts/` | Probe scripts (proxy.mjs: Claude Code payload audit) |
| `skills/` | Skill modules (see Skill Sources) |
| `.gitattributes` | Line ending normalization (LF) |
| `.gitignore` | Allowlist configuration |
| `CANON.md` | Harness rulings and maintenance rulebook |
| `CLAUDE.md` | Global system instructions |
| `LICENSE` | MIT License |
| `README.md` | This document |
| `settings.json` | Settings and environment |

## The workflow spine

The pipeline in order: `setup-workflow` once per project · `session-sync` at session start and end · then per feature: grill-me / grill-with-docs → bake-design → plan-from-design → (plan-review, as needed) → build-brief → build-feature → (code-review, as needed) → qa. Each step's trigger and mechanics live in its skill's description and body.

**Layers are optional; the rest are phase artifacts:** `OPEN-QUESTIONS.md`, `CONTEXT.md`, `TODO.md` (default on), `PROGRESS-LOG.md`, `docs/adr/` are adopted per project as needed; `docs/design/`, `docs/plan/`, `docs/build/` are filled by the pipeline as work reaches each phase.

## The four workflow paths

Two axes, four paths. The docs axis picks the opening: `grill-me` keeps rulings in the conversation, `grill-with-docs` captures them as they are made. The spine axis picks how much of the spine runs: a settled design that fits one context builds directly via `build-feature` with no feature named (it steps back to `plan-from-design` past one context); anything bigger, or work that needs the full cycle to stay maintainable, runs the spine end to end. Planning always consumes a baked design, so a no-docs route bakes from the conversation first.

| Opening | Build directly | Plan first |
|---|---|---|
| `grill-me` | toy / quick work | quick work, planned |
| `grill-with-docs` | a small feature in a maintained project | the full cycle |

## Skill sources

Every skill and agent carries its primary source in frontmatter `origin` (`custom` for the hand-built ones). Adopted from:

- [claude-plugins-official](https://github.com/anthropics/claude-plugins-official)
- [deepseek-harness](https://github.com/deepseek-ai/deepseek-harness)
- [ECC](https://github.com/affaan-m/ECC)
- [gstack](https://github.com/garrytan/gstack)
- [impeccable](https://github.com/pbakaus/impeccable)
- [mattpocock/skills](https://github.com/mattpocock/skills)
- [pstack](https://github.com/cursor/plugins/tree/main/pstack)
- [reverse-skill](https://github.com/zhaoxuya520/reverse-skill)
- [superpowers](https://github.com/obra/superpowers)
- [taste-skill](https://github.com/Leonxlnx/taste-skill)

Upstream changes are adoption candidates, gated per the adoption review in [CANON.md](CANON.md#2-adopting-and-extracting-components).

## Hooks

`settings.json` wires PreToolUse hooks on `Bash` and `Agent`; the guard scripts are tracked in `hooks/` and their header comments are the source of truth.

| Hook | Purpose |
|------|---------|
| `rtk hook claude` | Token-optimized Bash proxy; requires RTK on `PATH` |
| `~/.claude/hooks/block-git-gh-mutations.sh` | Blocks dangerous `git`/`gh` mutations, keeping them user-run |
| `~/.claude/hooks/block-secret-paths.sh` | Backstops the Read-deny for secret paths |
| `~/.claude/hooks/block-agent-without-protocol.sh` | Blocks subagent dispatches with no prior dispatch-protocol skill invoke |

## Restore MCP servers

User-scope MCP registrations live in `~/.claude.json`, which is per-machine and untracked. One manual command after a fresh clone:

```bash
claude mcp add --scope user --transport http context7 https://mcp.context7.com/mcp
```

Register the plain URL as shown. Verify with `claude mcp list` (expect `Connected`).

## Security & credentials

**Protecting a new credential:**

1. If the agent must not read its file, block both paths: add a `Read(...)` rule to `permissions.deny`, and add a pattern to `SECRET_PATTERNS` in `hooks/block-secret-paths.sh`.
2. If the credential unlocks a dangerous command (egress, install, remote access), add the command to `permissions.ask`.

The full `allow` / `ask` / `deny` posture and the Anthropic-traffic disable flags live in `settings.json`; read it directly for the current set.
