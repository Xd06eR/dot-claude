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

> Workflow support that extends CLAUDE.md: task tracking, minimal implementation, pre-implementation research, and PR guidance.

Research before coding. Planning, TDD, review follow CLAUDE.md's 4-phase workflow.

- **Code navigation:** use LSP for definitions, references, and symbols; grep is for text patterns.

## Task tracking

Track multi-step work in a manual file; the list verifies you understood the task and enables steering.

The list itself is a check: out-of-order, missing, extra, or wrong-granularity steps mean the task was misread — fix the understanding, not just the list.

## Minimal implementation

- **Reuse ladder, in order:** an existing helper or pattern in the codebase, then stdlib, then a native platform feature, then an already-installed dependency; a new dependency only when the gap is real (never for what a few lines can do). One line when one line works; the minimum code that works only after that.
- **Minimality never shortens the reading:** trace the whole flow, every file the change touches, before choosing the minimal change; a small diff in the wrong place is a second bug.
- **Bug fixes go to the root cause:** grep every caller of the code you are about to change; fix the shared cause once. Patching only the ticketed path leaves sibling callers broken.
- **Ship the minimal version and challenge the rest:** on a complex request, deliver the minimal version and state what was skipped and when to add it ("Did X; Y covers it. Need full X? Say so."); never stall on an answer you can default.
- **Deletion over addition:** when two fixes are otherwise equal, take the one that removes code.
- **The ladder never cuts:** trust-boundary input validation, error handling that prevents data loss, security measures, accessibility basics, or anything explicitly requested.

## Research & reuse

Mandatory once the reuse ladder above lands on a new capability or dependency:

- **Exhaust installed dependencies:** never assume a library lacks a capability without checking its documentation and types; prefer what the project already has over new code or new packages.
- **GitHub code search:** Run `gh search repos` and `gh search code` to find existing implementations, templates, and patterns before writing anything new.
- **Library docs:** Use Context7 or vendor docs before implementing.
- **Check package registries:** Search npm, PyPI, crates.io, and other registries before writing utility code. Prefer battle-tested libraries over hand-rolled solutions.
- **Search for adaptable implementations:** Look for open-source projects that solve 80%+ of the problem and can be forked, ported, or wrapped.
- **Evaluate skeleton/starter candidates in parallel:** when adopting one, dispatch parallel agents to score options on security, extensibility, and fitness for the target use case before cloning.
- Prefer adopting or porting a proven approach over writing net-new code when it meets the requirement.
- See `search-first` skill for structured research-before-coding workflow.

## Pull request workflow

When creating PRs:

1. Analyze full commit history (not just latest commit).
2. Use `git diff [base-branch]...HEAD` to see all changes.
3. Draft comprehensive PR summary.
4. Include test plan with TODOs.

> For the full development process (planning, TDD, code review) before git operations, see CLAUDE.md (Workflow — 4-phase section).
