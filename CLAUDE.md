# Global Engineering Standards

## How to Work With Me

I am a Junior AI Engineer. I think in system design and trade-offs. I don't write code by hand — I design specifications, discuss intent, and verify output. You implement; I review every line before accepting.

- Pitch at AI-engineer level: lead with design choice, trade-off, what you ruled out.
- **When I ask "why", or when a call is non-obvious, go deep** — depth beats brevity.
- Name ambiguity instead of guessing. List readings, state default, proceed. If uncertain, ask; if unclear, stop.
- Push back *before* building when spec is flawed, simpler path exists, or constraint is missing.
- For long sessions, summarize changes for big-picture context before I read the diff. Focus on why and what to check.
- Surface design choices in output.

## Autonomy — Act vs Ask

- **Act without asking:** read/search codebase; run tests, linters, type-checks; draft code and plans; spin up subagents for research.
- **Ask first:** any destructive or irreversible op, adding a dependency, changing a public interface or schema, or edits that ripple beyond the task. State the action, then wait.

## Workflow — Vibe Coding

Follow 4-phase approach. Main agent orchestrates; subagents implement.

1. **Design** — Clarify requirements. State what to build, why, success criteria. Decompose into independent, low-coupling components. Interrogate ambiguity — identify unclear spec parts, list open questions, propose multiple interpretations before proceeding. *The conversation is the design artifact; the code is the deliverable.*
2. **Plan** — Write spec docs (.md) and task breakdown. Numbered checklist — each step states what it produces *and* how it's verified: `[Step] → verify: [check]`. Name risks and files/components you'll touch. Use Plan Mode for non-trivial work; exit only when every step has a check.
3. **Build** — Code against checklist. **One concern per prompt, tight diffs.** Catch scope creep → stop and slice smaller. Fan-out → dispatch subagents (Task tool, parallel calls), integrate output yourself. Each subagent implements one component, includes lint + format + type-check + tests, verifies before returning.
4. **Review** — Check diff against checklist and Principles. Verify against criteria set in advance — show evidence (test output, return value). Can't verify → don't ship.

Skip phases only for trivial changes — typo, rename, one-liner with zero ambiguity.

## Principles

Organized by phase.

### Design
- **Think** — State assumptions explicitly.
- **Decompose** — Break into independent, low-coupling components. Design for replaceability.
- **Plan** — Numbered checklist: what each step produces, how it's verified.
- **Goal** — Transform tasks into verifiable goals. Strong criteria = loop independently; weak criteria ('make it work') = constant clarification. "Fix bug" → "Write reproducing test, then pass."
- **Verify** — Every output checkable against criteria set in advance. Can't verify → can't ship.
- **Gravity** — Every output will be reviewed by another model. Any omission, shortcut, or unjustified simplification will be caught and flagged. Write accordingly.
- **Fidelity** — For documents, reports, and summaries: preserve all details. Prefer complete-but-segmented over terse-but-lossy.

### Build
- **Simplify** — Minimum code. No speculative features, no single-use abstractions. If 200 lines could be 50, rewrite. Guardrail against bloat, fragile abstractions, and trial residue — NOT a directive to pick simpler-but-worse. Simplicity is a tiebreaker. On axes that matter (correctness, performance, fitness, scalability), pick the best option, then make it as simple as that option allows. Premature optimization is the root of evil; so is premature simplicity.
- **KISS** — Simpler words, same meaning. If it needs a dictionary, rewrite. "Would a senior engineer say this is overcomplicated?"
- **Surgical** — Touch only what's required. Don't refactor adjacent code; every change traces to the request. Match style. Remove imports/variables/functions your changes made unused. Mention pre-existing dead code, don't delete it.
- **Test** — TDD / Red-Green. Write verification first, then make it pass.
- **YAGNI** — No "flexibility" not asked for. No error handling for impossible scenarios.

### Refine
- **Work** — Pass tests. Ship working thing first. Red → green.
- **Right** — Review, simplify, apply Rule-of-Three DRY. Only abstract after 2+ real cases exist; premature DRY creates fragile abstractions. Refactor while green.
- **Fast** — Profile first. Optimize only if metrics prove bottleneck is real.

## Code Style

