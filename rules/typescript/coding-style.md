---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
---

# TypeScript/JavaScript Coding Style

> This file extends [common/coding-style.md](../common/coding-style.md) with TypeScript/JavaScript specific content. Focus is on non-default project conventions; standard TS style is assumed.

## Types and Interfaces

- Add parameter and return types to exported functions, shared utilities, and public class methods
- Let TypeScript infer obvious local variable types
- Extract repeated inline object shapes into named types or interfaces

### Interfaces vs. Type Aliases

- Use `interface` for object shapes that may be extended or implemented
- Use `type` for unions, intersections, tuples, mapped types, and utility types
- Prefer string literal unions over `enum` unless `enum` is required for interoperability

```typescript
interface User {
  id: string
  email: string
}
type UserRole = 'admin' | 'member'
type UserWithRole = User & {
  role: UserRole
}
```

### Avoid `any`

- Avoid `any` in application code
- Use `unknown` for external or untrusted input, then narrow it safely
- Use generics when a value's type depends on the caller

```typescript
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return 'Unexpected error'
}
```

### React Props

- Define component props with a named `interface` or `type`
- Type callback props explicitly
- Do not use `React.FC` unless there is a specific reason to do so

Component shape and prop destructuring conventions live in [react/coding-style.md](../react/coding-style.md).

### JavaScript Files

- In `.js` and `.jsx` files, use JSDoc when types improve clarity and a TypeScript migration is not practical
- Keep JSDoc aligned with runtime behavior

## Immutability

Use spread for immutable updates; `Readonly<T>` for inputs you must not mutate. Principle in [common/coding-style.md](../common/coding-style.md).

```typescript
function updateUser(user: Readonly<User>, name: string): User {
  return { ...user, name }
}
```

## Input Validation

Use Zod for schema-based validation and infer types from the schema:

```typescript
const userSchema = z.object({
  email: z.email(),
  age: z.number().int().min(0).max(150),
})
type UserInput = z.infer<typeof userSchema>
const validated: UserInput = userSchema.parse(input)
```

## Verification

`eslint` → `prettier` → `tsc --noEmit` → `npm test` (vitest / jest)
