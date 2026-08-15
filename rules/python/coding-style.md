---
paths:
  - "**/*.py"
  - "**/*.pyi"
---

# Python Coding Style

> This file extends [common/coding-style.md](../common/coding-style.md) with Python specific content.

## Standards

- Use **type annotations** on all function signatures

## Immutability

Principle per [common/coding-style.md](../common/coding-style.md) (Immutability); Python form:

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class User:
    name: str
    email: str
```

## Verification

`ruff check` → `ruff format` → `mypy` → `pytest`