# TOOLKIT — Skill, Agent & Tool Catalog

**Usage**: phase-grouped index for skill, agent, and tool selection. The **Skill invocation operative rule** + **phase-gate table** (must-fire skills per phase) live in CLAUDE.md; per-module descriptions live in each frontmatter (surfaced automatically), so not repeated here. Always scan all available skills + agents and pick the best fit; never limit yourself to what's listed.

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
- `superpowers:brainstorming` · `superpowers:writing-plans` · `grill-me` · `grill-with-docs` · `spec` · `design-consultation` · `design-html` · `design-variants`

## Build
- `superpowers:test-driven-development` · `superpowers:subagent-driven-development` · `/feature-dev` · `/frontend-design` · `/impeccable` (enable in settings.json first)

## QA
- `qa`

## Review & Debug
- `/code-review` · `/security-review` · `pr-review-toolkit:review-pr` · `superpowers:requesting-code-review` · `superpowers:receiving-code-review` · `superpowers:systematic-debugging` · `diagnose` · `superpowers:verification-before-completion`

## LLM/agent diagnostics
- `agent-architecture-audit` · `agent-introspection-debugging` · `eval-harness` · `context-budget` · `loop-design-check` (agent-loop goal + runaway review)

## Ship & Deploy
- `ship` · `land-and-deploy` · `deploy-watch` · `document-release`

## Docs & Artifacts
- `document-generate` · `diagram` · `make-pdf`

## Plan Review
- `plan-review` — orchestrator; dispatches the four lenses as parallel `plan-reviewer` agents (+ `security-auditor` when the plan touches a security surface), merges reports, auto-resolves via 6 decision principles, surfaces taste calls. Lens files (data, not skills): `skills/plan-review/lenses/{ceo,design,devex,eng}.md` — dispatch one `plan-reviewer` per lens for a single-lens review without the orchestrator.

## Agents
Dispatch as subagents, never slash.
- `plan-reviewer` — reviews a plan/spec through ONE named lens file; one instance per lens, parallel.
- `security-auditor` — adversarial read-only audit (codebase, diff, or plan); STRIDE + severity-ranked findings + ship/block verdict.
- `code-simplifier:code-simplifier` — post-implementation clarity/consistency pass.
- `silent-failure-hunter` — swallowed errors, bad fallbacks, missing propagation.
- `react-build-resolver` — React build failures.
- `database-reviewer` — PostgreSQL query, schema, index, and RLS review.

## Tools
- **LSP**: symbol navigation, type lookups, find-references.
- **MCP**: context7 (library docs), chrome-devtools-mcp (debug/perf/a11y), playwright (browser). Selection guide in the Browsing Strategy table above.
