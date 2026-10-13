---
name: motion-ui
description: UI motion system for React/Next.js. Covers tokens, springs, runtime gating, accessibility, and SSR safety. Use when implementing animations, transitions, or motion patterns.
origin: ECC
---

Production-ready UI motion system for React / Next.js.

Focused on **performance, accessibility, and usability** — not decoration.

## Core Principle

Motion must:

* Guide attention
* Communicate state
* Preserve spatial continuity

If it does none → remove it. On low-end devices, prefer responsiveness over smoothness.

---

## Non-Negotiable Rules

1. **Use `motion/react` only.** Never import from `framer-motion`. Never mix the two in the same tree — mixing causes conflicting internal schedulers and broken `AnimatePresence` contexts.
2. **`initial` must match server output.** If the server renders `opacity: 1`, the `initial` prop must also be `opacity: 1`. No exceptions.
3. **Reduced motion overrides everything.** When `useReducedMotion()` returns `true` or `prefersReduced` is `true`, all transforms are disabled. Opacity-only fades at ≤ 0.2s are the only permitted fallback.
4. **Never animate layout properties.** `width`, `height`, `top`, `left`, `margin`, `padding` are banned from `animate`. Use `transform` and `opacity` only.
5. **All token values come from `motionTokens`.** Hardcoded durations and easings in component files are forbidden.
6. **All spring configs come from the `springs` map.** Inline `stiffness`/`damping` values are forbidden.
7. **`"use client"` is required** on every file that imports from `motion/react`.
8. **Never read `window` or `navigator` at module level.** Always guard with `typeof window !== "undefined"`.

---

## Motion Tokens

```ts
// motionTokens.ts
export const motionTokens = {
  duration: {
    instant: 0.08,
    fast: 0.18,
    normal: 0.35,
    slow: 0.6,
    crawl: 1.0
  },
  easing: {
    smooth: [0.22, 1, 0.36, 1] as [number, number, number, number],
    sharp:  [0.4,  0, 0.2, 1] as [number, number, number, number],
    bounce: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
    linear: [0, 0, 1, 1] as [number, number, number, number]
  },
  distance: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 48
  },
  scale: {
    subtle: 0.98,
    press:  0.95,
    pop:    1.04
  }
}

export const springs = {
  snappy:  { type: "spring", stiffness: 300, damping: 30 },
  gentle:  { type: "spring", stiffness: 120, damping: 14 },
  bouncy:  { type: "spring", stiffness: 400, damping: 10 },
  instant: { type: "spring", stiffness: 600, damping: 35 },
  release: { type: "spring", stiffness: 200, damping: 20, restDelta: 0.001 }
}
```

Ambient loops (a skeleton pulse, a spinner) sit outside the token system by design — they are not UI state transitions.

Usage example:

```tsx
import { motionTokens } from "@/lib/motion-tokens"

<motion.div
  initial={{ opacity: 0, y: motionTokens.distance.md }}
  animate={{ opacity: 1, y: 0 }}
  transition={{
    duration: motionTokens.duration.normal,
    ease: motionTokens.easing.smooth
  }}
/>
```

---

## Decision Guidance

### Choosing a duration

| Token | Use when |
|-------|----------|
| `instant` | Tooltip show/hide, focus ring, badge update |
| `fast` | Button feedback, icon swap, chip toggle |
| `normal` | Modal open, card expand, page element enter |
| `slow` | Hero entrance, full-page transition |
| `crawl` | Deliberate storytelling; use sparingly |

### Choosing a spring

| Preset | Use when |
|--------|----------|
| `snappy` | Default UI — buttons, chips, nav items |
| `gentle` | Cards, modals, panels landing softly |
| `bouncy` | Playful moments — empty states, onboarding |
| `instant` | Tooltips, popovers, dropdowns |
| `release` | Drag release — natural physics feel |

### When to disable animation entirely

Disable (make `shouldAnimate()` return `false`) when:

* `prefersReduced` is `true`
* `isLowEnd` is `true` and the animation is non-essential
* The element is off-screen and will never enter the viewport
* The animation is purely decorative with no UX purpose

