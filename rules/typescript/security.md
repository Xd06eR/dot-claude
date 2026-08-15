---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
---

# TypeScript/JavaScript Security

> This file extends [common/security.md](../common/security.md) with TypeScript/JavaScript specific content.

## Secret Management

```typescript
// NEVER: Hardcoded secrets
const apiKey = "sk-proj-xxxxx"

// ALWAYS: Environment variables
const apiKey = process.env.OPENAI_API_KEY

if (!apiKey) {
  throw new Error('OPENAI_API_KEY not configured')
}
```

## Automated Security

Automated scanning via the `security-guidance` plugin — see [common/security.md](../common/security.md#automated-security).

## Supply Chain Security

- Principle per [common/security.md](../common/security.md) (Review checklist); npm mechanics below
- Run `npm audit` (or `pnpm audit`) on add and in CI; trace flagged packages with `npm ls <package>`
- Pin exact versions in `package.json` (no `^`/`~`) and commit the lockfile
- Check the license before adding

## Input Validation

Use Zod for schema-based validation at API boundaries — see [typescript/coding-style.md](./coding-style.md#input-validation) for patterns.
