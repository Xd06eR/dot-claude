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

# Web Rules

> Web extension of [common/index.md](../common/index.md): design quality, performance, and frontend coding style. Component patterns live in [react/index.md](../react/index.md#architecture) (React-specific, loading alongside this file on `.tsx`/`.jsx`); security in [security.md](security.md) and [security-config.md](security-config.md); testing in [testing.md](testing.md).

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

- **Flow states:** every async user flow ships all its states: loading, empty, error with retry, and visible success feedback.

### Component checklist

- [ ] Does it avoid looking like a default Tailwind or shadcn template?
- [ ] Does it use hierarchy rather than uniform emphasis?
- [ ] Would this look believable in a real product screenshot?
- [ ] If it supports both themes, do both light and dark feel intentional?

For full design work, use the design skills: `design-consultation` (system from scratch), `design-variants` (explore directions), `design-build` (production UI), `design-taste-frontend` (direction-inferred, taste-gated builds).

## Performance

### Bundle budget

| Page Type | JS Budget (gzipped) | CSS Budget |
|-----------|---------------------|------------|
| Landing page | < 150kb | < 30kb |
| App page | < 300kb | < 50kb |
| Microsite | < 80kb | < 15kb |

- Max two font families unless there is a clear exception

### Animation performance

Animate compositor-friendly properties only:
- `transform`
- `opacity`
- `clip-path`
- `filter` (sparingly)

Avoid animating layout-bound properties:
- `width`
- `height`
- `top`
- `left`
- `margin`
- `padding`
- `border`
- `font-size`

- Use `will-change` narrowly and remove it when done
- Animation timelines: camelCase with intent (`heroRevealTimeline`)

## Coding style

- File organization: by feature or page/route area, not by file type (principle per [common/index.md](../common/index.md#coding-style)); the feature-app tree lives in [typescript/index.md](../typescript/index.md#architecture), per-component packaging in [react/index.md](../react/index.md#file-layout-per-component).

### CSS custom properties

Define design tokens as variables. Do not hardcode palette, typography, or spacing repeatedly:

```css
:root {
  --color-surface: oklch(98% 0 0);
  --color-text: oklch(18% 0 0);
  --color-accent: oklch(68% 0.21 250);

  --text-base: clamp(1rem, 0.92rem + 0.4vw, 1.125rem);
  --text-hero: clamp(3rem, 1rem + 7vw, 8rem);

  --space-section: clamp(4rem, 3rem + 5vw, 10rem);

  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
}
```
