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

> Web-specific architecture, design-quality, and performance rules. Component patterns (compound components, container/presentational) live in [react/architecture.md](../react/architecture.md) — they are React-specific and load alongside this file on `.tsx`/`.jsx`.

## State management

Treat these separately:

| Concern | Tooling |
|---------|---------|
| Server state | server-cache library |
| Client state | app store or signals |
| URL state | search params, route segments |
| Form state | dedicated form state |

- Do not duplicate server state into client stores
- Derive values instead of storing redundant computed state

## URL as state

Persist shareable state in the URL:

- filters
- sort order
- pagination
- active tab
- search query

## Data fetching

### Stale-while-revalidate

- Return cached data immediately
- Revalidate in the background
- Prefer existing libraries instead of rolling this by hand

### Optimistic updates

- Snapshot current state
- Apply optimistic update
- Roll back on failure
- Emit visible error feedback when rolling back

### Parallel loading

- Fetch independent data in parallel
- Avoid parent-child request waterfalls
- Prefetch likely next routes or states when justified

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

### Component checklist

- [ ] Does it avoid looking like a default Tailwind or shadcn template?
- [ ] Does it have intentional hover/focus/active states?
- [ ] Does it use hierarchy rather than uniform emphasis?
- [ ] Would this look believable in a real product screenshot?
- [ ] If it supports both themes, do both light and dark feel intentional?

For full design work, use the design skills: `design-consultation` (system from scratch), `design-variants` (explore directions), `design-html` (production UI), `design-taste-frontend` (visual QA).

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

### Loading strategy

1. Inline critical above-the-fold CSS where justified
2. Preload the hero image and primary font only
3. Defer non-critical CSS or JS
4. Dynamically import heavy libraries

```js
const gsapModule = await import('gsap');
const { ScrollTrigger } = await import('gsap/ScrollTrigger');
```

### Image optimization

- Explicit `width` and `height`
- `loading="eager"` plus `fetchpriority="high"` for hero media only
- `loading="lazy"` for below-the-fold assets
- Prefer AVIF or WebP with fallbacks
- Never ship source images far beyond rendered size

### Font loading

- Max two font families unless there is a clear exception
- `font-display: swap`
- Subset where possible
- Preload only the truly critical weight/style

### Animation performance

- Animate compositor-friendly properties only (allow/deny list: [coding-style.md](./coding-style.md#animation-only-properties))
- Use `will-change` narrowly and remove it when done
- Prefer CSS for simple transitions
- Use `requestAnimationFrame` or established animation libraries for JS motion
- Avoid scroll handler churn; use IntersectionObserver or libraries that throttle via passive listeners/rAF

### Performance checklist

- [ ] All images have explicit dimensions
- [ ] No accidental render-blocking resources
- [ ] No layout shifts from dynamic content
- [ ] Motion stays on compositor-friendly properties
- [ ] Third-party scripts load async/defer and only when needed
