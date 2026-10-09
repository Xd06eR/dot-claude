---
paths:
  - "**/*.py"
  - "**/*.pyi"
---

# Python Architecture

> This file extends [common/architecture.md](../common/architecture.md) with Python package-structure conventions. FastAPI application structure lives in [fastapi.md](fastapi.md).

## Directory shape

Use the `src/` layout; each package hides its internals behind a public entry point:

```text
src/
└── myapp/
    ├── __init__.py           # public API: the only import surface
    ├── py.typed              # marks the package as typed
    ├── domain/               # business logic, no I/O imports
    ├── services/             # use-case orchestration
    ├── infrastructure/       # db, http clients, filesystem
    └── entrypoints/          # CLI, API app construction, workers
tests/                        # mirrors src/ structure
├── test_domain/
└── test_services/
pyproject.toml                # single project config root
```

- Tests live in a parallel `tests/` tree, not beside the source.

## Module boundaries

- Import direction (the one-way rule per [common/architecture.md](../common/architecture.md)): `entrypoints` → `services` → `domain`, and anything but `domain/` → `infrastructure`.
- `__init__.py` carries re-exports only, or stays empty: pick one convention per project, never mix.
- Ship `py.typed` in typed packages so downstream type-checkers read the annotations.
- Keep `.pyi` stubs next to the module they describe; prefer inline annotations over stubs whenever the source is editable.
