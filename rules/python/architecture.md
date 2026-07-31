---
paths:
  - "**/*.py"
  - "**/*.pyi"
---

# Python Architecture

> This file extends [common/coding-style.md](../common/coding-style.md#file-organization) with Python package-structure conventions. FastAPI application structure lives in [fastapi.md](fastapi.md).

## Directory Shape

Use the `src/` layout; each package hides its internals behind a public entry point:

```text
src/
├── myapp/
│   ├── __init__.py           # public API — the only import surface
│   ├── domain/               # business logic, no I/O imports
│   ├── services/             # use-case orchestration
│   ├── infrastructure/       # db, http clients, filesystem
│   └── entrypoints/          # CLI, API app construction, workers
└── py.typed                  # marks the package as typed
tests/                        # mirrors src/ structure
├── test_domain/
└── test_services/
pyproject.toml                # single project config root
```

## Module Boundaries

- Import a package only through its `__init__.py` — never deep-import a sibling package's internal module.
- Import direction flows one way: `entrypoints` → `services` → `domain`, and anything → `infrastructure`. `domain/` imports nothing from `infrastructure/`.
- Circular imports are banned. When two modules need each other, extract the shared concept into a third module; a lazy in-function import is a smell that names a boundary problem.
- Keep `__init__.py` to re-exports only, or keep it empty — pick one convention per project, never mix.

## Tests

- Tests live in a parallel `tests/` tree mirroring `src/` (`tests/test_services/test_billing.py` for `src/myapp/services/billing.py`), not beside the source.
- Feature-private helpers stay inside the package; promote to a shared module only after a second package needs them.

## Types

- Ship `py.typed` in typed packages so downstream type-checkers read the annotations.
- Keep `.pyi` stubs next to the module they describe; prefer inline annotations over stubs whenever the source is editable.
