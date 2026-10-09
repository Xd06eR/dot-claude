---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
---

# TypeScript/JavaScript Security

> This file extends [common/security.md](../common/security.md) with TypeScript/JavaScript specific content.

## Supply chain security

- Principle per [common/security.md](../common/security.md#mandatory-security-checks); npm mechanics below
- Run `npm audit` (or `pnpm audit`) in CI; trace flagged packages with `npm ls <package>`
- Pin exact versions in `package.json` (no `^`/`~`) and commit the lockfile
- Check the license before adding
