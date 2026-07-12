---
paths:
  - "**/*.py"
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

- Use **bandit** for static security analysis:
  ```bash
  bandit -r src/
  ```

## Automated Security

The `security-guidance` plugin provides automatic Python security scanning:
- Pattern warnings on dangerous patterns during Edit/Write
- LLM diff review after each turn
- Agentic commit review on `git commit`

See [common/security.md](../common/security.md#automated-security) for full details.