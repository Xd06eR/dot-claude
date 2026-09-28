---
name: search-first
description: "Use when about to write custom code for a problem that may have existing solutions: a new utility, helper, or abstraction, or adding a dependency or integration. Search repo, registries, GitHub, MCP, and skills before building."
origin: ECC
---

Systematizes the "search for existing solutions before implementing" workflow. Trivial checks run inline through the channel table; non-trivial functionality dispatches a research subagent.

## Channels and preflight

Check only the channels relevant to the task and project. State honestly which channels were searched and which were unavailable — an unavailable channel is not "nothing found".

| Channel | Check | If missing |
|---------|-------|------------|
| Repository search | `rg --files` and targeted `rg` queries | State that only visible files were inspected |
| Package registry | `npm --version`, `python -m pip --version`, or project package manager | Use web/docs search and avoid claiming registry coverage |
| GitHub CLI | `gh auth status` | Use public web or local git history only |
| MCP/docs tools | Available tool list or local MCP config | Fall back to official docs/web search |
| Skills directory | `ls ~/.claude/skills ~/.codex/skills` where applicable | Say no local skill catalog was available |

## Decision matrix

| Signal | Action |
|--------|--------|
| Exact match, well-maintained, MIT/Apache | **Adopt** — install and use directly |
| Partial match, good foundation | **Extend** — install + write thin wrapper |
| Multiple weak matches | **Compose** — combine 2-3 small packages |
| Nothing suitable found | **Build** — write custom, but informed by research |

## Full search (non-trivial functionality)

Dispatch a research subagent (per `~/.claude/rules/common/dispatch-protocol.md`) naming the need, the language/framework, the constraints, and the channels from the table. Returns: a structured comparison with a recommendation.

## Anti-patterns

- **Jumping to code:** Writing a utility without checking if one exists
- **Ignoring MCP:** Not checking if an MCP server already provides the capability
- **Silent skipping:** Reporting "nothing found" when a search channel was unavailable
- **Over-customizing:** Wrapping a library so heavily it loses its benefits
- **Dependency bloat:** Installing a massive package for one small feature
