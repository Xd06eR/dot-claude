# ADR Format

ADRs live in `docs/adr/` and use sequential numbering: `0001-slug.md`, `0002-slug.md`, etc. Create the directory lazily — only when the first ADR is needed.

An ADR is a **point-in-time snapshot of a decision**: it carries the context of the choice and pointers to the design. It does not carry the design.

## Two sources, one format

ADRs are written in two situations, always in this format:

- **At bake.** Every independently-reversible ruling from a baked entry becomes an ADR (see Granularity below). This is the primary source.
- **During ordinary design discussion.** Offer an ADR only when all three conditions under **When to offer an ADR** below are true.

## The guardrail: choice, never specification

- Correct: "Sessions expire after 30 days of inactivity." The value is itself the choice.
- Wrong: the migration DDL for the `expires_at` column the value lives in.

The test: **if canonical would rewrite it later, the ADR must not have copied it.** Point at the canonical doc instead. A choice that was made stays made, even after it is superseded; a copied spec goes stale and reads as current with no signal to the reader.

## Format

```md
# NNNN — {short title of the decision}

**Status:** accepted | superseded by NNNN
**Supersedes:** NNNN                (when applicable)

**Context.** What forced the decision — the defect, constraint, or gap, compressed to the failure it names.

**Decision.** What was chosen. One line per ruling absorbed. Choices only, with pointers to the canonical doc that carries the specification.

**Considered options.** Each rejected alternative and the specific reason it lost. Record only alternatives that were real: a rejection is worth its line only when the option is plausible enough to be proposed again.

**Consequences.** Blast radius, and what this constrains later. Absorbed minor rulings land here as one self-contained line each.
```

The fuller sections are the standard, not the exception: canonical carries the spec and code carries the behavior, but neither carries the why — the rejected options and the forces behind the choice live only here. A trivial ADR may still collapse to Context + Decision.

## Granularity

**One ADR per independently-reversible choice.** Not one per entry, not one per ruling. The test: could a future session reverse this choice without touching the others?

Execute the test per ruling: estimating per entry silently drops qualifying rulings.

Three-way placement, so nothing carrying a real trade-off is dropped:

| Ruling shape | Home |
|---|---|
| Independently reversible | its own ADR |
| Has a real rejected alternative but rides on another decision | a line in the parent's **Considered options** |
| Pure consequence, no alternative | a line in the parent's **Consequences** |

ADRs take their own numbering sequence: one entry can yield several ADRs, so ADR numbers cannot mirror entry numbers.

## Index

`docs/adr/README.md`, one row appended per ADR at write time. It renders as the folder's landing page, so discovery costs one file open.

| ADR | Title | Status | Canonical touched |
|---|---|---|---|

## Frozen body

The body is frozen at write: nothing in a written ADR is ever edited. `Status` is the single exception, flipped to `superseded by NNNN` when a later decision replaces it. This is what lets the model carry history that canonical deliberately discards.

Cross-reference only what outlives the register: other ADRs (`ADR-NNNN`) and canonical docs. Never cite open-question entry ids (`#NN`) — entries are deleted at bake or sweep, so the citation dies with its target and the frozen body cannot be repaired.

## When to offer an ADR (discussion source)

All three of these must be true:

1. **Hard to reverse** — the cost of changing your mind later is meaningful
2. **Surprising without context** — a future reader will look at the code and wonder "why on earth did they do it this way?"
3. **The result of a real trade-off** — there were genuine alternatives and you picked one for specific reasons

If a decision is easy to reverse, skip it: you'll just reverse it. If it's not surprising, nobody will wonder why. If there was no real alternative, there's nothing to record beyond "we did the obvious thing."

### What qualifies

- **Architectural shape.** "We're using a monorepo." "The write model is event-sourced, the read model is projected into Postgres."
- **Integration patterns between contexts.** "Ordering and Billing communicate via domain events, not synchronous HTTP."
- **Technology choices that carry lock-in.** Database, message bus, auth provider, deployment target. Not every library — just the ones that would take a quarter to swap out.
- **Boundary and scope decisions.** "Customer data is owned by the Customer context; other contexts reference it by ID only." The explicit no-s are as valuable as the yes-s.
- **Deliberate deviations from the obvious path.** "We're using manual SQL instead of an ORM because X." Anything where a reasonable reader would assume the opposite. These stop the next engineer from "fixing" something that was deliberate.
- **Constraints not visible in the code.** "We can't use AWS because of compliance requirements." "Response times must be under 200ms because of the partner API contract."
- **Rejected alternatives when the rejection is non-obvious.** If you considered GraphQL and picked REST for subtle reasons, record it: otherwise someone will suggest GraphQL again in six months.
