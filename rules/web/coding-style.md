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

# Web Coding Style

> This file extends [common/coding-style.md](../common/coding-style.md) with web-specific frontend content.

## File organization

By feature or page/route area, not by file type (principle per [common/coding-style.md](../common/coding-style.md)). The visual/marketing-site shape below; the feature-app tree lives in [typescript/architecture.md](../typescript/architecture.md), per-component packaging in [react/coding-style.md](../react/coding-style.md#file-layout-per-component):

```text
src/
├── components/
│   ├── hero/
│   │   ├── Hero.tsx
│   │   ├── HeroVisual.tsx
│   │   └── hero.css
│   ├── data-table/
│   │   ├── DataTable.tsx
│   │   ├── DataTableRow.tsx
│   │   └── data-table.css
│   └── ui/
│       ├── Button.tsx
│       ├── SurfaceCard.tsx
│       └── AnimatedText.tsx
├── hooks/
│   ├── useReducedMotion.ts
│   └── useMediaQuery.ts
├── lib/
│   ├── animation.ts
│   └── color.ts
└── styles/
    ├── tokens.css
    ├── typography.css
    └── global.css
```

## CSS custom properties

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

## Animation-only properties

Prefer compositor-friendly motion:
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

## Semantic HTML first

Do not reach for generic wrapper `div` stacks when a semantic element exists. Label navs and sections: `aria-label` on `nav`, `aria-labelledby` pointing at the section heading.

## Naming

- CSS classes: kebab-case or utility classes
- Animation timelines: camelCase with intent (`heroRevealTimeline`)