---

## Runtime Flags

Centralized gating for device capability and user preference:

```ts
// lib/motion-config.ts
export const motionConfig = {
  isLowEnd() {
    return (
      typeof navigator !== "undefined" && (
        (navigator.deviceMemory !== undefined && navigator.deviceMemory <= 2) ||
        (navigator.deviceMemory === undefined && navigator.hardwareConcurrency <= 4)
      )
    )
  },

  prefersReduced() {
    return (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
  },

  shouldAnimate({ essential = false } = {}) {
    if (this.prefersReduced()) return false
    if (!essential && this.isLowEnd()) return false
    return true
  },

  duration() {
    return this.isLowEnd() || this.prefersReduced()
      ? motionTokens.duration.instant
      : motionTokens.duration.normal
  }
}
```

---

## Accessibility

Priority order (highest to lowest):

1. `prefers-reduced-motion: reduce` — disables all transforms, limits opacity transitions to ≤ 0.2s
2. Low-end device detection — reduces duration, removes non-essential animations
3. Design preference — everything else

Motion must degrade gracefully. It must never disappear abruptly in a way that causes layout shift or confuses orientation.

### useSafeMotion Hook

```tsx
// hooks/use-reduced-motion.tsx
"use client"
import { useReducedMotion } from "motion/react"

export function useSafeMotion(fullY: number = 16) {
  const reduce = useReducedMotion()
  return {
    initial: { opacity: 0, y: reduce ? 0 : fullY },
    animate: { opacity: 1, y: 0 },
    exit:    { opacity: 0, y: reduce ? 0 : -fullY }
  }
}
```

### CSS

```css
@media (prefers-reduced-motion: reduce) {
  .motion-safe-transition {
    transition: opacity 0.2s;
  }

  .motion-reduce-transform {
    transform: none !important;
  }
}
```

### Tailwind

```html
<div class="motion-safe:animate-fade motion-reduce:opacity-100"></div>
```

---

## Architecture & Patterns

### Core Patterns

| Scenario | Pattern |
|---|---|
| Hover feedback | `whileHover` |
| Tap / press feedback | `whileTap` |
| Reveal on scroll | `whileInView` |
| Scroll-linked value | `useScroll` + `useTransform` |
| Conditional mount/unmount | `AnimatePresence` |
| Small layout shifts (single element, < ~300px change) | `layout` prop |
| Large layout shifts or full-page reflows | Avoid `layout`; use CSS transitions or page-level routing instead |
| Complex, imperative sequences | `useAnimate` |

> **Why avoid `layout` on large containers?** Framer's layout animation uses `transform` to reconcile positions, but on elements that span the full viewport or trigger deep reflow, the measurement cost causes visible jank and CLS.
>
> Prefer CSS Grid/Flexbox transitions or coordinate with `layoutId` on specific child elements only.

### Layout & Transitions

* Shared element transitions → `layoutId` (must be unique per mounted instance)
* Enter / exit transitions → `AnimatePresence` (see `mode` guidance below)

### AnimatePresence `mode`

Always specify `mode` explicitly — the default (`"sync"`) runs enter and exit simultaneously, which causes visual overlap in most UI patterns.

| `mode` | When to use |
|---|---|
| `"wait"` | Exit completes before enter starts. Use for **modals, toasts, page transitions**. |
| `"sync"` (default) | Enter and exit overlap. Use only when overlap is intentional (e.g., crossfade carousels). |
| `"popLayout"` | Exiting element is popped out of flow immediately; remaining items animate to fill. Use for **lists, tabs, dismissible cards**. |

```tsx
// Modal — always use "wait"
<AnimatePresence mode="wait">
  {open && <Modal key="modal" />}
</AnimatePresence>

// Dismissible list item — use "popLayout"
<AnimatePresence mode="popLayout">
  {items.map(item => <Card key={item.id} />)}
</AnimatePresence>
```

---

## Modal Essentials

* Focus trap
* Escape close
* Scroll lock
* ARIA roles
* Use `AnimatePresence mode="wait"` so exit animation completes before the next modal enters

---

## SSR Safety

