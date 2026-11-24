---
name: route
description: "Route a task to the right skill, agent, or pipeline entry, then run it: the development pipeline, design, verification, docs, sessions, security, data, and agents."
disable-model-invocation: true
origin: custom
---

Match the task to an entry below, state the pick with a one-line reason, then run it. Model-invoked targets: call the Skill tool with the skill's name. User-invoked targets (slash-marked): read `~/.claude/skills/<name>/SKILL.md` in full and follow it inline. Agent targets (marked dispatch): dispatch per dispatch-protocol. Confirm the pick with the user first when the target writes durable artifacts or runs long (`/bake-design`, `build-feature`, `/wayfinder`, the four `/create-*` and `/maintain-*` generators). No entry matches: scan `~/.claude/skills/*/SKILL.md` frontmatter and pick from the live inventory, never from memory.

## The pipeline

Development work enters the spine at the earliest unmet stage:

- Effort too big to decide in one session → /wayfinder (staging map of open questions, hands off to /bake-design)
- No settled design → /grill-me (rulings stay in conversation) or /grill-with-docs (capture rulings as docs along the way)
- Design settled → /bake-design (canonical design doc)
- Design doc exists → /plan-from-design (spec + plan pairs); plan-review as needed
- Spec and plan exist → /build-brief; brief exists → build-feature
- Settled design that fits one context → build-feature with no feature named (skips the brief)
- Diff ready → code-review; working app to verify → qa
- Session start or end → /session-sync; fresh project → /setup-workflow

## Design and UI

- Quick, direct visual design (no doc, no discussion process) → design-taste-frontend
- Durable visual system: discuss together, produce and maintain DESIGN.md → /design-consultation
- Settled direction (/design-consultation's output, mockup, written spec, agreed conversation direction) → design-build
- Contrasting options at any point in a design turn → design-variants
- Throwaway quick answer to a design question → prototype
- Existing UI polish: feel details → make-interfaces-feel-better; motion → motion-ui; accessibility → frontend-a11y
- Module interface or seam design → codebase-design; whole-codebase deepening scan → improve-codebase-architecture

Guard: design-build only runs on a settled direction; a from-scratch ask goes to design-taste-frontend (quick direct) or /design-consultation (durable doc).

## Verification and testing

- Test discipline (red → green; writing or reviewing tests) → tdd (auto-fires on builds)
- Playwright E2E work (suite setup, debugging, flakes), inside a build or standalone → e2e-testing (reference; qa's E2E regression invokes it by contract)
- Before claiming done, fixed, or passing → verification-before-completion (automatic gate)
- Hard bug or performance regression needing a feedback loop → diagnosing-bugs; ordinary bug fix with a clear cheap test path → tdd's bug-fix section
- Durable per-project verify harness (drive the app, capture evidence) → /create-verification-skill; drift upkeep → /maintain-verification-skill
- Property that must hold for all inputs or orderings (race, retry, state machine, parser, critical algorithm) → /create-formal-verification-skill; upkeep → /maintain-formal-verification-skill

## Docs and writing

- Generate missing docs from code (README, API reference, architecture, tutorials) → document-generate
- Write or edit agent-facing prose (skills, CLAUDE.md, AGENTS.md, tool definitions) → writing-for-agents (reference)
- Audit durable text for session-vantage leakage before canonizing → trim-session-leakage (follows writing-for-agents)
- Investigate a topic against primary sources, produce a findings file → research (quick lookups go to the Explore agent, not routed)

## Understanding and sessions

- Compact the session (produce the compact instruction and resume prompt) → /compact-pair
- Write a handoff document for a fresh session, another agent, or another project → /handoff
- Long-term teaching (multi-session course workspace) → /teach; end-of-session comprehension check → /teach-back
- A decision needs a third party's knowledge → /to-questionnaire
- Steps only a human can perform (provisioning, credentials, dashboards, one-off migrations) → /wizard

## Security, data, and agents

- API security assessment (REST, GraphQL, WebSocket) → api-security
- LLM or agent security assessment (prompt injection, tool abuse, RAG, memory) → llm-security
- Security audit (codebase, branch diff, design doc, ship gate) → dispatch security-auditor
- DB schema change, migration, zero-downtime deploy → database-migrations
- PostgreSQL review (queries, schema, RLS) → dispatch database-reviewer
- Agent app structural audit (pre-release or degradation) → agent-architecture-audit
- Live agent failure (stuck, burning tokens, drifting) → agent-introspection-debugging
- Agent loop goal, verifier, stop conditions → loop-design-check
- Dispatch a subagent or recover a struggling dispatch → dispatch-protocol (contract, auto-fires)
- Post-review simplification pass → dispatch code-simplifier (or code-review's simplify aspect)

The five code-review worker agents (code-reviewer, pr-test-analyzer, silent-failure-hunter, type-design-analyzer, spec-reviewer) and plan-reviewer are dispatched by their owning skills, never directly.
