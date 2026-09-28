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

> Language-neutral module-boundary rules; where a language-specific `rules/<language>/architecture.md` exists, it carries the layout, layer names, and entry-file mechanics.

- Import a feature or package only through its public entry file (`index.ts` barrel, `__init__.py`), never deep-import a sibling's internal module — internals stay replaceable.
- Import direction flows one way, from the entry layer toward the domain; shared code imports nothing from feature code.
- Circular imports are banned. When two modules need each other, extract the shared concept into a third module; a lazy or dynamic work-around import signals a boundary problem.
- Entry files carry re-exports only, no logic.
- Feature-private helpers stay inside the feature; promote to shared only after a second feature needs them.