* Match initial states between server and client renders
* Avoid implicit animation origins (always set `initial` explicitly)
* Wrap motion components in `"use client"` in Next.js App Router
* **Guard with mounted state** when `initial` differs from server output:

```tsx
// WRONG — server renders opacity:1 but initial says 0 → hydration mismatch
<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} />

// CORRECT — use AnimatePresence or defer to client mount
"use client"
const [mounted, setMounted] = useState(false)
useEffect(() => setMounted(true), [])

<motion.div
  initial={{ opacity: mounted ? 0 : 1 }}
  animate={{ opacity: 1 }}
/>
```

---

## Debugging

Check:

* Wrong import (mixing `motion/react` and `framer-motion`)
* Missing `"use client"` directive in Next.js App Router
* Missing `key` prop on `AnimatePresence` children
* Hydration mismatch (initial state differs between SSR and client)
* `layout` prop misuse on large containers causing reflow jank
* State-driven animation not triggering (check dependency arrays)

---

## QA

* No CLS
* Keyboard works
* Focus trapped in modals
* ARIA roles correct (`role="dialog"`, `aria-modal="true"`)
* Reduced motion respected (`useReducedMotion` + CSS media query)
* No hydration warnings in Next.js
* Animations stop cleanly on unmount (no memory leaks)
* `AnimatePresence mode` set explicitly on all usage sites

---

## Anti-Patterns

| Anti-pattern | Rule violated | Fix |
|-------------|---------------|-----|
| `import { motion } from "framer-motion"` | Rule 1 | Use `motion/react` |
| `initial={{ opacity: 0 }}` on SSR component | Rule 2 | Add mount guard |
| Skipping `useReducedMotion` check | Rule 3 | Use `useSafeMotion` hook |
| `animate={{ width: "100%" }}` | Rule 4 | Use `scaleX` transform instead |
| `transition={{ duration: 0.4 }}` inline | Rule 5 | Use `motionTokens.duration.normal` |
| `{ stiffness: 300, damping: 30 }` inline | Rule 6 | Use `springs.snappy` |
| Missing `"use client"` directive | Rule 7 | Add to top of file |
| `navigator.hardwareConcurrency` at module level | Rule 8 | Wrap in `typeof navigator !== "undefined"` |
| Animating layout properties (`width`, `height`, `top`, `left`) | — | Use `transform` and `opacity` |
| Infinite animations without purpose | — | Always ask: what state does this communicate? |
| Over-staggering lists | — | Keep `staggerChildren` ≤ 0.1s |
| Ignoring reduced motion preferences | — | Respect `prefers-reduced-motion` |
| Using `layout` on large or full-viewport containers | — | Avoid; causes reflow jank |
| Omitting `mode` on `AnimatePresence` | — | Default `"sync"` causes visual overlap |
| Using motion purely for decoration | — | Remove it |

---

## End-to-end example: tokens + springs + accessibility + SSR guard

```tsx
// components/fade-in-card.tsx
"use client"

import { useState, useEffect } from "react"
import { motion } from "motion/react"
import { motionTokens, springs } from "@/lib/motion-tokens"
import { useSafeMotion } from "@/hooks/use-reduced-motion"
import { motionConfig } from "@/lib/motion-config"

interface FadeInCardProps {
  children: React.ReactNode
  delay?: number
}

export function FadeInCard({ children, delay = 0 }: FadeInCardProps) {
  // SSR guard — initial must match server output (opacity: 1)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // Accessibility — disables transform when reduced motion is preferred
  const safeMotion = useSafeMotion(motionTokens.distance.md)

  // Device gate — skip animation on low-end hardware
  if (!motionConfig.shouldAnimate() || !mounted) {
    return <div>{children}</div>
  }

  return (
    <motion.div
      initial={safeMotion.initial}
      animate={safeMotion.animate}
      exit={safeMotion.exit}
      transition={{
        ...springs.gentle,
        delay,
      }}
      whileHover={{ scale: motionTokens.scale.pop }}
      whileTap={{ scale: motionTokens.scale.press }}
    >
      {children}
    </motion.div>
  )
}
```
