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

# Architecture

> Language-neutral module-boundary and failure-design rules; where a language-specific `rules/<language>/architecture.md` exists, it carries the layout, layer names, and entry-file mechanics.

- Import a feature or package only through its public entry file (`index.ts` barrel, `__init__.py`), never deep-import a sibling's internal module: internals stay replaceable.
- Import direction flows one way, from the entry layer toward the domain; shared code imports nothing from feature code.
- Layer data models don't leak: transport, domain, persistence, and view models are separate types; validate and convert at the boundary, and share no mutable state across layers.
- Circular imports are banned. When two modules need each other, extract the shared concept into a third module; a lazy or dynamic work-around import signals a boundary problem.
- Entry files carry re-exports only, no logic.

## Concurrency and failure

- Side-effecting operations that can be retried or duplicated are idempotent (key, token, or uniqueness constraint).
- Every external call carries a timeout and a cancellation path; retries are bounded with backoff.
- Transaction boundaries are explicit; a partial write never passes as success.
- Queues and streams apply backpressure; no unbounded buffers.
- Every acquired resource has a release path on success, error, and cancel.
