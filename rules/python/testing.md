---
paths:
  - "**/*.py"
  - "**/*.pyi"
---

# Python Testing

> This file extends [common/testing.md](../common/testing.md) with Python specific content.

## Framework

Use **pytest** as the testing framework.

## Coverage

Measure coverage with `pytest --cov=src` (pytest-cov).

## Test organization

Use `pytest.mark` for test categorization:

```python
import pytest

@pytest.mark.unit
def test_calculate_total():
    ...
```

Register custom marks in `pyproject.toml` under `[tool.pytest.ini_options]` `markers = [...]` — unregistered marks warn on every run and fail under `--strict-markers`.