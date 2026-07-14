# Development Workflow

> This file extends CLAUDE.md's Design phase with pre-implementation research, and [git-workflow.md](./git-workflow.md) with commit standards.

Research before coding. Planning, TDD, review follow CLAUDE.md's 4-phase workflow.

## Feature Implementation Workflow

0. **Research & Reuse** _(mandatory before any new implementation)_
   - **GitHub code search first:** Run `gh search repos` and `gh search code` to find existing implementations, templates, and patterns before writing anything new.
   - **Library docs second:** Use Context7 or primary vendor docs to confirm API behavior, package usage, and version-specific details before implementing.
   - **Check package registries:** Search npm, PyPI, crates.io, and other registries before writing utility code. Prefer battle-tested libraries over hand-rolled solutions.
   - **Search for adaptable implementations:** Look for open-source projects that solve 80%+ of the problem and can be forked, ported, or wrapped.
   - Prefer adopting or porting a proven approach over writing net-new code when it meets the requirement.
   - See `search-first` skill for structured research-before-coding workflow.

1. **Plan First**
   - Create implementation plan before coding: PRD, architecture, task list
   - Identify dependencies and risks
   - Break down into phases
   - See the `spec` skill for turning intent into executable specs, or `writing-plans` skill for structured plan documents.

2. **TDD Approach**
   - Write tests first (RED)
   - Implement to pass tests (GREEN)
   - Refactor (IMPROVE)
   - Verify ≥80% coverage
   - See `tdd` skill and `test-driven-development` skill for full red-green-refactor workflow.

3. **Code Review**
   - Review immediately after writing code
   - Address CRITICAL and HIGH issues
   - Fix MEDIUM issues when possible
   - See [code-review.md](code-review.md) for review tools, checklist, and severity levels.

4. **Commit & Push**
   - Prepare detailed commit messages following conventional commits format
   - **Ask before committing or pushing**
   - See [git-workflow.md](./git-workflow.md) for commit message format and PR process

5. **Pre-Review Checks**
   - Verify all automated checks (CI/CD) are passing
   - Resolve any merge conflicts
   - Ensure branch is up to date with target branch
   - Only request review after these checks pass