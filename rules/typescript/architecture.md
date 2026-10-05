---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
---

# TypeScript/JavaScript Architecture

> This file extends [common/architecture.md](../common/architecture.md) with TypeScript/JavaScript layout and conventions. React component architecture lives in [react/architecture.md](../react/architecture.md).

## Directory shape

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

## Module boundaries

- Import direction (the one-way rule per [common/architecture.md](../common/architecture.md)): `app` → `features` → `shared`; `shared/` imports nothing from `features/`.

## Colocation

- Tests live beside the source (`foo.test.ts` next to `foo.ts`), not in a parallel `__tests__` tree, unless the project convention says otherwise.

## Path aliases

- Configure a root alias (`@/` → `src/`) in `tsconfig.json` and use it instead of `../../../` chains beyond one level.
- Keep aliases consistent across `tsconfig.json`, the bundler, and the test runner.

## Types

- A type lives in the feature that owns the concept; move it to `shared/types/` only when 2+ features import it.
- Export a feature's public types from its `index.ts`.
