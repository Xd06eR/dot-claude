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

The `security-guidance` plugin provides automatic scanning for TypeScript/JavaScript:
- Pattern warnings on dangerous patterns during Edit/Write
- LLM diff review after each turn
- Agentic commit review on `git commit`

See [common/security.md](../common/security.md#automated-security) for full details.

## Supply Chain Security

- Run `npm audit` (or `pnpm audit`) before adding dependencies and in CI
- Pin exact versions in production: no `^` or `~` ranges in `package.json`
- Use `npm ls <package>` to check dependency tree for known vulnerabilities
- Prefer packages with maintainers, recent updates, and clear license

## Input Validation

Use Zod for schema-based validation at API boundaries — see [typescript/coding-style.md](./coding-style.md#input-validation) for patterns.

## React-Specific Security

For React security concerns (XSS via dangerouslySetInnerHTML, Server Action validation, CSP, prototype pollution), see [react/security.md](../react/security.md).