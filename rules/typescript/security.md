---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
---

# TypeScript/JavaScript Security

> This file extends [common/security.md](../common/security.md) with TypeScript/JavaScript specific content.

## Secret management

```typescript
const apiKey = process.env.OPENAI_API_KEY

if (!apiKey) {
  throw new Error('OPENAI_API_KEY not configured')
}
```

## Automated security

Automated scanning via the `security-guidance` plugin — see [common/security.md](../common/security.md#automated-security).

## Supply chain security

- Principle per [common/security.md](../common/security.md#mandatory-security-checks); npm mechanics below
- Run `npm audit` (or `pnpm audit`) on add and in CI; trace flagged packages with `npm ls <package>`
- Pin exact versions in `package.json` (no `^`/`~`) and commit the lockfile
- Check the license before adding

## Input validation

Use Zod for schema-based validation at API boundaries — see [typescript/coding-style.md](./coding-style.md#input-validation) for patterns.
