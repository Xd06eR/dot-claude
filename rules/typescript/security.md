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

## Prototype pollution

Spreading untrusted JSON defines own properties (mass assignment: unexpected keys overwrite state). True prototype pollution needs a recursive-merge sink (`lodash.merge`, a deep `Object.assign`); audit those call sites hardest. Either way, parse before merging.
