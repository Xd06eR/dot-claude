# Development Workflow

> Workflow support that extends CLAUDE.md: pre-implementation research, task tracking, and PR guidance.

Research before coding. Planning, TDD, review follow CLAUDE.md's 4-phase workflow.

## TodoWrite

Use TodoWrite to track multi-step work, verify you understood the task, and enable real-time steering.

The list itself is a check: out-of-order, missing, extra, or wrong-granularity steps mean the plan was misread — fix the understanding, not just the list.

## Research & Reuse

Mandatory before any new implementation:

- **GitHub code search first:** Run `gh search repos` and `gh search code` to find existing implementations, templates, and patterns before writing anything new.
- **Library docs second:** Use Context7 or primary vendor docs to confirm API behavior, package usage, and version-specific details before implementing.
- **Check package registries:** Search npm, PyPI, crates.io, and other registries before writing utility code. Prefer battle-tested libraries over hand-rolled solutions.
- **Search for adaptable implementations:** Look for open-source projects that solve 80%+ of the problem and can be forked, ported, or wrapped.
- **Evaluate skeleton/starter candidates in parallel:** when adopting one, dispatch parallel agents to score options on security, extensibility, relevance, and fit before cloning.
- Prefer adopting or porting a proven approach over writing net-new code when it meets the requirement.
- See `search-first` skill for structured research-before-coding workflow.

## Commit Message Format

Follow CLAUDE.md (Git section): conventional commits, subject line only, no attribution. Body only if asked. Breaking changes keep the `!` marker in the subject.

## Pull Request Workflow

When creating PRs:

1. Analyze full commit history (not just latest commit).
2. Use `git diff [base-branch]...HEAD` to see all changes.
3. Draft comprehensive PR summary.
4. Include test plan with TODOs.

> For the full development process (planning, TDD, code review) before git operations, see CLAUDE.md (Workflow + Principles sections).
