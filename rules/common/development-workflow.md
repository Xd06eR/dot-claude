# Development Workflow

> This file extends CLAUDE.md's Design phase with pre-implementation research.

Research before coding. Planning, TDD, review follow CLAUDE.md's 4-phase workflow.

## TodoWrite

Use TodoWrite to track multi-step work, verify you understood the task, and enable real-time steering. The list itself is a check: out-of-order, missing, extra, or wrong-granularity steps mean the plan was misread — fix the understanding, not just the list.

## Research & Reuse

Mandatory before any new implementation:

- **GitHub code search first:** Run `gh search repos` and `gh search code` to find existing implementations, templates, and patterns before writing anything new.
- **Library docs second:** Use Context7 or primary vendor docs to confirm API behavior, package usage, and version-specific details before implementing.
- **Check package registries:** Search npm, PyPI, crates.io, and other registries before writing utility code. Prefer battle-tested libraries over hand-rolled solutions.
- **Search for adaptable implementations:** Look for open-source projects that solve 80%+ of the problem and can be forked, ported, or wrapped.
- **Evaluate skeleton/starter candidates in parallel:** when adopting one, dispatch parallel agents to score options on security, extensibility, relevance, and fit before cloning.
- Prefer adopting or porting a proven approach over writing net-new code when it meets the requirement.
- See `search-first` skill for structured research-before-coding workflow.
