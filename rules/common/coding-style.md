# Coding Style

## Immutability

Prefer immutable patterns by default — create new objects rather than mutating shared state or inputs; local accumulators and hot paths may mutate.

```
// Pseudocode
WRONG:  modify(original, field, value) → changes original in-place
CORRECT: update(original, field, value) → returns new copy with change
```

Rationale: Immutable data prevents hidden side effects, makes debugging easier, and enables safe concurrency.

## File Organization

MANY SMALL FILES > FEW LARGE FILES:
- High cohesion, low coupling
- 200-400 lines typical, 800 max
- Extract utilities from large modules
- Organize by feature/domain, not by type

## Error Handling

ALWAYS handle errors comprehensively:
- Handle errors at the level that can act; propagate otherwise — don't catch what you can't recover from
- Provide user-friendly error messages in UI-facing code
- Log detailed error context on the server side
- Never silently swallow errors

## Input Validation

ALWAYS validate at system boundaries:
- Validate all user input before processing
- Use schema-based validation where available
- Fail fast with clear error messages
- Never trust external data (API responses, user input, file content)

## API Response Format

Match the project's existing response shape. When it has none, return errors as RFC 9457 problem details; whatever the shape, keep it consistent across endpoints.

## Naming Conventions

> Language-specific rules in `rules/<language>/coding-style.md` override these defaults.

- Descriptive names; booleans prefer `is`, `has`, `should`, or `can` prefixes
- Interfaces, types, and components: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Abbreviate in small scope, spell out cross-module

## Code Smells to Avoid

### Deep Nesting

Prefer early returns over nested conditionals once the logic starts stacking.

### Magic Numbers

Use named constants for meaningful thresholds, delays, and limits.

### Long Functions

Split large functions into focused pieces with clear responsibilities.

## Code Quality Checklist

See [code-review.md](code-review.md#review-checklist) for the pre-complete checklist.