- **Python:** `ruff check` → `ruff format` → `mypy` → `pytest`.
- **TypeScript / JavaScript:** `eslint` → `prettier` → `tsc --noEmit` → `npm test` (vitest / jest).
- **US English everywhere** — identifiers, comments, docs, commit messages: `normalize`, `color`, `behavior` (‑ze / ‑or).
- **Naming:** follow language convention (e.g. Python: `snake_case`, TS/JS: `camelCase`, CSS: `kebab-case`, etc.); descriptive, typically verb + noun; booleans = `is_` / `has_` / `should_` / `can_`; constants `SCREAMING_SNAKE_CASE`; private `_leading_underscore`. Abbreviate in small scope (`i`, `ctx`); spell out cross-module. Don't mix conventions within a module.
- **Comments explain *why*, not *what*** — non-obvious intent, trade-offs, gotchas. Docstrings on public APIs whose behavior isn't obvious from signature; skip obvious getters/setters.
- **Name the design choice.** On a non-obvious choice, leave one-line comment on *why* — not mechanics. No silent magic.
- Plain over clever unless cleverness is load-bearing.

## Language-Specific Rules

Rules live in `~/.claude/rules/`. **When starting work in a language, proactively read the relevant rules into context.**

- **Python** — python/coding-style.md · python/testing.md · python/security.md · python/fastapi.md · python/patterns.md
- **TypeScript** — typescript/coding-style.md · typescript/testing.md · typescript/security.md · typescript/patterns.md
- **Web** — web/coding-style.md · web/design-quality.md · web/performance.md · web/security.md · web/testing.md · web/patterns.md
- **Common** — common/development-workflow.md · common/testing.md · common/git-workflow.md · common/patterns.md

## Subagents over Agent Teams

Prefer **subagents** (Task tool — several calls in one message run in parallel) over agent teams. Subagents preserve my main context, run isolated, cost fewer tokens; agent teams add coordination overhead (shared board, team lead, messaging) that only pays off for long orchestrated runs.

Use when: task spans >2 files, independent work can run in parallel, or reviewer needs fresh context (security, types, adversarial diff).
Avoid when: single-file fix, one-shot call, or tight iteration loop.

**Main agent owns integration — never blind-accept subagent output; verify actual changes against success criteria.**

## Useful Skills

Auto-invoke when relevant. Heavy or long-running skills — ask first.

**Foundational**
- `/karpathy-guidelines` — vibe-coding principles. Most of this CLAUDE.md derives from it. Re-anchor before non-trivial change.

**Design & Plan**
- `/grill-me`, `/grill-with-docs` — stress-test plan by interview. Ask first.
- `superpowers:brainstorming` · `superpowers:writing-plans` — explore and structure.

**Build**
- `superpowers:test-driven-development` — TDD workflow.
- `superpowers:subagent-driven-development` — patterns for dispatching and integrating subagents.
- `/feature-dev` — guided feature build with codebase context.
- `/frontend-design` — frontend / UI work.
- `/impeccable` — high-quality refinement pass.
- `/code-simplifier` — refine clarity and consistency post-implementation.

**Review & Debug**
- `/code-review` — diff review with severity levels.
- `superpowers:requesting-code-review` — structured review request.
- `/pr-review-toolkit` — multi-dimensional PR audit (types, tests, silent failures, comments).
- `/diagnose` — disciplined reproduce → fix loop for hard bugs.
- `superpowers:systematic-debugging` — methodical debugging process.
- `superpowers:verification-before-completion` — pre-ship verification.

**Long-running**
- `/ralph-loop` — autonomous execution loop. Ask first; needs clean constraints.

**Tools**
- **LSP** — symbol navigation, type lookups, find-references.
- **MCP** — context7 (library docs), chrome-devtools-mcp (debug/perf), playwright (browser). Full strategy in `@GSTACK.md`.

## Git

- **Never run `git commit`, `git push`, or destructive ops.** Output exact command(s) as text for user to run manually.
- **No attribution on commits.** Never add `Co-authored-by`, `Generated-by-Claude`, or any assistant-origin markers to commit messages.
- One logical change per commit.
- Commit messages: subject line only, no body unless asked. Make the subject **descriptive** — name what the change actually does; don't sacrifice clarity for brevity (a longer, clear subject beats a terse, vague one). Conventional commits (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`, `perf:`, `ci:`).
- Resolve merge conflicts manually. Never `git push --force` without approval.

## Security

- Never commit secrets, API keys, or credentials.
- Never access sensitive directories (`~/.ssh`, `~/Library/Keychains`).

@GSTACK.md
@RTK.md
