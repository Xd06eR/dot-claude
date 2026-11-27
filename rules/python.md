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

- **Verification:** `ruff check` → `ruff format` → `mypy` → `pytest`
- **Coverage:** measure with `pytest --cov=src` (pytest-cov).
- **Ruff `S` family (bandit):** enable it in project config; scanning runs within the existing `ruff check` step. Standalone bandit only for rules ruff has not implemented.
- **Ruff `BLE001`, `DTZ`, `B006`:** enable alongside `S` for blind `except Exception`, timezone-naive datetimes, and mutable default arguments; keep `E722` (bare `except`) selected under any narrowed `select` list.
- **Never from memory:** confirm a framework API you have not verified this session against the installed version.
