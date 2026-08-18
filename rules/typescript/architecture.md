---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
---

# TypeScript/JavaScript Architecture

> This file extends [common/coding-style.md](../common/coding-style.md#file-organization) with TypeScript/JavaScript module-structure conventions. React component architecture lives in [react/architecture.md](../react/architecture.md).

## Directory shape

Organize by feature; each feature folder hides its internals behind a public entry point:

```text
src/
├── features/
│   ├── auth/
│   │   ├── index.ts            # public API — the only import surface
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

- Import a feature only through its `index.ts` barrel — never deep-import a sibling feature's internal file.
- Import direction flows one way: `app` → `features` → `shared`. Nothing imports upward; `shared/` imports nothing from `features/`.
- Circular imports are banned. When two modules need each other, extract the shared concept into a third module both import.
- Keep barrels to re-exports only — no logic in `index.ts`.

## Colocation

- Tests live beside the source (`foo.test.ts` next to `foo.ts`), not in a parallel `__tests__` tree, unless the project convention says otherwise.
- Feature-private helpers stay inside the feature folder; promote to `shared/` only after a second feature needs them.

## Path aliases

- Configure a root alias (`@/` → `src/`) in `tsconfig.json` and use it instead of `../../../` chains beyond one level.
- Keep aliases consistent across `tsconfig.json`, the bundler, and the test runner.

## Types

- A type lives in the feature that owns the concept; move it to `shared/types/` only when 2+ features import it.
- Export a feature's public types from its `index.ts`.
