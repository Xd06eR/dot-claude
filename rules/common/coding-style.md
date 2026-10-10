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

- **US English spelling:** -ize/-or forms (`normalize`, `color`, `behavior`).
- **Simplicity:** plain over clever unless cleverness is load-bearing.
- **Formatting:** the formatter owns code syntax.
- **Naming:** abbreviate in small scope, spell out cross-module; the language-specific rules override these defaults.

## Immutability

Prefer immutable patterns by default: create new objects rather than mutating shared state or inputs; local accumulators and hot paths may mutate.

## File organization

MANY SMALL FILES > FEW LARGE FILES:
- 200-400 lines typical
- Organize by feature/domain, not by type

## Error handling and input validation

Handle errors at the level that can act; never swallow one silently; UI gets user-safe actionable messages, logs get the detail. Validate external data at the system boundary, with a schema where available; never trust it.

## API response format

Match the project's existing response shape. When it has none, return errors as RFC 9457 problem details; whatever the shape, keep it consistent across endpoints.
