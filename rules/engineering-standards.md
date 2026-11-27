---
paths:
  - "**/*.py"
  - "**/*.pyi"
  - "**/pyproject.toml"
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
  - "**/*.mjs"
  - "**/*.cjs"
  - "**/*.mts"
  - "**/*.cts"
  - "**/*.html"
  - "**/*.css"
  - "**/*.scss"
  - "**/*.sass"
  - "**/*.less"
  - "**/*.vue"
  - "**/*.svelte"
  - "**/*.astro"
  - "**/*.sh"
  - "**/*.bash"
  - "**/*.zsh"
  - "**/*.ps1"
  - "**/*.bat"
  - "**/*.cmd"
  - "**/*.sql"
  - "**/*.graphql"
  - "**/*.gql"
  - "**/*.proto"
  - "**/*.go"
  - "**/*.rs"
  - "**/*.java"
  - "**/*.kt"
  - "**/*.rb"
  - "**/*.php"
  - "**/*.c"
  - "**/*.h"
  - "**/*.cpp"
  - "**/*.hpp"
  - "**/*.cs"
  - "**/*.swift"
  - "**/Dockerfile*"
  - "**/Makefile"
  - "**/*.mk"
  - "**/*.yml"
  - "**/*.yaml"
  - "**/package.json"
  - "**/requirements*.txt"
  - "**/tsconfig*.json"
  - "**/*.mdx"
---

# Engineering Rules

## Security

Before ANY commit:

- [ ] XSS prevention
- [ ] CSRF tokens on cookie-authenticated web apps
- [ ] Every new route/endpoint defaults to authenticated; public only by declaration
- [ ] Auth/access checks fail closed on error; security-relevant events logged
- [ ] Rate limiting on auth and resource-intensive endpoints
- [ ] Dependencies vetted: audit on add, versions pinned, maintenance and provenance checked
- [ ] Sanitized user input in log messages (log injection)
- [ ] Auth checks enforced in the data layer, never only in the client

## Testing

- **Coverage:** use coverage to find untested paths, never as a target to hit; tests assert behavior, not lines executed. New behavior and logic carry the TDD loop; reversible, low-impact changes need no new tests. Broaden or repeat testing only on new changes, failures, or unresolved concerns.
- **Formal verification:** propose a TLA+ model when a race, retry, state machine, or parser can fail in ways tests cannot reach; propose a Lean proof when a small critical algorithm must hold for all inputs. Always a proposal, never unilateral.
- **Failing tests are reported, never gamed:** never delete, skip, or weaken a failing test or assertion to make the suite pass; report the failure and fix the code, or surface the conflict to the user.

## Error handling and suppressions

- **A catch earns its place:** a catch names the error it handles and either recovers or re-raises; a swallowing catch (empty body, log-and-forget, silent default) is a defect. A deliberate fallback carries its reason inline and a failure-path test.
- **Every suppression carries its justification inline:** a suppression that masks a correctness failure gets fixed, not kept.

## Comments

- **Only the non-obvious why:** a comment carries what code cannot express (an invariant, a constraint's origin); process narration ("// step 2") never qualifies.
- **A comment that states a rule is a missing check:** encode it as a type, runtime check, test, or lint rule.
- **Fix workarounds instead of explaining them:** a comment that justifies a shortcut ("for now", "temporary", "hack") marks the spot to fix, not to document.
