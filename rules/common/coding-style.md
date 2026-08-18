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

# Coding Style

## Language and prose

- **US English everywhere:** identifiers, comments, docs, commit messages, e.g. `normalize`, `color`, `behavior` (-ize / -or).
- **Comments explain *why*, not *what*:** non-obvious intent, trade-offs, gotchas; on a non-obvious design choice, one line on *why* it was made. Docstrings on public APIs whose behavior isn't obvious from signature; skip obvious getters/setters.
- **Simplicity:** plain over clever unless cleverness is load-bearing.
- **Formatting:** the formatter owns code syntax. Atomicity still applies to comments, docstrings, and string literals; keep every token whole.

## Immutability

Prefer immutable patterns by default — create new objects rather than mutating shared state or inputs; local accumulators and hot paths may mutate.

## File organization

MANY SMALL FILES > FEW LARGE FILES:
- High cohesion, low coupling
- 200-400 lines typical, 800 max
- Extract utilities from large modules
- Organize by feature/domain, not by type

## Error handling

ALWAYS handle errors comprehensively:
- Handle errors at the level that can act; propagate otherwise — don't catch what you can't recover from
- Provide user-friendly error messages in UI-facing code
- Log detailed error context on the server side
- Never silently swallow errors

## Input validation

ALWAYS validate at system boundaries:
- Validate all user input before processing
- Use schema-based validation where available
- Fail fast with clear error messages
- Never trust external data (API responses, user input, file content)

## API response format

Match the project's existing response shape. When it has none, return errors as RFC 9457 problem details; whatever the shape, keep it consistent across endpoints.

## Naming conventions

> Language-specific rules in `rules/<language>/coding-style.md` override these defaults.

- Descriptive names; booleans prefer `is`, `has`, `should`, or `can` prefixes
- Interfaces, types, and components: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Abbreviate in small scope, spell out cross-module

## Code smells to avoid

### Deep nesting

Prefer early returns over deeply nested conditionals.

### Magic numbers

Use named constants for meaningful thresholds, delays, and limits.

### Long functions

Split large functions into focused pieces with clear responsibilities.

## Code quality checklist

See [code-review.md](code-review.md#review-checklist) for the pre-complete checklist.
