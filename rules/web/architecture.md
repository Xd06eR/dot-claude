---
paths:
  - "**/*.html"
  - "**/*.tsx"
  - "**/*.jsx"
  - "**/*.css"
  - "**/*.scss"
  - "**/*.sass"
  - "**/*.less"
---

# Web Architecture, Design Quality, and Performance

> Web-specific architecture, design-quality, and performance rules. Component patterns (compound components, container/presentational) live in [react/architecture.md](../react/architecture.md). They are React-specific and load alongside this file on `.tsx`/`.jsx`.

## Design quality

### Anti-template policy

Do not ship generic template-looking UI. Frontend output should look intentional, opinionated, and specific to the product.

Banned patterns:

- Default card grids with uniform spacing and no hierarchy
- Stock hero section with centered headline, gradient blob, and generic CTA
- Unmodified library defaults passed off as finished design
- Flat layouts with no layering, depth, or motion
- Uniform radius, spacing, and shadows across every component
- Safe gray-on-white styling with one decorative accent color
- Dashboard-by-numbers layouts with sidebar + cards + charts and no point of view
- Default font stacks used without a deliberate reason

Do not default to dark mode automatically. Choose the visual direction the product actually wants.

### Flow states

- Every async user flow ships all its states: loading, empty, error with retry, and visible success feedback.

### Component checklist

- [ ] Does it avoid looking like a default Tailwind or shadcn template?
- [ ] Does it have intentional hover/focus/active states?
- [ ] Does it use hierarchy rather than uniform emphasis?
- [ ] Would this look believable in a real product screenshot?
- [ ] If it supports both themes, do both light and dark feel intentional?

For full design work, use the design skills: `design-consultation` (system from scratch), `design-variants` (explore directions), `design-build` (production UI), `design-taste-frontend` (direction-inferred, taste-gated builds).

## Performance

### Core Web Vitals targets

| Metric | Target |
|--------|--------|
| LCP | < 2.5s |
| INP | < 200ms |
| CLS | < 0.1 |
| FCP | < 1.5s |
| TBT | < 200ms |

### Bundle budget

| Page Type | JS Budget (gzipped) | CSS Budget |
|-----------|---------------------|------------|
| Landing page | < 150kb | < 30kb |
| App page | < 300kb | < 50kb |
| Microsite | < 80kb | < 15kb |

### Font loading

- Max two font families unless there is a clear exception

### Animation performance

- Animate compositor-friendly properties only (allow/deny list: [coding-style.md](./coding-style.md#animation-only-properties))
- Use `will-change` narrowly and remove it when done

### Performance checklist

- [ ] All images have explicit dimensions
- [ ] No accidental render-blocking resources
- [ ] No layout shifts from dynamic content
- [ ] Motion stays on compositor-friendly properties
- [ ] Third-party scripts load async/defer and only when needed
