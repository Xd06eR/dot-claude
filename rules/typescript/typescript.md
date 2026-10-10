---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
  - "**/*.mjs"
  - "**/*.cjs"
  - "**/*.mts"
  - "**/*.cts"
---

# TypeScript/JavaScript Rules

> TypeScript/JavaScript extension of the common rules. React rules live in [react/react.md](../react/react.md).

## Architecture

Organize by feature; each feature folder hides its internals behind a public entry point:

```text
src/
├── features/
│   ├── auth/
│   │   ├── index.ts            # public API: the only import surface
│   │   ├── auth-service.ts
│   │   ├── auth-service.test.ts
│   │   └── types.ts
│   └── billing/
│       ├── index.ts
│       └── ...
├── shared/
│   ├── lib/                    # framework-free utilities
│   └── types/                  # cross-feature types
└── app/                        # composition root: wiring, routes, entry
```

- Colocate tests with the source (`foo.test.ts` next to `foo.ts`), not in a parallel `__tests__` tree, unless the project convention says otherwise.
- Import direction (the one-way rule per [common/common.md](../common/common.md#architecture)): `app` → `features` → `shared`; `shared/` imports nothing from `features/`.
- A type lives in the feature that owns the concept; move it to `shared/types/` only when 2+ features import it.
- Export a feature's public types from its `index.ts`.
- **Path aliases:** configure a root alias (`@/` → `src/`) in `tsconfig.json` and use it instead of `../../../` chains beyond one level; keep aliases consistent across `tsconfig.json`, the bundler, and the test runner.

## Coding style

Focus is on non-default project conventions; standard TS style is assumed.

- **Interfaces vs. type aliases:** `interface` for extensible object shapes; `type` for unions, intersections, tuples, mapped, and utility types; string literal unions over `enum` unless interop requires one.
- **Avoid `any` in application code:** use `unknown` for external or untrusted input, then narrow it safely; use generics when a value's type depends on the caller.
- **JavaScript files:** use JSDoc when types improve clarity and a TypeScript migration is not practical; keep JSDoc aligned with runtime behavior.
- **Immutability:** spread for immutable updates; `Readonly<T>` for inputs you must not mutate (principle per [common/common.md](../common/common.md#coding-style)).
- **Input validation:** use Zod for schema-based validation and infer types from the schema:

```typescript
const userSchema = z.object({
  email: z.email(),
  age: z.number().int().min(0).max(150),
})
type UserInput = z.infer<typeof userSchema>
const validated: UserInput = userSchema.parse(input)
```

- **Verification:** `eslint` → `prettier` → `tsc --noEmit` → `npm test` (vitest / jest)

## Security

- **Supply chain:** principle per [common/common.md](../common/common.md#mandatory-security-checks); run `npm audit` (or `pnpm audit`) in CI and trace flagged packages with `npm ls <package>`; pin exact versions in `package.json` (no `^`/`~`) and commit the lockfile; check the license before adding.
- **Prototype pollution:** spreading untrusted JSON defines own properties (mass assignment: unexpected keys overwrite state). True prototype pollution needs a recursive-merge sink (`lodash.merge`, a deep `Object.assign`); audit those call sites hardest. Either way, parse before merging.

## Testing

- Use **vitest** as the testing framework. Jest where the framework defaults to it (Next.js) or in legacy projects. Measure coverage with `vitest run --coverage`.
- **E2E:** see the `e2e-testing` skill for Playwright interaction rules and the flaky-test diagnosis loop.
