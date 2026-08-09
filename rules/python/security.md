---
paths:
  - "**/*.py"
  - "**/*.pyi"
---

# Python Security

> This file extends [common/security.md](../common/security.md) with Python specific content.

## Secret Management

```python
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.environ["OPENAI_API_KEY"]  # Raises KeyError if missing
```

## Security Scanning

- Enable ruff's `S` rule family (the flake8-bandit rules, natively re-implemented) in project config — scanning runs within the existing `ruff check` step. Standalone bandit is still maintained; use it only for rules ruff has not implemented (some S4xx are preview-only).

## Dependency Auditing

- Audit installed dependencies for known vulnerabilities with **pip-audit** (PyPA); it exits 1 on findings, so it gates CI.

## Automated Security

Automated scanning via the `security-guidance` plugin — see [common/security.md](../common/security.md#automated-security).