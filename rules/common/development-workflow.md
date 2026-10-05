---
paths:
  - "**/*.py"
  - "**/*.pyi"
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
  - "**/*.mjs"
  - "**/*.cjs"
  - "**/*.mts"
  - "**/*.cts"
  - "**/*.html"
  - "**/*.css"
  - "**/*.scss"
  - "**/*.sass"
  - "**/*.less"
  - "**/*.vue"
  - "**/*.svelte"
  - "**/*.astro"
  - "**/*.sh"
  - "**/*.bash"
  - "**/*.zsh"
  - "**/*.ps1"
  - "**/*.bat"
  - "**/*.sql"
  - "**/*.graphql"
  - "**/*.gql"
  - "**/*.proto"
  - "**/*.go"
  - "**/*.rs"
  - "**/*.java"
  - "**/*.kt"
  - "**/*.rb"
  - "**/*.php"
  - "**/*.c"
  - "**/*.h"
  - "**/*.cpp"
  - "**/*.hpp"
  - "**/*.cs"
  - "**/*.swift"
  - "**/Dockerfile*"
  - "**/Makefile"
  - "**/*.mk"
---

# Development Workflow

> Workflow support that extends CLAUDE.md.

- **Code navigation:** use LSP for definitions, references, and symbols; grep is for text patterns.

## Task tracking

Track multi-step work in a manual file; the list verifies you understood the task and enables steering.

The list itself is a check: out-of-order, missing, extra, or wrong-granularity steps mean the task was misread — fix the understanding, not just the list.

## Minimal implementation

- **Reuse ladder, in order:** an existing helper or pattern in the codebase, then stdlib, then a native platform feature, then an already-installed dependency; a new dependency only when the gap is real (never for what a few lines can do). One line when one line works; the minimum code that works only after that.
- **Minimality never shortens the reading:** trace the whole flow, every file the change touches, before choosing the minimal change; a small diff in the wrong place is a second bug.
- **Bug fixes go to the root cause:** grep every caller of the code you are about to change; fix the shared cause once. Patching only the ticketed path leaves sibling callers broken.
- **Ship the minimal version and challenge the rest:** minimal in scope, never simpler-but-worse; the design axes follow CLAUDE.md (How to work with me). On a complex request, deliver the minimal version and state what was skipped and when to add it ("Did X; Y covers it. Need full X? Say so."); never stall on an answer you can default.
- **Deletion over addition:** when two fixes are otherwise equal, take the one that removes code.
- **Delete over compat:** an internal refactor deletes the superseded path outright, with no compat layers, deprecated shims, or double-write bridges for internal callers. Compatibility of external contracts (public APIs, migrations, persisted formats) is a separate, explicit decision.
- **The ladder never cuts:** trust-boundary input validation, error handling that prevents data loss, security measures, accessibility basics, or anything explicitly requested.

## Research & reuse

Mandatory once the reuse ladder above lands on a new capability or dependency: call the Skill tool with "search-first".

## Pull request workflow

When creating PRs, route through `ship`: it owns the readiness gates, the PR body, and the exact command set.

> For the full development process (planning, TDD, code review) before git operations, see CLAUDE.md (Workflow — 4-phase section).
