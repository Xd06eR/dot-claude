---
name: make-interfaces-feel-better
description: "Apply the small design-engineering details that compound into a polished interface: spacing, radius, optical alignment, shadows, text wrapping, hit areas, and CSS-level interaction states. Use when the UI feels off, flat, generic, cramped, or unfinished, or when a frontend review needs concrete before/after recommendations. For motion-system work (motion/react, springs, tokens), use motion-ui."
origin: ECC + impeccable
---

## Core Principles

### Concentric Radius

For nearby nested rounded surfaces:

```text
outer radius = inner radius + padding
```

If padding is large, treat layers as separate surfaces instead of forcing the math. The point is optical coherence, not formula worship.

### Optical Alignment

Geometric centering is not always visual centering. Icon buttons, play triangles, arrows, stars, and asymmetric icons often need a small offset. Fix the SVG when possible; otherwise adjust with a pixel-level margin or padding change.

### Spacing Rhythm

Create rhythm through deliberate contrast between tight and generous intervals: group by meaning with proximity before adding containers or decoration, and let hierarchy follow product priority. One spacing value repeated until everything has equal weight is not rhythm. Variation is not a goal by itself; repetition supports recognition, so break it only when content or priority changes.

### Shadows And Borders

Use borders for separation and focus rings. Use layered shadows when a card, button, dropdown, or popover needs depth. Shadows should be transparent and subtle enough to work across backgrounds. Depth has an offset: a shadow carries a vertical offset plus soft blur, and a zero-offset colored halo is decoration, not depth. Declare elevation once, border or shadow: a 1px border under a wide soft shadow is the ghost card.

### Text Wrapping

- Use `text-wrap: balance` on headings and short titles.
- Use `text-wrap: pretty` on short-to-medium body text, captions, descriptions, and list items.
- Avoid both on long prose, code, and preformatted content.
- Use `font-variant-numeric: tabular-nums` for counters, timers, prices, tables, and other updating numbers.
- Keep body copy in the 45-75ch measure, and tune line height inversely with the measure (wider lines need more leading).

### Light On Dark Compensation

Light text on a dark surface needs compensation on three perceptual axes: slightly more line height, a touch more tracking, and one step more weight when the face needs it.

### Paragraph Rhythm

Mark paragraph boundaries with spacing or with a first-line indent, not both; combining them double-marks the boundary.

### Font Smoothing

On macOS, apply antialiased font smoothing at the root layout when the project does not already do so:

```css
html {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### Image Outlines

Images often need a subtle inset outline so their edges do not blur into the surface.

```css
img {
  outline: 1px solid rgba(0, 0, 0, 0.1);
  outline-offset: -1px;
}

@media (prefers-color-scheme: dark) {
  img {
    outline-color: rgba(255, 255, 255, 0.1);
  }
}
```

Use neutral black or white alpha outlines. Do not tint image outlines with the brand palette.

### Motion

Use CSS transitions for interactive state changes because they can retarget when the user changes intent mid-motion. Reserve keyframes for staged one-shot entrances or loading sequences.

Good motion defaults:

- Enter: combine opacity, small `translateY`, and optionally blur.
- Exit: shorter and quieter than enter, usually 150ms.
- Press: `scale(0.95)` for tactile buttons, with a way to disable it when the movement distracts.
- Icon swaps: cross-fade with opacity, scale, and blur instead of instant visibility toggles.

### Transition Scope

Never use `transition: all`. Specify the changed properties:

```css
.button {
  transition-property: transform, background-color, box-shadow;
  transition-duration: 150ms;
  transition-timing-function: ease-out;
}
```

Use `will-change` only for first-frame stutter on compositor-friendly properties such as `transform`, `opacity`, and `filter`. Never use `will-change: all`.

### Hit Areas

Interactive controls should have at least a 44x44px hit area. Expand with a pseudo-element when the visible icon is smaller, but do not let expanded hit areas overlap.

### Browser Surfaces

Theme the parts the browser draws for you: text selection color, the caret, scrollbars, focus rings, and underline offset all ship with browser defaults that belong to no design system. Theme them from the palette; this is the cheapest signal that a page was designed rather than assembled.

### Heading Spacing Rhythm

A heading gets more space above than below: the gap above separates it from the previous block, the smaller gap below binds it to its content. Judge the computed values, not the stylesheet's intent.

### Tinted Secondary Text

On a colored surface, secondary text is tinted from that surface's hue or set as the foreground at reduced opacity, never neutral gray; gray on color reads as mud.

## Review Output

When reviewing a UI polish pass, lead with the specificity verdict: could an unrelated product use this UI unchanged? If yes, say so; polish that leaves the surface category-interchangeable is not finished. For an interaction-heavy surface, walk the primary action as two or three personas the interface actually serves (an impatient power user, a confused first-timer, an accessibility-dependent user) and report what broke for each specifically, never generic concerns. If any planned check could not run (no way to see the render, a tool missing), the report's first line names what was skipped and why: a silently degraded review is a failed review.

Report concrete changes in before/after rows:

| Principle | Before | After |
| --- | --- | --- |
| Concentric radius | Same radius on parent and child | Parent radius accounts for padding |
| Tabular numbers | Counter shifts as digits change | Counter uses `tabular-nums` |
| Transition scope | `transition: all` | Explicit transition properties |

Include file paths and properties when they are not obvious from the snippets. Omit principles that you checked but did not change.

## Checklist

- Nested rounded elements are optically coherent.
- Icons are visually centered.
- Buttons, cards, and popovers use borders or shadows for the right reason.
- Headings and short text avoid awkward wrapping.
- Dynamic numbers use tabular numerals.
- Images have neutral outlines where needed.
- Enter and exit animations are split, subtle, and interruptible where appropriate.
- Buttons have tactile active states without exaggerated motion.
- `transition: all` and `will-change: all` are absent.
- Small controls still have usable hit areas.
- Browser surfaces (selection, caret, scrollbars, focus rings, underline offset) are themed from the palette.
- Headings carry more space above than below.
- Secondary text on colored surfaces is tinted, never gray.
- Shadows carry an offset; no zero-offset halos, and no border-plus-shadow ghost cards.
- Spacing rhythm contrasts tight and generous intervals; groups come from proximity before containers.
- Light text on dark surfaces is compensated (line height, tracking, weight).
- Paragraphs use spacing or indent, not both.
- Body copy holds a 45-75ch measure.
