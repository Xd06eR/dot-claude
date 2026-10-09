---
paths:
  - "**/*.py"
  - "**/*.pyi"
---

# Python Security

> This file extends [common/security.md](../common/security.md) with Python specific content.

- Enable ruff's `S` rule family (the flake8-bandit rules, natively re-implemented) in project config: scanning runs within the existing `ruff check` step. Standalone bandit is still maintained; use it only for rules ruff has not implemented (some S4xx are preview-only).