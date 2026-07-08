# TOOLKIT — Skill, Agent & Tool Catalog

**Usage**: Reference for skill, agent, and tool selection by workflow phase.

The **Skill invocation operative rule** and **phase-gate table** (must-fire skills per phase) live in CLAUDE.md. This file is the fuller reference. Always scan all available skills + agents and pick the best fit; never limit yourself to what's listed here.

## Browsing Strategy

| Task | Primary | Fallback |
|---|---|---|
| Library docs (React, Django, Prisma, etc.) | context7 MCP | — |
| General web browsing (articles, research) | playwright MCP | — |
| Page scraping / data extraction | playwright MCP | chrome-devtools-mcp evaluate |
| Debug, performance, a11y audit | chrome-devtools-mcp | — |

## Foundational
- `andrej-karpathy-skills:karpathy-guidelines`: vibe-coding principles; re-anchor before non-trivial change.

## Design & Plan
- `superpowers:brainstorming` · `superpowers:writing-plans`: explore and structure.
- `grill-me` · `grill-with-docs`: stress-test by interview.
- `spec`: vague intent → executable spec, five phases.
- `design-consultation`: propose a full design system (aesthetic, type, color, motion) + previews.
- `design-html`: generate production HTML/CSS from a design (Pretext-native).
- `design-shotgun`: generate UI variants + comparison board + structured feedback.

## Build
- `superpowers:test-driven-development`: TDD workflow.
- `superpowers:subagent-driven-development`: dispatch + integrate subagents.
- `/feature-dev`: guided end-to-end feature build (alternative workflow).
- `/frontend-design`: distinctive visual design for new/reshaped UI.
- `/impeccable`: high-quality refinement pass (enable in settings.json first).

## QA
- `qa`: systematic web-app QA loop (navigate, test, fix).

## Review & Debug
- `/code-review`: diff review, severity levels; `ultra` = cloud multi-agent audit.
- `/security-review`: security audit of the diff.
- `pr-review-toolkit:review-pr`: multi-dimensional PR audit.
- `superpowers:requesting-code-review` · `receiving-code-review`: request & act on review.
- `superpowers:systematic-debugging` · `diagnose`: methodical / reproduce-fix loops.
- `superpowers:verification-before-completion`: pre-ship verification.

## Ship & Deploy
- `ship`: merge base, tests, diff review, VERSION, CHANGELOG, commit, push, PR.
- `land-and-deploy`: merge + deploy.
- `canary`: post-deploy monitoring.
- `document-release`: post-release doc update.
- `landing-report`: release-queue dashboard.

## Docs & Artifacts
- `document-generate`: docs from existing code.
- `diagram`: English/mermaid → diagram triplet (.excalidraw + source).
- `make-pdf`: markdown → publication-quality PDF.

## Verifier candidates (planned agent conversion)
Plan-review and security-audit work is verifier-shaped → best as fresh-context subagents (verifier beats self-critique). These skills are source material for forthcoming agents; until converted they run in-session.
- `plan-ceo-review` · `plan-design-review` · `plan-devex-review` · `plan-eng-review`: four plan-review lenses (pick one per plan).
- `cso`: Chief Security Officer deep-audit mode.
- `autoplan`: orchestrator; will dispatch the converted reviewers + synthesize.

## Long-running
- `/ralph-loop`: autonomous execution loop. Ask first; needs clean constraints.

## Agents
Dispatch as subagents, never slash.
- `code-simplifier:code-simplifier`: post-implementation clarity/consistency pass.
- `silent-failure-hunter`: swallowed errors, bad fallbacks, missing propagation.
- `react-build-resolver`: React build failures.

## Tools
- **LSP**: symbol navigation, type lookups, find-references.
- **MCP**: context7 (library docs), chrome-devtools-mcp (debug/perf/a11y), playwright (browser). Selection guide in the Browsing Strategy table above.