---
paths:
  - "**/*.py"
  - "**/*.pyi"
---

# Python Rules

> Python extension of the common rules.

## Architecture

- Ship `py.typed` in typed packages so downstream type-checkers read the annotations.

## Coding style

- **Verification:** `ruff check` → `ruff format` → `mypy` → `pytest`
- **Validation:** use field constraints instead of hand-written validation when Pydantic can express the rule.

## Security

- Enable ruff's `S` rule family (the flake8-bandit rules) in project config: scanning runs within the existing `ruff check` step. Standalone bandit covers rules ruff has not implemented (some S4xx are preview-only); use it only for those.

## Testing

- Measure coverage with `pytest --cov=src` (pytest-cov).
