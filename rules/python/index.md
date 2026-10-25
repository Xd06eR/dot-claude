---
paths:
  - "**/*.py"
  - "**/*.pyi"
---

# Python Rules

> Python extension of the common rules. FastAPI application structure lives in [fastapi.md](fastapi.md).

## Architecture

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
- Import direction (the one-way rule per [common/index.md](../common/index.md#architecture)): `entrypoints` → `services` → `domain`, and anything but `domain/` → `infrastructure`.
- `__init__.py` carries re-exports only, or stays empty: pick one convention per project, never mix.
- Ship `py.typed` in typed packages so downstream type-checkers read the annotations.
- Keep `.pyi` stubs next to the module they describe; prefer inline annotations over stubs whenever the source is editable.

## Coding style

- **Verification:** `ruff check` → `ruff format` → `mypy` → `pytest`
- **Immutability:** use `@dataclass(frozen=True)` for value objects (principle per [common/index.md](../common/index.md#coding-style)).

## Security

- Enable ruff's `S` rule family (the flake8-bandit rules) in project config: scanning runs within the existing `ruff check` step. Standalone bandit covers rules ruff has not implemented (some S4xx are preview-only); use it only for those.

## Testing

- Use **pytest** as the testing framework; measure coverage with `pytest --cov=src` (pytest-cov).
- Use `pytest.mark` for test categorization; register custom marks in `pyproject.toml` under `[tool.pytest.ini_options]` `markers = [...]`: unregistered marks warn on every run and fail under `--strict-markers`.
