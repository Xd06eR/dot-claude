---
paths:
  - "**/*.py"
  - "**/*.pyi"
  - "**/pyproject.toml"
  - "**/ruff.toml"
  - "**/mypy.ini"
  - "**/setup.cfg"
---

# Python Rules

- Ship `py.typed` in typed packages so downstream type-checkers read the annotations.
- **Verification:** `ruff check` → `ruff format` → `mypy` → `pytest`
- Measure coverage with `pytest --cov=src` (pytest-cov).
- **Validation:** use field constraints instead of hand-written validation when Pydantic can express the rule.
- Enable ruff's `S` rule family (the flake8-bandit rules) in project config: scanning runs within the existing `ruff check` step. Standalone bandit covers rules ruff has not implemented (some S4xx are preview-only); use it only for those.
- Enable ruff's `BLE001` (blind `except Exception`), `DTZ` (timezone-naive datetimes), and `B006` (mutable default arguments) alongside the `S` family; keep `E722` (bare `except`, on via the default `E7` family) selected under any narrowed `select` list.
- Before using a framework API you have not verified this session, confirm the call against the installed version (`pip show`, introspection, or version-matched docs), never from memory.
