# TOOLKIT — Skill, Agent & Tool Catalog

**Usage**: phase-grouped index for skill, agent, and tool selection.

The **Skill invocation operative rule** + **phase-gate table** (must-fire skills per phase) live in CLAUDE.md; per-module descriptions live in each frontmatter (surfaced automatically), so not repeated here. Always scan all available skills + agents and pick the best fit; never limit yourself to what's listed.

## Browsing Strategy

| Task | Primary | Fallback |
|---|---|---|
| Library docs (React, Django, Prisma, etc.) | context7 MCP | — |
| General web browsing (articles, research) | playwright MCP | — |
| Page scraping / data extraction | playwright MCP | chrome-devtools-mcp evaluate |
| Debug, performance, a11y audit | chrome-devtools-mcp | — |

## Phase transitions
- `/plan-from-design` — Design→Plan: decompose baseline design docs into per-component spec + plan, then iterate on the artifacts within Plan.
- `/build-brief` — Plan→Build: one comprehensive build brief per feature (group of components).

## Maintenance
- `/harness-audit` — periodic drift audit of a harness or project dir (contradictions, stale refs, weak-model wording).

## Foundational
- `andrej-karpathy-skills:karpathy-guidelines`

## Design & Plan
- `superpowers:brainstorming` · `superpowers:writing-plans` · `grill-me` · `grill-with-docs` · `spec` · `design-consultation` · `design-html` · `design-variants` · `design-taste-frontend` · `search-first` · `prototype`

## Build
- `superpowers:test-driven-development` · `superpowers:subagent-driven-development` · `/feature-dev` · `/frontend-design` · `/impeccable` (disabled in settings.json) · `tdd` · `database-migrations` · `frontend-a11y` · `make-interfaces-feel-better` · `motion-ui`

## Refine
- `improve-codebase-architecture`

## QA
- `qa` · `e2e-testing`

## Review & Debug
- `/code-review` · `/security-review` · `pr-review-toolkit:review-pr` · `superpowers:requesting-code-review` · `superpowers:receiving-code-review` · `superpowers:systematic-debugging` · `diagnose` · `superpowers:verification-before-completion` · `teach-back`

## LLM/agent diagnostics
- `agent-architecture-audit` · `agent-introspection-debugging` · `eval-harness` · `context-budget` · `loop-design-check`

## Ship & Deploy
- `ship` · `land-and-deploy` · `deploy-watch` · `document-release`

## Docs & Artifacts
- `document-generate` · `diagram` · `make-pdf`

## Not workflow-phased (scenario / utility / meta)
- `inherit-legacy-style` · `redesign-existing-projects` · `handoff` · `teach` · `writing-great-skills` · `git-guardrails-claude-code`

## Plan Review
- `plan-review` (+ `skills/plan-review/lenses/{ceo,design,devex,eng}.md`; one `plan-reviewer` per lens)

## Agents
- `plan-reviewer` · `security-auditor` · `code-simplifier:code-simplifier` · `silent-failure-hunter` · `react-build-resolver` · `database-reviewer`

## Tools
- **LSP**: symbol navigation, type lookups, find-references.
- **MCP**: context7 · chrome-devtools-mcp · playwright (selection guide in Browsing Strategy above).
