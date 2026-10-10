---
paths:
  - "**/*.py"
  - "**/*.pyi"
---

# Python Coding Style

> This file extends [common/coding-style.md](../common/coding-style.md) with Python specific content.

- Verification: `ruff check` → `ruff format` → `mypy` → `pytest`
- Immutability: use `@dataclass(frozen=True)` for value objects (principle per [common/coding-style.md](../common/coding-style.md)).
